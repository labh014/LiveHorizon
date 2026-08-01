package com.livehorizon.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import com.livehorizon.TestProperties;
import com.livehorizon.common.ApiException;
import com.livehorizon.config.AppProperties;
import com.livehorizon.user.User;
import com.livehorizon.user.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

class AvatarServiceTest {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-08-01T12:00:00Z"), ZoneOffset.UTC);

    @TempDir
    Path uploadRoot;

    private AppProperties properties;
    private AvatarService avatarService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        properties = TestProperties.withStorageDir(uploadRoot.toString());
        userService = mock(UserService.class);
        when(userService.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        avatarService = new AvatarService(
                new LocalAvatarStorage(properties.storage(), CLOCK), userService, properties);
    }

    @Test
    void storesThePngAndReturnsItsPublicUrl() {
        User user = new User("Ada", "ada", "hash");
        var file = new MockMultipartFile("avatar", "me.png", "image/png", new byte[] {1, 2, 3});

        String url = avatarService.upload(user, file);

        assertThat(url).isEqualTo("/uploads/avatars/ada_%d.png".formatted(CLOCK.millis()));
        assertThat(uploadRoot.resolve("avatars").resolve("ada_%d.png".formatted(CLOCK.millis())))
                .exists();
        assertThat(user.getAvatarUrl()).isEqualTo(url);
    }

    @Test
    void rejectsAnUnsupportedContentTypeWith415() {
        User user = new User("Ada", "ada", "hash");
        var file = new MockMultipartFile("avatar", "payload.svg", "image/svg+xml", new byte[] {1});

        assertThatThrownBy(() -> avatarService.upload(user, file))
                .isInstanceOf(ApiException.class)
                .hasMessage("Only PNG and JPG/JPEG are allowed")
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @Test
    void rejectsAnOversizedUploadWith413() {
        User user = new User("Ada", "ada", "hash");
        var file = new MockMultipartFile("avatar", "big.jpg", "image/jpeg", new byte[6 * 1024 * 1024]);

        assertThatThrownBy(() -> avatarService.upload(user, file))
                .isInstanceOf(ApiException.class)
                .hasMessage("File too large (max 5MB)")
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @Test
    void rejectsAMissingFileWith400() {
        User user = new User("Ada", "ada", "hash");

        assertThatThrownBy(() -> avatarService.upload(user, null))
                .isInstanceOf(ApiException.class)
                .hasMessage("No file uploaded")
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void acceptsAContentTypeCarryingACharsetParameter() {
        User user = new User("Ada", "ada", "hash");
        var file = new MockMultipartFile("avatar", "me.jpg", "image/jpeg; charset=binary", new byte[] {9});

        assertThat(avatarService.upload(user, file)).endsWith(".jpg");
    }

    @Test
    void aUsernameContainingPathSeparatorsCannotEscapeTheUploadDirectory() {
        User user = new User("Attacker", "../../etc/passwd", "hash");
        var file = new MockMultipartFile("avatar", "me.png", "image/png", new byte[] {1});

        String url = avatarService.upload(user, file);

        assertThat(url).doesNotContain("..").doesNotContain("etc/passwd");
        assertThat(uploadRoot.resolve("avatars")).isDirectoryContaining(
                path -> path.getFileName().toString().startsWith("______etc_passwd_"));
    }

    @Test
    void replacingAnAvatarDeletesTheFileItSupersedes() throws Exception {
        User user = new User("Ada", "ada", "hash");
        var first = new MockMultipartFile("avatar", "one.png", "image/png", new byte[] {1});
        String firstUrl = avatarService.upload(user, first);

        // A second clock tick so the generated filename differs.
        AvatarService later = new AvatarService(
                new LocalAvatarStorage(properties.storage(),
                        Clock.fixed(CLOCK.instant().plusSeconds(60), ZoneOffset.UTC)),
                userService, properties);
        var second = new MockMultipartFile("avatar", "two.png", "image/png", new byte[] {2});
        String secondUrl = later.upload(user, second);

        assertThat(secondUrl).isNotEqualTo(firstUrl);
        assertThat(Files.list(uploadRoot.resolve("avatars")).toList()).hasSize(1);
    }
}
