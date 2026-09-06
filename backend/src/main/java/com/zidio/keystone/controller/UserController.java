package com.zidio.keystone.controller;

import com.zidio.keystone.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/technicians")
    public List<Map<String, Object>> technicians() {
        return userService.listTechnicians().stream()
                .map(u -> Map.<String, Object>of("id", u.getId(), "name", u.getName(), "email", u.getEmail()))
                .toList();
    }
}
