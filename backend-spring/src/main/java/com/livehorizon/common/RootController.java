package com.livehorizon.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public MessageResponse root() {
        return new MessageResponse("Live Horizon Backend is running");
    }
}
