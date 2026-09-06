package com.zidio.keystone.domain.enums;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The governed work-order lifecycle (Section 07 of the brief).
 * ALLOWED_TRANSITIONS is the single source of truth for legal moves -
 * the service layer consults this, never the UI.
 */
public enum WorkOrderStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    ON_HOLD,
    COMPLETED,
    CLOSED,
    CANCELLED;

    private static final Map<WorkOrderStatus, Set<WorkOrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            NEW, Set.of(ASSIGNED, CANCELLED),
            ASSIGNED, Set.of(IN_PROGRESS, CANCELLED),
            IN_PROGRESS, Set.of(ON_HOLD, COMPLETED),
            ON_HOLD, Set.of(IN_PROGRESS),
            COMPLETED, Set.of(CLOSED, IN_PROGRESS), // reopen allowed per Fig.4 dashed line
            CLOSED, Set.of(),
            CANCELLED, Set.of()
    );

    public static final List<WorkOrderStatus> TERMINAL = List.of(CLOSED, CANCELLED);

    public boolean canTransitionTo(WorkOrderStatus target) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public boolean isTerminal() {
        return TERMINAL.contains(this);
    }
}
