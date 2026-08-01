package com.livehorizon;

import com.livehorizon.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class LiveHorizonApplication {

    public static void main(String[] args) {
        SpringApplication.run(LiveHorizonApplication.class, args);
    }
}
