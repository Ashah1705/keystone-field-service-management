package com.zidio.keystone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LogPartsRequest(
        @NotNull Long partId,
        @Min(1) int qtyUsed
) {}
