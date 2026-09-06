package com.zidio.keystone.dto.response;

import com.zidio.keystone.domain.WorkOrder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Full shape for the detail view: includes history and roll-ups. */
public record WorkOrderDetailResponse(
        Long id, String code, String title, String description, String priority, String status,
        Long customerId, String customerName, Long siteId, String siteName,
        Long assignedToId, String assignedToName,
        Instant slaDueAt, boolean slaBreached,
        BigDecimal partsCost, int totalMinutes,
        Instant createdAt, Instant updatedAt,
        List<StatusHistoryResponse> history
) {
    public static WorkOrderDetailResponse from(WorkOrder w) {
        return new WorkOrderDetailResponse(
                w.getId(), w.getCode(), w.getTitle(), w.getDescription(),
                w.getPriority().name(), w.getStatus().name(),
                w.getCustomer().getId(), w.getCustomer().getName(),
                w.getSite().getId(), w.getSite().getName(),
                w.getAssignedTo() != null ? w.getAssignedTo().getId() : null,
                w.getAssignedTo() != null ? w.getAssignedTo().getName() : null,
                w.getSlaDueAt(), w.isSlaBreached(),
                w.getPartsCost(), w.getTotalMinutes(),
                w.getCreatedAt(), w.getUpdatedAt(),
                w.getStatusHistory().stream().map(StatusHistoryResponse::from).toList()
        );
    }
}
