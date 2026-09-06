package com.zidio.keystone.security;

import org.springframework.security.core.context.SecurityContextHolder;

/** Small helper so services don't each re-derive "who is making this call" from the security context. */
public final class CurrentUser {

    private CurrentUser() {}

    public static UserPrincipal get() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal up) {
            return up;
        }
        throw new IllegalStateException("No authenticated UserPrincipal in context");
    }
}
