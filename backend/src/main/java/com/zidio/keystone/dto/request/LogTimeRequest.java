package com.zidio.keystone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LogTimeRequest(
        @NotNull @Min(1) Integer minutes,
        String note
) {}
