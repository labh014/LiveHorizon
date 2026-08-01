package com.livehorizon.security;

import java.io.IOException;
import java.util.List;

import com.livehorizon.user.User;
import com.livehorizon.user.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Replaces the Node {@code checkTokenExpiry} middleware. On failure it records
 * the reason and lets the chain continue, so public endpoints stay public and
 * {@link RestAuthenticationEntryPoint} produces the message the client expects.
 */
@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTH_ERROR_ATTRIBUTE = "com.livehorizon.authError";

    private static final String BEARER_PREFIX = "Bearer ";

    private final UserService userService;

    public TokenAuthenticationFilter(UserService userService) {
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);
        if (!StringUtils.hasText(token)) {
            request.setAttribute(AUTH_ERROR_ATTRIBUTE, "Missing token");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            User user = userService.authenticate(token).orElse(null);
            if (user == null) {
                request.setAttribute(AUTH_ERROR_ATTRIBUTE, "Invalid token");
            } else {
                var authentication = new UsernamePasswordAuthenticationToken(
                        user, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (UserService.SessionExpiredException ex) {
            request.setAttribute(AUTH_ERROR_ATTRIBUTE, ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length()).trim();
        }
        return request.getParameter("token");
    }
}
