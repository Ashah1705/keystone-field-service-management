package com.zidio.keystone.service;

import com.zidio.keystone.domain.User;
import com.zidio.keystone.dto.request.LoginRequest;
import com.zidio.keystone.dto.response.LoginResponse;
import com.zidio.keystone.repository.UserRepository;
import com.zidio.keystone.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        // Delegates to Spring Security's DaoAuthenticationProvider, which uses BCrypt to
        // compare the raw password against the stored hash. Throws BadCredentialsException on mismatch.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalStateException("Authenticated user vanished"));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new LoginResponse(
                token, "Bearer", user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), jwtUtil.getExpirationMinutes());
    }
}
