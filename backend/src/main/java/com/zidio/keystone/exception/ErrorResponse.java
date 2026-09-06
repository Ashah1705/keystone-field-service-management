package com.zidio.keystone.exception;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String message,
        List<Map<String, String>> fieldErrors
) {}
