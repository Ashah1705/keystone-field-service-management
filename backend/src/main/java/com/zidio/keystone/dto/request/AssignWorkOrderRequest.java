package com.zidio.keystone.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignWorkOrderRequest(
        @NotNull Long technicianId
) {}
