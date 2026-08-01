package com.livehorizon.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.livehorizon.signaling.RoomRegistry;
import com.livehorizon.signaling.SignalingHandler;
import com.livehorizon.signaling.SocketHandshakeAuthorizer;
import com.livehorizon.signaling.SocketIoLifecycle;
import com.livehorizon.user.UserService;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "app.socket", name = "enabled", havingValue = "true", matchIfMissing = true)
public class SocketIoConfig {

    @Bean
    public SocketIOServer socketIOServer(AppProperties appProperties, UserService userService) {
        AppProperties.Socket socketProperties = appProperties.socket();

        com.corundumstudio.socketio.Configuration configuration =
                new com.corundumstudio.socketio.Configuration();
        configuration.setHostname(socketProperties.hostname());
        configuration.setPort(socketProperties.port());
        configuration.setContext(socketProperties.context());
        configuration.setPingInterval((int) socketProperties.pingInterval().toMillis());
        configuration.setPingTimeout((int) socketProperties.pingTimeout().toMillis());
        configuration.setAuthorizationListener(
                new SocketHandshakeAuthorizer(appProperties, userService));

        // setOrigin writes a single fixed Access-Control-Allow-Origin. With more
        // than one allowed origin, leave it unset so the request origin is
        // echoed, and let the handshake authorizer do the actual enforcement.
        var origins = appProperties.cors().allowedOrigins();
        if (origins != null && origins.size() == 1) {
            configuration.setOrigin(origins.get(0));
        }

        return new SocketIOServer(configuration);
    }

    @Bean
    public SignalingHandler signalingHandler(SocketIOServer server, RoomRegistry rooms) {
        SignalingHandler handler = new SignalingHandler(server, rooms);
        handler.register();
        return handler;
    }

    @Bean
    public SocketIoLifecycle socketIoLifecycle(SocketIOServer server,
                                               AppProperties appProperties,
                                               SignalingHandler signalingHandler) {
        // signalingHandler is injected purely to order listener registration
        // before the server starts accepting connections.
        return new SocketIoLifecycle(server, appProperties);
    }
}
