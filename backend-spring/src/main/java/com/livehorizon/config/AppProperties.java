package com.livehorizon.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

/**
 * Every tunable in one place. Defaults live in application.yml so that nothing
 * here has to be guessed at from the code.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Cors cors,
        Auth auth,
        Socket socket,
        Storage storage,
        Cloudinary cloudinary) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Auth(
            Duration tokenTtl,
            Duration refreshThreshold,
            int loginMaxAttempts,
            Duration loginWindow) {
    }

    public record Socket(
            boolean enabled,
            String hostname,
            int port,
            String context,
            boolean requireAuth,
            int chatHistoryLimit,
            Duration pingInterval,
            Duration pingTimeout) {
    }

    public record Storage(
            String localDir,
            String avatarSubdir,
            String publicBasePath,
            List<String> allowedContentTypes,
            DataSize maxSize) {
    }

    public record Cloudinary(String cloudName, String apiKey, String apiSecret, String folder) {

        public boolean isConfigured() {
            return hasText(cloudName) && hasText(apiKey) && hasText(apiSecret);
        }

        private static boolean hasText(String value) {
            return value != null && !value.isBlank();
        }
    }
}
