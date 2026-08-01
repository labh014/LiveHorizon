package com.livehorizon.signaling;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/** Surfaces live room/socket counts on /actuator/health. */
@Component
public class SignalingHealthIndicator implements HealthIndicator {

    private final RoomRegistry rooms;

    public SignalingHealthIndicator(RoomRegistry rooms) {
        this.rooms = rooms;
    }

    @Override
    public Health health() {
        return Health.up()
                .withDetail("rooms", rooms.roomCount())
                .withDetail("connectedSockets", rooms.connectedCount())
                .build();
    }
}
