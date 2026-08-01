package com.livehorizon.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import com.livehorizon.TestProperties;
import com.livehorizon.common.ApiException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    private static final Instant NOW = Instant.parse("2026-08-01T12:00:00Z");

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(4); // low cost keeps the test fast
        userService = new UserService(userRepository, passwordEncoder, TestProperties.defaults(),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void registerHashesThePasswordRatherThanStoringIt() {
        when(userRepository.existsByUsername("ada")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.register("Ada Lovelace", "ada", "secret123");

        var saved = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getPassword()).isNotEqualTo("secret123");
        assertThat(passwordEncoder.matches("secret123", saved.getValue().getPassword())).isTrue();
    }

    @Test
    void registerRejectsADuplicateUsernameWith409() {
        when(userRepository.existsByUsername("ada")).thenReturn(true);

        assertThatThrownBy(() -> userService.register("Ada", "ada", "secret123"))
                .isInstanceOf(ApiException.class)
                .hasMessage("User existing")
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(userRepository, never()).save(any());
    }

    @Test
    void loginIssuesA64CharacterTokenWithTheConfiguredExpiry() {
        User user = new User("Ada", "ada", passwordEncoder.encode("secret123"));
        when(userRepository.findByUsername("ada")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String token = userService.login("ada", "secret123");

        assertThat(token).hasSize(64).matches("[0-9a-f]+");
        assertThat(user.getToken()).isEqualTo(token);
        assertThat(user.getTokenExpiry()).isEqualTo(NOW.plus(Duration.ofDays(1)));
    }

    @Test
    void loginWithAWrongPasswordIs401AndLeavesNoSession() {
        User user = new User("Ada", "ada", passwordEncoder.encode("secret123"));
        when(userRepository.findByUsername("ada")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.login("ada", "wrong"))
                .isInstanceOf(ApiException.class)
                .hasMessage("Invalid credentials")
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        assertThat(user.getToken()).isNull();
    }

    @Test
    void loginForAnUnknownUsernameIs404() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login("nobody", "secret123"))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void authenticateReturnsEmptyForAnUnknownToken() {
        when(userRepository.findByToken("nope")).thenReturn(Optional.empty());

        assertThat(userService.authenticate("nope")).isEmpty();
    }

    @Test
    void authenticateClearsAndRejectsAnExpiredSession() {
        User user = new User("Ada", "ada", "hash");
        user.setToken("stale");
        user.setTokenExpiry(NOW.minusSeconds(1));
        when(userRepository.findByToken("stale")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> userService.authenticate("stale"))
                .isInstanceOf(UserService.SessionExpiredException.class);

        assertThat(user.getToken()).isNull();
        assertThat(user.getTokenExpiry()).isNull();
    }

    @Test
    void authenticateSkipsTheWriteWhileTheTokenIsStillFresh() {
        User user = new User("Ada", "ada", "hash");
        user.setToken("fresh");
        // Refreshed a moment ago, so it is inside the 1h refresh threshold.
        user.setTokenExpiry(NOW.plus(Duration.ofDays(1)).minus(Duration.ofMinutes(5)));
        when(userRepository.findByToken("fresh")).thenReturn(Optional.of(user));

        assertThat(userService.authenticate("fresh")).containsSame(user);

        verify(userRepository, never()).save(any());
    }

    @Test
    void authenticateSlidesTheWindowOnceTheThresholdHasPassed() {
        User user = new User("Ada", "ada", "hash");
        user.setToken("aging");
        user.setTokenExpiry(NOW.plus(Duration.ofHours(2)));
        when(userRepository.findByToken("aging")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.authenticate("aging");

        assertThat(user.getTokenExpiry()).isEqualTo(NOW.plus(Duration.ofDays(1)));
        verify(userRepository).save(user);
    }

    @Test
    void updateProfileIgnoresABlankNameButAcceptsAClearedAvatar() {
        User user = new User("Ada", "ada", "hash");
        user.setAvatarUrl("https://cdn.example/old.png");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.updateProfile(user, "   ", "");

        assertThat(user.getName()).isEqualTo("Ada");
        assertThat(user.getAvatarUrl()).isEmpty();
    }
}
