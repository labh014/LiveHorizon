package com.livehorizon.backend.service;

import com.livehorizon.backend.model.User;
import com.livehorizon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public User registerUser(String name, String username, String password) {
        User user = new User();
        user.setName(name);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Generate secure token (32 bytes hex, 64 chars)
                String token = generateSecureHexToken(32);
                user.setToken(token);
                System.out.println("Authentication SStarted ........");
                // Expiry = current time + 1 day
                Calendar cal = Calendar.getInstance();
                cal.setTime(new Date());
                cal.add(Calendar.DAY_OF_YEAR, 1);
                user.setTokenExpiry(cal.getTime());
                
                userRepository.save(user);
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public void logout(User user) {
        user.setToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    public User updateProfile(User user, String name, String avatarUrl) {
        if (name != null && !name.trim().isEmpty()) {
            user.setName(name.trim());
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        return userRepository.save(user);
    }

    private String generateSecureHexToken(int length) {
        byte[] tokenBytes = new byte[length];
        secureRandom.nextBytes(tokenBytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : tokenBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
