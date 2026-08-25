package com.livehorizon.backend.socket;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SocketIOServerRunner implements CommandLineRunner, DisposableBean {

    private final SocketIOServer server;

    @Autowired
    public SocketIOServerRunner(SocketIOServer server) {
        this.server = server;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting Netty-SocketIO Server...");
        server.start();
        System.out.println("Netty-SocketIO Server started successfully.");
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("Stopping Netty-SocketIO Server...");
        try {
            server.stop();
            System.out.println("Netty-SocketIO Server stopped.");
        } catch (Exception e) {
            System.out.println("Netty-SocketIO Server was not started or failed to stop cleanly: " + e.getMessage());
        }
    }
}
