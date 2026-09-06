package com.zidio.keystone.dto.response;

public record LoginResponse(
        String token,
        String tokenType,
        Long userId,
        String name,
        String email,
        String role,
        Long expiresInMinutes
) {}
