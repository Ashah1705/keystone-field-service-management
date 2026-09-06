package com.zidio.keystone.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateSiteRequest(
        @NotBlank String name,
        @NotBlank String address
) {
}