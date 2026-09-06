package com.zidio.keystone.dto.response;

import com.zidio.keystone.domain.Customer;

import java.time.Instant;

public record CustomerResponse(Long id, String name, String contactEmail, Instant createdAt) {
    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getContactEmail(), c.getCreatedAt());
    }
}
