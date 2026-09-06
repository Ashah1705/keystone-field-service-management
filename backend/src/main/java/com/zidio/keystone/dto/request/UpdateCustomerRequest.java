package com.zidio.keystone.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateCustomerRequest(
        @NotBlank String name,
        @Email String contactEmail
) {
}