package com.livehorizon.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableScheduling
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    public WebConfig(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    /** Serves locally stored avatars, mirroring the Node `/uploads` static mount. */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = Paths.get(appProperties.storage().localDir()).toAbsolutePath().normalize();
        String basePath = appProperties.storage().publicBasePath();
        registry.addResourceHandler(basePath + "/**")
                .addResourceLocations(root.toUri().toString());
    }
}
