package com.livehorizon.signaling;

import com.corundumstudio.socketio.SocketIOServer;
import com.livehorizon.config.AppProperties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.SmartLifecycle;

/**
 * netty-socketio binds its own Netty listener, so it runs on a port of its own
 * next to Tomcat. Starting it as a {@link SmartLifecycle} keeps it tied to the
 * application context instead of a raw {@code @PostConstruct}.
 */
public class SocketIoLifecycle implements SmartLifecycle {

    private static final Logger log = LoggerFactory.getLogger(SocketIoLifecycle.class);

    private final SocketIOServer server;
    private final AppProperties.Socket properties;
    private volatile boolean running;

    public SocketIoLifecycle(SocketIOServer server, AppProperties appProperties) {
        this.server = server;
        this.properties = appProperties.socket();
    }

    @Override
    public void start() {
        if (running) {
            return;
        }
        server.start();
        running = true;
        log.info("Socket.IO listening on {}:{}{}",
                properties.hostname(), properties.port(), properties.context());
    }

    @Override
    public void stop() {
        if (!running) {
            return;
        }
        running = false;
        server.stop();
        log.info("Socket.IO stopped");
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    /** Start after the web server is up, stop before it goes down. */
    @Override
    public int getPhase() {
        return Integer.MAX_VALUE - 1024;
    }
}
