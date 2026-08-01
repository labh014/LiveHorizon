package com.livehorizon.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import com.livehorizon.config.AppProperties;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Fixed-window throttle on failed logins, keyed by username + client address.
 * In-memory by design: one node today, and swapping in Redis later only means
 * replacing this class.
 */
@Component
public class LoginRateLimiter {

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final AppProperties.Auth properties;
    private final Clock clock;

    public LoginRateLimiter(AppProperties appProperties, Clock clock) {
        this.properties = appProperties.auth();
        this.clock = clock;
    }

    public boolean isBlocked(String username, String clientAddress) {
        Window window = windows.get(key(username, clientAddress));
        return window != null
                && !isStale(window, clock.instant())
                && window.failures.get() >= properties.loginMaxAttempts();
    }

    public void recordFailure(String username, String clientAddress) {
        Instant now = clock.instant();
        windows.compute(key(username, clientAddress), (ignored, existing) -> {
            if (existing == null || isStale(existing, now)) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.failures.incrementAndGet();
            return existing;
        });
    }

    public void recordSuccess(String username, String clientAddress) {
        windows.remove(key(username, clientAddress));
    }

    public Duration retryAfter() {
        return properties.loginWindow();
    }

    @Scheduled(fixedDelayString = "PT5M")
    void evictExpiredWindows() {
        Instant now = clock.instant();
        windows.values().removeIf(window -> isStale(window, now));
    }

    private boolean isStale(Window window, Instant now) {
        return window.startedAt.plus(properties.loginWindow()).isBefore(now);
    }

    private String key(String username, String clientAddress) {
        return (username == null ? "" : username.toLowerCase()) + "|" + clientAddress;
    }

    private record Window(Instant startedAt, AtomicInteger failures) {
    }
}
