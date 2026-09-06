package com.zidio.keystone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreatePartRequest(
        @NotBlank String name,
        @NotBlank String sku,
        @NotNull BigDecimal unitCost,
        @Min(0) Integer stockQty
) {}
