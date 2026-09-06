package com.zidio.keystone.dto.response;

import com.zidio.keystone.domain.WorkOrderStatusHistory;

import java.time.Instant;

public record StatusHistoryResponse(String fromStatus, String toStatus, String changedBy,
                                     Instant changedAt, String note) {
    public static StatusHistoryResponse from(WorkOrderStatusHistory h) {
        return new StatusHistoryResponse(
                h.getFromStatus() != null ? h.getFromStatus().name() : null,
                h.getToStatus().name(),
                h.getChangedBy(),
                h.getChangedAt(),
                h.getNote());
    }
}
