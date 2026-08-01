package com.livehorizon.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import com.livehorizon.TestProperties;

import org.junit.jupiter.api.Test;

class LoginRateLimiterTest {

    private static final Instant START = Instant.parse("2026-08-01T12:00:00Z");
    private static final String ADDRESS = "203.0.113.7";

    @Test
    void blocksOnlyAfterTheConfiguredNumberOfFailures() {
        LoginRateLimiter limiter = limiterAt(START);

        for (int attempt = 0; attempt < 9; attempt++) {
            limiter.recordFailure("ada", ADDRESS);
            assertThat(limiter.isBlocked("ada", ADDRESS)).isFalse();
        }

        limiter.recordFailure("ada", ADDRESS);
        assertThat(limiter.isBlocked("ada", ADDRESS)).isTrue();
    }

    @Test
    void aSuccessfulLoginClearsTheCounter() {
        LoginRateLimiter limiter = limiterAt(START);
        for (int attempt = 0; attempt < 10; attempt++) {
            limiter.recordFailure("ada", ADDRESS);
        }

        limiter.recordSuccess("ada", ADDRESS);

        assertThat(limiter.isBlocked("ada", ADDRESS)).isFalse();
    }

    @Test
    void theBlockLiftsOnceTheWindowHasElapsed() {
        MutableClock clock = new MutableClock(START);
        LoginRateLimiter limiter = new LoginRateLimiter(TestProperties.defaults(), clock);
        for (int attempt = 0; attempt < 10; attempt++) {
            limiter.recordFailure("ada", ADDRESS);
        }
        assertThat(limiter.isBlocked("ada", ADDRESS)).isTrue();

        clock.advance(Duration.ofMinutes(6));

        assertThat(limiter.isBlocked("ada", ADDRESS)).isFalse();
    }

    @Test
    void oneClientCannotLockAnotherOut() {
        LoginRateLimiter limiter = limiterAt(START);
        for (int attempt = 0; attempt < 10; attempt++) {
            limiter.recordFailure("ada", ADDRESS);
        }

        assertThat(limiter.isBlocked("ada", "198.51.100.4")).isFalse();
    }

    private LoginRateLimiter limiterAt(Instant instant) {
        return new LoginRateLimiter(TestProperties.defaults(), Clock.fixed(instant, ZoneOffset.UTC));
    }

    private static final class MutableClock extends Clock {

        private Instant now;

        private MutableClock(Instant now) {
            this.now = now;
        }

        void advance(Duration amount) {
            now = now.plus(amount);
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
