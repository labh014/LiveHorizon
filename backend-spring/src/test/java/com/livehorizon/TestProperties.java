package com.livehorizon;

import java.time.Duration;
import java.util.List;

import com.livehorizon.config.AppProperties;

import org.springframework.util.unit.DataSize;

/** Mirrors the application.yml defaults so unit tests stay independent of Spring. */
public final class TestProperties {

    private TestProperties() {
    }

    public static AppProperties defaults() {
        return new AppProperties(
                new AppProperties.Cors(List.of("http://localhost:5173")),
                new AppProperties.Auth(Duration.ofDays(1), Duration.ofHours(1), 10, Duration.ofMinutes(5)),
                new AppProperties.Socket(true, "0.0.0.0", 9092, "/socket.io", false, 200,
                        Duration.ofSeconds(25), Duration.ofSeconds(60)),
                new AppProperties.Storage("./build/test-uploads", "avatars", "/uploads",
                        List.of("image/png", "image/jpeg"), DataSize.ofMegabytes(5)),
                new AppProperties.Cloudinary("", "", "", "livehorizon/avatars"));
    }

    public static AppProperties withStorageDir(String localDir) {
        AppProperties base = defaults();
        return new AppProperties(
                base.cors(),
                base.auth(),
                base.socket(),
                new AppProperties.Storage(localDir, base.storage().avatarSubdir(),
                        base.storage().publicBasePath(), base.storage().allowedContentTypes(),
                        base.storage().maxSize()),
                base.cloudinary());
    }

    public static AppProperties withChatHistoryLimit(int limit) {
        AppProperties base = defaults();
        AppProperties.Socket socket = base.socket();
        return new AppProperties(
                base.cors(),
                base.auth(),
                new AppProperties.Socket(socket.enabled(), socket.hostname(), socket.port(),
                        socket.context(), socket.requireAuth(), limit,
                        socket.pingInterval(), socket.pingTimeout()),
                base.storage(),
                base.cloudinary());
    }
}
