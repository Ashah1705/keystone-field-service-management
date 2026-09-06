package com.zidio.keystone.dto.response;

import com.zidio.keystone.domain.WorkOrder;

import java.time.Instant;

/** Lightweight shape for list/board views. */
public record WorkOrderSummaryResponse(
        Long id, String code, String title, String priority, String status,
        Long customerId, String customerName, Long siteId, String siteName,
        Long assignedToId, String assignedToName,
        Instant slaDueAt, boolean slaBreached, Instant updatedAt
) {
    public static WorkOrderSummaryResponse from(WorkOrder w) {
        return new WorkOrderSummaryResponse(
                w.getId(), w.getCode(), w.getTitle(), w.getPriority().name(), w.getStatus().name(),
                w.getCustomer().getId(), w.getCustomer().getName(),
                w.getSite().getId(), w.getSite().getName(),
                w.getAssignedTo() != null ? w.getAssignedTo().getId() : null,
                w.getAssignedTo() != null ? w.getAssignedTo().getName() : null,
                w.getSlaDueAt(), w.isSlaBreached(), w.getUpdatedAt()
        );
    }
}
