package com.zidio.keystone.controller;

import com.zidio.keystone.dto.request.LoginRequest;
import com.zidio.keystone.dto.response.LoginResponse;
import com.zidio.keystone.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
