package com.zidio.keystone.service;

import com.zidio.keystone.domain.User;
import com.zidio.keystone.domain.enums.Role;
import com.zidio.keystone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public List<User> listTechnicians() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.TECHNICIAN && u.isActive())
                .toList();
    }
}
