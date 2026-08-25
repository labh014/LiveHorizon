package com.livehorizon.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<?> index() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Live Horizon Backend is running");
        return ResponseEntity.ok(response);
    }
}
