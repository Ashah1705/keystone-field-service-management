package com.zidio.keystone.dto.request;

import com.zidio.keystone.domain.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateWorkOrderRequest(
        @NotBlank String title,
        String description,
        @NotNull Priority priority
) {}
