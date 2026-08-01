package com.livehorizon.signaling;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.livehorizon.config.AppProperties;

import org.springframework.stereotype.Component;

/**
 * In-memory room membership and replay buffer.
 *
 * <p>Two things it fixes relative to the Node implementation: a socket's room is
 * looked up directly instead of scanning every room on disconnect, and a room's
 * chat history is released when the last member leaves rather than being kept
 * for the lifetime of the process.
 *
 * <p>Single-node only. Running more than one instance needs a shared backend
 * here plus a Socket.IO adapter.
 */
@Component
public class RoomRegistry {

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final Map<String, String> roomBySocketId = new ConcurrentHashMap<>();
    private final int historyLimit;

    public RoomRegistry(AppProperties appProperties) {
        this.historyLimit = appProperties.socket().chatHistoryLimit();
    }

    public JoinResult join(String roomName, String socketId) {
        while (true) {
            Room room = rooms.computeIfAbsent(roomName, ignored -> new Room());
            synchronized (room) {
                // The room may have been evicted by a concurrent leave() between
                // computeIfAbsent and acquiring the lock; retry with a fresh one.
                if (rooms.get(roomName) != room) {
                    continue;
                }
                room.members.add(socketId);
                roomBySocketId.put(socketId, roomName);
                return new JoinResult(List.copyOf(room.members), List.copyOf(room.history));
            }
        }
    }

    public Optional<LeaveResult> leave(String socketId) {
        String roomName = roomBySocketId.remove(socketId);
        if (roomName == null) {
            return Optional.empty();
        }
        Room room = rooms.get(roomName);
        if (room == null) {
            return Optional.empty();
        }
        synchronized (room) {
            room.members.remove(socketId);
            List<String> remaining = List.copyOf(room.members);
            if (room.members.isEmpty()) {
                rooms.remove(roomName, room);
                room.history.clear();
            }
            return Optional.of(new LeaveResult(roomName, remaining));
        }
    }

    /** Appends to the room's replay buffer and returns who should receive it. */
    public Optional<Broadcast> recordMessage(String socketId, String data, String sender) {
        String roomName = roomBySocketId.get(socketId);
        if (roomName == null) {
            return Optional.empty();
        }
        Room room = rooms.get(roomName);
        if (room == null) {
            return Optional.empty();
        }
        synchronized (room) {
            if (!room.members.contains(socketId)) {
                return Optional.empty();
            }
            room.history.addLast(new ChatMessage(data, sender, socketId));
            while (room.history.size() > historyLimit) {
                room.history.removeFirst();
            }
            return Optional.of(new Broadcast(roomName, List.copyOf(room.members)));
        }
    }

    /** True when both sockets are in the same room, which gates signal relaying. */
    public boolean sharesRoom(String socketId, String otherSocketId) {
        String roomName = roomBySocketId.get(socketId);
        return roomName != null && roomName.equals(roomBySocketId.get(otherSocketId));
    }

    public int roomCount() {
        return rooms.size();
    }

    public int connectedCount() {
        return roomBySocketId.size();
    }

    public record JoinResult(List<String> members, List<ChatMessage> history) {
    }

    public record LeaveResult(String roomName, List<String> remainingMembers) {
    }

    public record Broadcast(String roomName, List<String> members) {
    }

    private static final class Room {
        /** Insertion-ordered: the client's `user-joined` payload is position sensitive. */
        private final Set<String> members = new LinkedHashSet<>();
        private final Deque<ChatMessage> history = new ArrayDeque<>();
    }
}
