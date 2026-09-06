package com.zidio.keystone.service;

import com.zidio.keystone.repository.UserRepository;
import com.zidio.keystone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(email)
                .filter(u -> u.isActive())
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("No active user with email " + email));
    }
}
