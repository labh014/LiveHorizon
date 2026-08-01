package com.livehorizon.config;

import java.time.Clock;

import com.livehorizon.storage.AvatarStorage;
import com.livehorizon.storage.CloudinaryAvatarStorage;
import com.livehorizon.storage.LocalAvatarStorage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    private static final Logger log = LoggerFactory.getLogger(StorageConfig.class);

    @Bean
    public AvatarStorage avatarStorage(AppProperties appProperties, Clock clock) {
        if (appProperties.cloudinary().isConfigured()) {
            log.info("Avatar storage: Cloudinary (folder={})", appProperties.cloudinary().folder());
            return new CloudinaryAvatarStorage(appProperties.cloudinary());
        }
        log.warn("Avatar storage: local filesystem at {}/{} - "
                        + "set CLOUDINARY_* to persist avatars across deploys",
                appProperties.storage().localDir(), appProperties.storage().avatarSubdir());
        return new LocalAvatarStorage(appProperties.storage(), clock);
    }
}
