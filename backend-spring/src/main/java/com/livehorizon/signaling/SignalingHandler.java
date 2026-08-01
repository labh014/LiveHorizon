package com.livehorizon.signaling;

import java.util.List;
import java.util.UUID;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The Socket.IO contract the existing frontend speaks, unchanged:
 *
 * <pre>
 *   in  join-call    (room)
 *   out user-joined  (joinerSocketId, membersInRoom[])
 *   in  signal       (toSocketId, payload)      out signal (fromSocketId, payload)
 *   in  chat-message (data, sender)             out chat-message (data, sender, senderSocketId)
 *   out user-left    (socketId)
 * </pre>
 */
public class SignalingHandler {

    private static final Logger log = LoggerFactory.getLogger(SignalingHandler.class);

    private static final int MAX_ROOM_LENGTH = 512;
    private static final int MAX_MESSAGE_LENGTH = 4_000;
    private static final int MAX_SENDER_LENGTH = 64;
    private static final int MAX_SIGNAL_LENGTH = 64 * 1024;

    private final SocketIOServer server;
    private final RoomRegistry rooms;

    public SignalingHandler(SocketIOServer server, RoomRegistry rooms) {
        this.server = server;
        this.rooms = rooms;
    }

    public void register() {
        server.addConnectListener(client ->
                log.debug("socket connected: {}", client.getSessionId()));

        server.addEventListener("join-call", String.class,
                (client, room, ack) -> onJoinCall(client, room));

        server.addMultiTypeEventListener("signal",
                (client, args, ack) -> onSignal(client, args.get(0), args.get(1)),
                String.class, String.class);

        server.addMultiTypeEventListener("chat-message",
                (client, args, ack) -> onChatMessage(client, args.get(0), args.get(1)),
                String.class, String.class);

        server.addDisconnectListener(this::onDisconnect);
    }

    private void onJoinCall(SocketIOClient client, String room) {
        if (room == null || room.isBlank() || room.length() > MAX_ROOM_LENGTH) {
            log.debug("rejecting join-call with invalid room from {}", client.getSessionId());
            return;
        }

        String socketId = client.getSessionId().toString();
        RoomRegistry.JoinResult result = rooms.join(room, socketId);

        // Everyone in the room, the joiner included, learns the new membership.
        for (String memberId : result.members()) {
            sendTo(memberId, "user-joined", socketId, result.members());
        }

        // Replay what was said before this client arrived.
        for (ChatMessage message : result.history()) {
            client.sendEvent("chat-message", message.data(), message.sender(), message.socketIdSender());
        }
    }

    private void onSignal(SocketIOClient client, String targetSocketId, String payload) {
        if (targetSocketId == null || payload == null || payload.length() > MAX_SIGNAL_LENGTH) {
            return;
        }

        String socketId = client.getSessionId().toString();
        // The Node server relayed to any socket id. Restricting to the sender's own
        // room stops an outsider from injecting SDP/ICE into someone else's call.
        if (!rooms.sharesRoom(socketId, targetSocketId)) {
            log.debug("dropping cross-room signal from {} to {}", socketId, targetSocketId);
            return;
        }

        SocketIOClient target = clientFor(targetSocketId);
        if (target != null) {
            target.sendEvent("signal", socketId, payload);
        }
    }

    private void onChatMessage(SocketIOClient client, String data, String sender) {
        if (data == null || data.isEmpty() || data.length() > MAX_MESSAGE_LENGTH) {
            return;
        }

        String socketId = client.getSessionId().toString();
        String safeSender = truncate(sender == null || sender.isBlank() ? "Anonymous" : sender, MAX_SENDER_LENGTH);

        rooms.recordMessage(socketId, data, safeSender).ifPresent(broadcast -> {
            for (String memberId : broadcast.members()) {
                sendTo(memberId, "chat-message", data, safeSender, socketId);
            }
        });
    }

    private void onDisconnect(SocketIOClient client) {
        String socketId = client.getSessionId().toString();
        rooms.leave(socketId).ifPresent(result -> {
            for (String memberId : result.remainingMembers()) {
                sendTo(memberId, "user-left", socketId);
            }
        });
    }

    private void sendTo(String socketId, String event, Object... payload) {
        SocketIOClient target = clientFor(socketId);
        if (target != null) {
            target.sendEvent(event, payload);
        }
    }

    private SocketIOClient clientFor(String socketId) {
        try {
            return server.getClient(UUID.fromString(socketId));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    /** Exposed for the health indicator. */
    public List<String> describe() {
        return List.of(
                "rooms=" + rooms.roomCount(),
                "sockets=" + rooms.connectedCount());
    }
}
