package com.livehorizon.user;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import com.livehorizon.common.ApiException;
import com.livehorizon.config.AppProperties;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private static final int TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties.Auth authProperties;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AppProperties appProperties,
                       Clock clock) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authProperties = appProperties.auth();
        this.clock = clock;
    }

    public void register(String name, String username, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new ApiException(HttpStatus.CONFLICT, "User existing");
        }
        User user = new User(name.trim(), username, passwordEncoder.encode(rawPassword));
        try {
            userRepository.save(user);
        } catch (org.springframework.dao.DuplicateKeyException ex) {
            // Lost the race against a concurrent registration for the same username.
            throw new ApiException(HttpStatus.CONFLICT, "User existing");
        }
    }

    /** Returns a freshly minted session token. */
    public String login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = newToken();
        user.setToken(token);
        user.setTokenExpiry(clock.instant().plus(authProperties.tokenTtl()));
        userRepository.save(user);
        return token;
    }

    public void logout(User user) {
        user.clearSession();
        userRepository.save(user);
    }

    public User updateProfile(User user, String name, String avatarUrl) {
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        return userRepository.save(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Resolves a bearer token to its owner and slides the inactivity window.
     *
     * <p>The expiry is only rewritten once per {@code refresh-threshold} rather
     * than on every authenticated request, which keeps this off the hot write
     * path while preserving the same user-visible behaviour.
     */
    public Optional<User> authenticate(String token) {
        Optional<User> found = userRepository.findByToken(token);
        if (found.isEmpty()) {
            return Optional.empty();
        }

        User user = found.get();
        Instant now = clock.instant();
        if (user.isSessionExpired(now)) {
            user.clearSession();
            userRepository.save(user);
            throw new SessionExpiredException();
        }

        Instant fullExpiry = now.plus(authProperties.tokenTtl());
        if (user.getTokenExpiry().isBefore(fullExpiry.minus(authProperties.refreshThreshold()))) {
            user.setTokenExpiry(fullExpiry);
            userRepository.save(user);
        }
        return Optional.of(user);
    }

    private String newToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /** Distinguishes "expired" from "never existed" so the client gets the right message. */
    public static class SessionExpiredException extends RuntimeException {
        public SessionExpiredException() {
            super("Token expired, please log in again");
        }
    }
}
