package com.livehorizon.user;

import java.util.List;

import com.livehorizon.common.ApiException;
import com.livehorizon.common.MessageResponse;
import com.livehorizon.meeting.MeetingService;
import com.livehorizon.meeting.dto.MeetingDtos.AddHistoryRequest;
import com.livehorizon.meeting.dto.MeetingDtos.MeetingView;
import com.livehorizon.security.LoginRateLimiter;
import com.livehorizon.storage.AvatarService;
import com.livehorizon.user.dto.AuthRequests.LoginRequest;
import com.livehorizon.user.dto.AuthRequests.RegisterRequest;
import com.livehorizon.user.dto.AuthRequests.TokenResponse;
import com.livehorizon.user.dto.ProfileDtos.AvatarResponse;
import com.livehorizon.user.dto.ProfileDtos.UpdateProfileRequest;
import com.livehorizon.user.dto.ProfileDtos.UpdateProfileResponse;
import com.livehorizon.user.dto.ProfileDtos.UserView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final MeetingService meetingService;
    private final AvatarService avatarService;
    private final LoginRateLimiter loginRateLimiter;

    public UserController(UserService userService,
                          MeetingService meetingService,
                          AvatarService avatarService,
                          LoginRateLimiter loginRateLimiter) {
        this.userService = userService;
        this.meetingService = meetingService;
        this.avatarService = avatarService;
        this.loginRateLimiter = loginRateLimiter;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request.name(), request.username(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("User registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        String clientAddress = clientAddress(httpRequest);

        if (loginRateLimiter.isBlocked(request.username(), clientAddress)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many attempts, try again in %d minutes"
                            .formatted(Math.max(1, loginRateLimiter.retryAfter().toMinutes())));
        }

        try {
            String token = userService.login(request.username(), request.password());
            loginRateLimiter.recordSuccess(request.username(), clientAddress);
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (ApiException ex) {
            loginRateLimiter.recordFailure(request.username(), clientAddress);
            throw ex;
        }
    }

    @GetMapping("/me")
    public UserView me(@AuthenticationPrincipal User user) {
        return UserView.of(user);
    }

    @PostMapping("/logout")
    public MessageResponse logout(@AuthenticationPrincipal User user) {
        userService.logout(user);
        return new MessageResponse("Logged out");
    }

    @PutMapping("/profile")
    public UpdateProfileResponse updateProfile(@AuthenticationPrincipal User user,
                                               @Valid @RequestBody UpdateProfileRequest request) {
        User updated = userService.updateProfile(user, request.name(), request.avatarUrl());
        return new UpdateProfileResponse("Profile updated", UserView.of(updated));
    }

    @PostMapping("/profile/avatar")
    public AvatarResponse uploadAvatar(@AuthenticationPrincipal User user,
                                       @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return new AvatarResponse(avatarService.upload(user, avatar));
    }

    @GetMapping("/get-to-history")
    public List<MeetingView> history(@AuthenticationPrincipal User user) {
        return meetingService.history(user).stream().map(MeetingView::of).toList();
    }

    @PostMapping("/add-to-history")
    public ResponseEntity<MessageResponse> addHistory(@AuthenticationPrincipal User user,
                                                      @Valid @RequestBody AddHistoryRequest request) {
        meetingService.add(user, request.meetingCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("History added"));
    }

    private String clientAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
