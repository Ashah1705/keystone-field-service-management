package com.zidio.keystone.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * F7.2: "A scheduled job flags work orders at risk of, or in, breach."
 * Runs every 5 minutes; in a real deployment this is also where you'd fire the
 * manager notification (email/in-app) mentioned in F7.3.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlaSchedulerService {

    private final WorkOrderService workOrderService;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void sweepSlaBreaches() {
        int flagged = workOrderService.flagSlaBreaches();
        if (flagged > 0) {
            log.warn("SLA sweep flagged {} newly-breached work order(s)", flagged);
        }
    }
}
