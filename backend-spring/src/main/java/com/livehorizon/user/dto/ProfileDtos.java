package com.livehorizon.user.dto;

import com.livehorizon.user.User;

import jakarta.validation.constraints.Size;

public final class ProfileDtos {

    private ProfileDtos() {
    }

    /** Shape consumed by AuthContext.fetchMe() and Navbar/Profile. */
    public record UserView(String name, String username, String avatarUrl) {

        public static UserView of(User user) {
            return new UserView(user.getName(), user.getUsername(), user.getAvatarUrl());
        }
    }

    public record UpdateProfileRequest(
            @Size(max = 80, message = "Name is too long") String name,
            @Size(max = 2048, message = "Avatar URL is too long") String avatarUrl) {
    }

    public record UpdateProfileResponse(String message, UserView user) {
    }

    public record AvatarResponse(String avatarUrl) {
    }
}
