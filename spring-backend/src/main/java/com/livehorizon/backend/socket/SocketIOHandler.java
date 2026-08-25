package com.livehorizon.backend.socket;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class SocketIOHandler {

    private final RoomManager roomManager;

    @Autowired
    public SocketIOHandler(SocketIOServer server, RoomManager roomManager) {
        this.roomManager = roomManager;
        
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        
       
        server.addEventListener("join-call", String.class, onJoinCall());
        server.addEventListener("signal", Object[].class, onSignal());
        server.addEventListener("chat-message", Object[].class, onChatMessage());
    }

    private ConnectListener onConnected() {
        return client -> {
            System.out.println("SOMETHING CONNECTED: SessionId = " + client.getSessionId());
        };
    }

    private DataListener<String> onJoinCall() {
        return (client, path, ackSender) -> {
            UUID sessionId = client.getSessionId();
            System.out.println("User joined call room: " + path + " (Client ID: " + sessionId + ")");

            List<String> clients = roomManager.joinRoom(path, client);

            // Broadcast 'user-joined' to all clients in the room
            for (String clientIdStr : clients) {
                try {
                    UUID id = UUID.fromString(clientIdStr);
                    SocketIOClient target = roomManager.getClient(id);
                    if (target != null) {
                        target.sendEvent("user-joined", sessionId.toString(), clients);
                    }
                } catch (Exception e) {
                    System.err.println("Error broadcasting user-joined: " + e.getMessage());
                }
            }

            // Feed chat history to the newly joined user
            List<RoomManager.ChatMessage> chatHistory = roomManager.getMessages(path);
            for (RoomManager.ChatMessage msg : chatHistory) {
                client.sendEvent("chat-message", msg.getData(), msg.getSender(), msg.getSocketIdSender());
            }
        };
    }

    private DataListener<Object[]> onSignal() {
        return (client, data, ackSender) -> {
            if (data.length < 2) return;
            
            String toIdStr = (String) data[0];
            Object message = data[1];

            try {
                UUID targetId = UUID.fromString(toIdStr);
                SocketIOClient target = roomManager.getClient(targetId);
                if (target != null) {
                    target.sendEvent("signal", client.getSessionId().toString(), message);
                }
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid target UUID in signal: " + toIdStr);
            }
        };
    }

    private DataListener<Object[]> onChatMessage() {
        return (client, data, ackSender) -> {
            if (data.length < 2) return;

            String msgBody = (String) data[0];
            String senderName = (String) data[1];
            UUID senderId = client.getSessionId();

            String matchingRoom = roomManager.findRoomByClientId(senderId);
            if (matchingRoom != null) {
                roomManager.addMessage(matchingRoom, senderName, msgBody, senderId.toString());
                System.out.println("Chat Message in " + matchingRoom + " -> " + senderName + ": " + msgBody);

                List<UUID> roomClients = roomManager.getClientsInRoom(matchingRoom);
                for (UUID clientId : roomClients) {
                    SocketIOClient target = roomManager.getClient(clientId);
                    if (target != null) {
                        target.sendEvent("chat-message", msgBody, senderName, senderId.toString());
                    }
                }
            }
        };
    }

    private DisconnectListener onDisconnected() {
        return client -> {
            UUID sessionId = client.getSessionId();
            System.out.println("CLIENT DISCONNECTED: SessionId = " + sessionId);

            Map<String, List<UUID>> affectedRooms = roomManager.leaveRoom(client);

            for (Map.Entry<String, List<UUID>> entry : affectedRooms.entrySet()) {
                List<UUID> remainingClients = entry.getValue();
                for (UUID clientId : remainingClients) {
                    SocketIOClient target = roomManager.getClient(clientId);
                    if (target != null) {
                        target.sendEvent("user-left", sessionId.toString());
                    }
                }
            }
        };
    }
}
