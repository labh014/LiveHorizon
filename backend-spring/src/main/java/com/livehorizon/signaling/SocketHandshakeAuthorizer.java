package com.livehorizon.signaling;

import java.util.List;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.AuthorizationResult;
import com.corundumstudio.socketio.HandshakeData;
import com.livehorizon.config.AppProperties;
import com.livehorizon.user.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Gate on the Socket.IO handshake. The Node server accepted every connection
 * from every origin; this checks the browser's Origin against the same
 * allowlist the REST API uses, and — once
 * {@code app.socket.require-auth} is on — the session token as well.
 */
public class SocketHandshakeAuthorizer implements AuthorizationListener {

    private static final Logger log = LoggerFactory.getLogger(SocketHandshakeAuthorizer.class);

    private final List<String> allowedOrigins;
    private final boolean requireAuth;
    private final UserService userService;

    public SocketHandshakeAuthorizer(AppProperties appProperties, UserService userService) {
        this.allowedOrigins = appProperties.cors().allowedOrigins();
        this.requireAuth = appProperties.socket().requireAuth();
        this.userService = userService;
    }

    @Override
    public AuthorizationResult getAuthorizationResult(HandshakeData data) {
        if (!isOriginAllowed(data)) {
            return AuthorizationResult.FAILED_AUTHORIZATION;
        }
        if (!requireAuth) {
            return AuthorizationResult.SUCCESSFUL_AUTHORIZATION;
        }
        return isTokenValid(data)
                ? AuthorizationResult.SUCCESSFUL_AUTHORIZATION
                : AuthorizationResult.FAILED_AUTHORIZATION;
    }

    private boolean isOriginAllowed(HandshakeData data) {
        String origin = data.getHttpHeaders().get("Origin");
        // Absent for non-browser clients (health checks, native apps); browsers
        // always send it, so only a present-and-unlisted origin is a rejection.
        if (origin == null || origin.isBlank()) {
            return true;
        }
        if (allowedOrigins.contains(origin)) {
            return true;
        }
        log.warn("Rejected socket handshake from origin {}", origin);
        return false;
    }

    private boolean isTokenValid(HandshakeData data) {
        String token = data.getSingleUrlParam("token");
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            return userService.authenticate(token).isPresent();
        } catch (UserService.SessionExpiredException ex) {
            return false;
        }
    }
}
