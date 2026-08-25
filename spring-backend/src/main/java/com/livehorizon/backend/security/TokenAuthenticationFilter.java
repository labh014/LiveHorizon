package com.livehorizon.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livehorizon.backend.model.User;
import com.livehorizon.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TokenAuthenticationFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip auth filter for static assets and public routes
        String path = request.getRequestURI();
        if (path.startsWith("/uploads/") || path.equals("/api/v1/users/login") || path.equals("/api/v1/users/register") || path.equals("/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            token = request.getParameter("token");
        }

        if (token == null) {
            // No token found. Let request proceed; SecurityConfig will decide if access is allowed.
            filterChain.doFilter(request, response);
            return;
        }

        Optional<User> userOpt = userRepository.findByToken(token);
        if (userOpt.isEmpty()) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid token");
            return;
        }

        User user = userOpt.get();
        Date now = new Date();

        if (user.getTokenExpiry() == null || now.after(user.getTokenExpiry())) {
            user.setToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Token expired, please log in again");
            return;
        }

        // Slide the expiry by 1 day
        Calendar cal = Calendar.getInstance();
        cal.setTime(now);
        cal.add(Calendar.DAY_OF_YEAR, 1);
        user.setTokenExpiry(cal.getTime());
        userRepository.save(user);

        // Authenticate the user in the context
        TokenAuthenticationToken authentication = new TokenAuthenticationToken(
                user,
                token,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, String> errorDetails = new HashMap<>();
        errorDetails.put("message", message);
        objectMapper.writeValue(response.getWriter(), errorDetails);
    }
}
