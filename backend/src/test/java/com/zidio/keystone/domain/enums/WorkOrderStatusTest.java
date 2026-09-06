package com.zidio.keystone.domain.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The lifecycle is the core business rule of the platform (Section 07) - these are the first
 * tests to write, per Section 16.1 ("tests where they matter most: the lifecycle transitions
 * and the authorisation rules").
 */
class WorkOrderStatusTest {

    @Test
    void newWorkOrderCanBeAssignedOrCancelled() {
        assertTrue(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.ASSIGNED));
        assertTrue(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.CANCELLED));
    }

    @Test
    void newWorkOrderCannotJumpStraightToCompleted() {
        // The illegal jump the brief calls out explicitly (Figure 4 caption).
        assertFalse(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.COMPLETED));
    }

    @Test
    void onlyInProgressCanGoOnHold() {
        assertTrue(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.ON_HOLD));
        assertFalse(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.ON_HOLD));
        assertFalse(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.ON_HOLD));
    }

    @Test
    void onHoldCanOnlyResumeToInProgress() {
        assertTrue(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.IN_PROGRESS));
        assertFalse(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.COMPLETED));
        assertFalse(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.CANCELLED));
    }

    @Test
    void completedCanCloseOrReopen() {
        assertTrue(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.CLOSED));
        assertTrue(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.IN_PROGRESS));
    }

    @Test
    void terminalStatesAcceptNoFurtherTransitions() {
        for (WorkOrderStatus target : WorkOrderStatus.values()) {
            assertFalse(WorkOrderStatus.CLOSED.canTransitionTo(target),
                    "CLOSED must not transition to " + target);
            assertFalse(WorkOrderStatus.CANCELLED.canTransitionTo(target),
                    "CANCELLED must not transition to " + target);
        }
        assertTrue(WorkOrderStatus.CLOSED.isTerminal());
        assertTrue(WorkOrderStatus.CANCELLED.isTerminal());
        assertFalse(WorkOrderStatus.IN_PROGRESS.isTerminal());
    }
}
