package com.livehorizon.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Clock;

import com.livehorizon.common.ApiException;
import com.livehorizon.config.AppProperties;
import com.livehorizon.user.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

/**
 * Filesystem-backed fallback. Note that on the current PM2 deployment the
 * working directory is wiped by every checkout, so this is only durable when
 * {@code UPLOAD_DIR} points outside the CI workspace.
 */
public class LocalAvatarStorage implements AvatarStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalAvatarStorage.class);

    private final AppProperties.Storage properties;
    private final Clock clock;
    private final Path avatarDirectory;

    public LocalAvatarStorage(AppProperties.Storage properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
        this.avatarDirectory = Paths.get(properties.localDir(), properties.avatarSubdir())
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public String store(User user, byte[] content, String contentType, String previousUrl) {
        String filename = "%s_%d.%s".formatted(
                AvatarNaming.safeUsername(user.getUsername()),
                clock.millis(),
                AvatarNaming.extensionFor(contentType));

        Path target = avatarDirectory.resolve(filename).normalize();
        if (!target.startsWith(avatarDirectory)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Upload failed");
        }

        try {
            Files.createDirectories(avatarDirectory);
            Files.write(target, content);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload avatar", ex);
        }

        deletePrevious(previousUrl);
        return "%s/%s/%s".formatted(properties.publicBasePath(), properties.avatarSubdir(), filename);
    }

    /** Keeps the directory from growing by one file per upload, forever. */
    private void deletePrevious(String previousUrl) {
        String prefix = properties.publicBasePath() + "/" + properties.avatarSubdir() + "/";
        if (previousUrl == null || !previousUrl.startsWith(prefix)) {
            return;
        }
        String previousName = previousUrl.substring(prefix.length());
        if (previousName.isBlank() || previousName.contains("/") || previousName.contains("\\")) {
            return;
        }
        try {
            Files.deleteIfExists(avatarDirectory.resolve(previousName).normalize());
        } catch (IOException ex) {
            log.warn("Could not delete replaced avatar {}", previousName, ex);
        }
    }
}
