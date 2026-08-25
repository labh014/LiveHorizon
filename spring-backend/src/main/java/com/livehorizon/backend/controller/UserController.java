package com.livehorizon.backend.controller;

import com.livehorizon.backend.model.Meeting;
import com.livehorizon.backend.model.User;
import com.livehorizon.backend.service.CloudinaryService;
import com.livehorizon.backend.service.MeetingService;
import com.livehorizon.backend.service.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final MeetingService meetingService;
    private final CloudinaryService cloudinaryService;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Autowired
    public UserController(UserService userService, MeetingService meetingService, CloudinaryService cloudinaryService) {
        this.userService = userService;
        this.meetingService = meetingService;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (userService.existsByUsername(request.getUsername())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User existing");
                return ResponseEntity.status(HttpStatus.FOUND).body(response); // status 302
            }
            userService.registerUser(request.getName(), request.getUsername(), request.getPassword());
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered");
            return ResponseEntity.status(HttpStatus.CREATED).body(response); // status 201
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error registering user");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null || 
            request.getUsername().trim().isEmpty() || request.getPassword().trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Enter correct information");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            if (!userService.existsByUsername(request.getUsername())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); // status 404
            }

            Optional<User> userOpt = userService.authenticate(request.getUsername(), request.getPassword());
            if (userOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("token", userOpt.get().getToken());
                return ResponseEntity.ok(response); // status 200
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid credentials");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response); // status 401
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Something went wrong");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        Map<String, String> response = new HashMap<>();
        response.put("name", user.getName());
        response.put("username", user.getUsername());
        response.put("avatarUrl", user.getAvatarUrl());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal User user) {
        try {
            userService.logout(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logged out");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Something went wrong");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user, @RequestBody ProfileRequest request) {
        try {
            User updated = userService.updateProfile(user, request.getName(), request.getAvatarUrl());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated");
            
            Map<String, String> userData = new HashMap<>();
            userData.put("name", updated.getName());
            userData.put("username", updated.getUsername());
            userData.put("avatarUrl", updated.getAvatarUrl());
            response.put("user", userData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Something went wrong");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<?> uploadAvatar(@AuthenticationPrincipal User user, @RequestParam("avatar") MultipartFile file) {
        if (file.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No file uploaded");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Validate File Size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "File too large (max 5MB)");
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response); // status 413
        }

        // Validate File Type (Only PNG and JPEG/JPG)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Only PNG and JPG/JPEG are allowed");
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response); // status 415
        }

        try {
            // 1. Check if Cloudinary is configured
            if (cloudinaryService.isConfigured()) {
                String secureUrl = cloudinaryService.uploadAvatar(file, user.getUsername());
                userService.updateProfile(user, null, secureUrl);
                
                Map<String, String> response = new HashMap<>();
                response.put("avatarUrl", secureUrl);
                return ResponseEntity.ok(response);
            }

            // 2. Fallback to Local Storage
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.lastIndexOf('.') > 0
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : ".png";

            String filename = user.getUsername() + "_" + System.currentTimeMillis() + extension;
            Path avatarsDir = Paths.get(uploadDir, "avatars");
            Files.createDirectories(avatarsDir); // Ensure uploads/avatars/ exists

            Path destinationPath = avatarsDir.resolve(filename);
            Files.write(destinationPath, file.getBytes());

            String relUrl = "/uploads/avatars/" + filename;
            userService.updateProfile(user, null, relUrl);

            Map<String, String> response = new HashMap<>();
            response.put("avatarUrl", relUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Upload failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to upload avatar");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/get-to-history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal User user) {
        try {
            List<Meeting> meetings = meetingService.getHistory(user.getUsername());
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Something went wrong");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/add-to-history")
    public ResponseEntity<?> addHistory(@AuthenticationPrincipal User user, @RequestBody AddHistoryRequest request) {
        try {
            meetingService.addHistory(user.getUsername(), request.getMeeting_code());
            Map<String, String> response = new HashMap<>();
            response.put("message", "History added");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Something went wrong " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // DTOs
    @Data
    public static class RegisterRequest {
        private String name;
        private String username;
        private String password;
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class ProfileRequest {
        private String name;
        private String avatarUrl;
    }

    @Data
    public static class AddHistoryRequest {
        private String meeting_code;
    }
}
