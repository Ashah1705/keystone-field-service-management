package com.zidio.keystone.dto.response;

import com.zidio.keystone.domain.Site;

public record SiteResponse(Long id, Long customerId, String name, String address) {
    public static SiteResponse from(Site s) {
        return new SiteResponse(s.getId(), s.getCustomer().getId(), s.getName(), s.getAddress());
    }
}
