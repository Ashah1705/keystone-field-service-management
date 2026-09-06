package com.zidio.keystone.exception;

import org.springframework.http.HttpStatus;

/** 409 Conflict - the work order cannot legally move to the requested status. */
public class IllegalTransitionException extends ApiException {
    public IllegalTransitionException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
