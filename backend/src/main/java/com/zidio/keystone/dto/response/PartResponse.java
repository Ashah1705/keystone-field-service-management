package com.zidio.keystone.dto.response;

import com.zidio.keystone.domain.Part;

import java.math.BigDecimal;

public record PartResponse(Long id, String name, String sku, BigDecimal unitCost, Integer stockQty) {
    public static PartResponse from(Part p) {
        return new PartResponse(p.getId(), p.getName(), p.getSku(), p.getUnitCost(), p.getStockQty());
    }
}
