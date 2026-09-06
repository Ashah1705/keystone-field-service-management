package com.zidio.keystone.dto.response;

import java.util.Map;

public record DashboardSummaryResponse(
        Map<String, Long> countsByStatus,
        long overdueCount,
        double slaCompliancePercent
) {}
