package com.example.dailyspend.config;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.dailyspend.service.CustomUserDetailsService;
import com.example.dailyspend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(CustomUserDetailsService userDetailsService,
                                   JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        boolean skip = request.getServletPath().startsWith("/api/auth/");
        if (skip) {
            System.out.println("Skipping JWT filter for path: " + request.getServletPath());
        }
        return skip;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, java.io.IOException {

        System.out.println("\n---- JWT FILTER START ----");
        System.out.println("URI: " + request.getRequestURI());

        final String header = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + header);

        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("No Bearer token found. Skipping authentication.");
            filterChain.doFilter(request, response);
            System.out.println("---- JWT FILTER END ----");
            return;
        }

        final String token = header.substring(7);
        System.out.println("Token extracted: " + token);

        try {
            final String username = jwtUtil.extractUsername(token);
            System.out.println("Extracted username from token: " + username);

            if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

                System.out.println("No existing authentication. Loading user details...");

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(username);

                System.out.println("UserDetails loaded: " + userDetails.getUsername());
                System.out.println("Authorities: " + userDetails.getAuthorities());

                boolean isValid = jwtUtil.validateToken(token, userDetails);
                System.out.println("Is token valid? " + isValid);

                if (isValid) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContext.");
                } else {
                    System.out.println("Token validation failed.");
                }

            } else {
                System.out.println("Username null OR authentication already present.");
            }

        } catch (Exception e) {
            System.out.println("Exception while processing JWT: " + e.getMessage());
        }

        System.out.println("Authentication in context: " +
                SecurityContextHolder.getContext().getAuthentication());
        System.out.println("---- JWT FILTER END ----");

        filterChain.doFilter(request, response);
    }
}
