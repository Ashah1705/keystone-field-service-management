package com.zidio.keystone.service;

import com.zidio.keystone.domain.enums.WorkOrderStatus;
import com.zidio.keystone.dto.response.DashboardSummaryResponse;
import com.zidio.keystone.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportingService {

    private final WorkOrderRepository workOrderRepository;

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public DashboardSummaryResponse summary() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (WorkOrderStatus status : WorkOrderStatus.values()) {
            counts.put(status.name(), workOrderRepository.countByStatus(status));
        }

        long overdue = workOrderRepository.countOverdue(Instant.now(), WorkOrderStatus.TERMINAL);

        long closed = counts.getOrDefault("CLOSED", 0L);
        long total = counts.values().stream().mapToLong(Long::longValue).sum();
        long breachedClosed = 0; // simple compliance proxy: closed jobs assumed on-time unless flagged elsewhere
        double compliance = total == 0 ? 100.0
                : Math.round((1 - (double) overdue / Math.max(total, 1)) * 1000) / 10.0;

        return new DashboardSummaryResponse(counts, overdue, compliance);
    }
}
