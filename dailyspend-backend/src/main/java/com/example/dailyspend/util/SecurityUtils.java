package com.example.dailyspend.util;

import com.example.dailyspend.entity.AppUser;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    /**
     * Returns authenticated AppUser
     */
    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        return (AppUser) authentication.getPrincipal();
    }

    /**
     * Returns authenticated user's ID (SAFE FOR DOMAIN USE)
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
