package com.livehorizon.backend.socket;

import com.corundumstudio.socketio.SocketIOClient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class RoomManager {

    // Room path -> List of active client session UUIDs
    private final Map<String, List<UUID>> connections = new ConcurrentHashMap<>();
    
    // Room path -> List of chat messages
    private final Map<String, List<ChatMessage>> messages = new ConcurrentHashMap<>();
    
    // Client session UUID -> Connection timestamp
    private final Map<UUID, Long> timeOnline = new ConcurrentHashMap<>();
    
    // Client session UUID -> SocketIOClient object
    private final Map<UUID, SocketIOClient> socketClients = new ConcurrentHashMap<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String sender;
        private String data;
        private String socketIdSender;
    }

    public synchronized List<String> joinRoom(String path, SocketIOClient client) {
        UUID sessionId = client.getSessionId();
        socketClients.put(sessionId, client);
        timeOnline.put(sessionId, System.currentTimeMillis());

        connections.computeIfAbsent(path, k -> new CopyOnWriteArrayList<>());
        List<UUID> roomClients = connections.get(path);
        
        if (!roomClients.contains(sessionId)) {
            roomClients.add(sessionId);
        }

        
        List<String> clientIds = new ArrayList<>();
        for (UUID id : roomClients) {
            clientIds.add(id.toString());
        }
        return clientIds;
    }

    public synchronized String findRoomByClientId(UUID sessionId) {
        for (Map.Entry<String, List<UUID>> entry : connections.entrySet()) {
            if (entry.getValue().contains(sessionId)) {
                return entry.getKey();
            }
        }
        return null;
    }

    public synchronized List<UUID> getClientsInRoom(String path) {
        return connections.getOrDefault(path, new ArrayList<>());
    }

    public SocketIOClient getClient(UUID sessionId) {
        return socketClients.get(sessionId);
    }

    public void addMessage(String path, String sender, String data, String socketIdSender) {
        messages.computeIfAbsent(path, k -> new CopyOnWriteArrayList<>());
        messages.get(path).add(new ChatMessage(sender, data, socketIdSender));
    }

    public List<ChatMessage> getMessages(String path) {
        return messages.getOrDefault(path, new ArrayList<>());
    }

    public synchronized Map<String, List<UUID>> leaveRoom(SocketIOClient client) {
        UUID sessionId = client.getSessionId();
        socketClients.remove(sessionId);
        timeOnline.remove(sessionId);

        Map<String, List<UUID>> affectedRooms = new HashMap<>();

        for (Map.Entry<String, List<UUID>> entry : connections.entrySet()) {
            List<UUID> roomClients = entry.getValue();
            if (roomClients.contains(sessionId)) {
                roomClients.remove(sessionId);
                affectedRooms.put(entry.getKey(), new ArrayList<>(roomClients));
                
                if (roomClients.isEmpty()) {
                    connections.remove(entry.getKey());
                    messages.remove(entry.getKey()); // clean up messages when room is empty
                }
            }
        }
        return affectedRooms;
    }
}
