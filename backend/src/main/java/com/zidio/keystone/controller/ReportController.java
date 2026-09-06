package com.zidio.keystone.controller;

import com.zidio.keystone.dto.response.DashboardSummaryResponse;
import com.zidio.keystone.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportingService reportingService;

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return reportingService.summary();
    }
}
