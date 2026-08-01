package com.livehorizon.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthRequests {

    private AuthRequests() {
    }

    public record RegisterRequest(
            @NotBlank(message = "Enter correct information")
            @Size(max = 80, message = "Name is too long")
            String name,

            @NotBlank(message = "Enter correct information")
            @Size(min = 3, max = 40, message = "Username must be 3-40 characters")
            String username,

            @NotBlank(message = "Enter correct information")
            @Size(min = 6, max = 72, message = "Password must be 6-72 characters")
            String password) {
    }

    public record LoginRequest(
            @NotBlank(message = "Enter correct information") String username,
            @NotBlank(message = "Enter correct information") String password) {
    }

    public record TokenResponse(String token) {
    }
}
