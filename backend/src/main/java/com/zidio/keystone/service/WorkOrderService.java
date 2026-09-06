package com.zidio.keystone.service;

import com.zidio.keystone.domain.*;
import com.zidio.keystone.domain.enums.Priority;
import com.zidio.keystone.domain.enums.Role;
import com.zidio.keystone.domain.enums.WorkOrderStatus;
import com.zidio.keystone.dto.request.*;
import com.zidio.keystone.dto.response.PageResponse;
import com.zidio.keystone.dto.response.WorkOrderDetailResponse;
import com.zidio.keystone.dto.response.WorkOrderSummaryResponse;
import com.zidio.keystone.exception.ForbiddenException;
import com.zidio.keystone.exception.IllegalTransitionException;
import com.zidio.keystone.exception.NotFoundException;
import com.zidio.keystone.repository.*;
import com.zidio.keystone.security.CurrentUser;
import com.zidio.keystone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Owns the work-order lifecycle (Section 07). This is the single place that decides whether a
 * status change is legal and who is allowed to make it - never trust the UI for either check.
 * Every transition is wrapped in one transaction with its audit row (and, for parts, stock).
 *
 * DTO mapping happens INSIDE these @Transactional methods, not in the controller: with
 * spring.jpa.open-in-view=false the Hibernate session closes as soon as the method returns,
 * so lazy associations (customer, site, history, part usages) must be read before that point.
 * This is also what Section 6.2 asks for - entities never leak past the service layer.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;

    @Value("${keystone.sla.minutes.URGENT}") private long slaUrgentMinutes;
    @Value("${keystone.sla.minutes.HIGH}") private long slaHighMinutes;
    @Value("${keystone.sla.minutes.MEDIUM}") private long slaMediumMinutes;
    @Value("${keystone.sla.minutes.LOW}") private long slaLowMinutes;

    // ---------- Create / read ----------

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER','CUSTOMER')")
    public WorkOrderDetailResponse create(CreateWorkOrderRequest req) {
        Customer customer = customerRepository.findById(req.customerId())
                .orElseThrow(() -> new NotFoundException("Customer " + req.customerId() + " not found"));
        Site site = siteRepository.findById(req.siteId())
                .orElseThrow(() -> new NotFoundException("Site " + req.siteId() + " not found"));

        // A customer user may only raise a request against their own organisation's site (F9.3/F9.4).
        UserPrincipal me = CurrentUser.get();
        if (Role.CUSTOMER.name().equals(me.getRole()) && !customer.getId().equals(me.getCustomerId())) {
            throw new ForbiddenException("You may only raise requests for your own organisation");
        }
        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Site does not belong to the given customer");
        }

        WorkOrder wo = WorkOrder.builder()
                .code(generateCode())
                .title(req.title())
                .description(req.description())
                .priority(req.priority())
                .status(WorkOrderStatus.NEW)
                .customer(customer)
                .site(site)
                .slaDueAt(Instant.now().plus(slaMinutesFor(req.priority()), ChronoUnit.MINUTES))
                .build();

        wo = workOrderRepository.save(wo);
        writeHistory(wo, null, WorkOrderStatus.NEW, me.getEmail(), "Work order raised");
        return WorkOrderDetailResponse.from(wo);
    }

    @Transactional(readOnly = true)
    public WorkOrderDetailResponse getScoped(Long id) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Work order " + id + " not found"));
        assertReadAccess(wo);
        return WorkOrderDetailResponse.from(wo);
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkOrderSummaryResponse> listScoped(WorkOrderStatus status, String q, Pageable pageable) {
        q = q == null ? "" : q;
        UserPrincipal me = CurrentUser.get();
        Page<WorkOrder> page = switch (Role.valueOf(me.getRole())) {
            case CUSTOMER -> workOrderRepository.search(status, me.getCustomerId(), q, pageable);
            case TECHNICIAN -> workOrderRepository.findByAssignedToId(me.getId(), pageable);
            case DISPATCHER, MANAGER -> workOrderRepository.search(status, null, q, pageable);
        };
        return PageResponse.from(page, WorkOrderSummaryResponse::from);
    }

    public WorkOrderDetailResponse update(Long id, UpdateWorkOrderRequest req) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Work order " + id + " not found"));
        assertMutateAccess(wo);
        if (wo.getStatus().isTerminal()) {
            throw new IllegalTransitionException("Cannot edit a " + wo.getStatus() + " work order");
        }
        wo.setTitle(req.title());
        wo.setDescription(req.description());
        wo.setPriority(req.priority());
        return WorkOrderDetailResponse.from(wo);
    }

    // ---------- Dispatch ----------

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public WorkOrderDetailResponse assign(Long id, AssignWorkOrderRequest req) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Work order " + id + " not found"));

        User technician = userRepository.findById(req.technicianId())
                .orElseThrow(() -> new NotFoundException("Technician " + req.technicianId() + " not found"));
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("User " + technician.getId() + " is not a technician");
        }
        if (wo.getStatus().isTerminal()) {
            throw new IllegalTransitionException("Cannot assign a " + wo.getStatus() + " work order");
        }

        boolean firstAssignment = wo.getStatus() == WorkOrderStatus.NEW;
        WorkOrderStatus from = wo.getStatus();
        wo.setAssignedTo(technician);
        if (firstAssignment) {
            wo.setStatus(WorkOrderStatus.ASSIGNED);
        }
        // Reassignment while already ASSIGNED/IN_PROGRESS/ON_HOLD keeps the current status (F4.3).

        writeHistory(wo, from, wo.getStatus(), CurrentUser.get().getEmail(),
                "Assigned to " + technician.getName());
        return WorkOrderDetailResponse.from(wo);
    }

    // ---------- Status transitions ----------

    public WorkOrderDetailResponse transitionStatus(Long id, StatusChangeRequest req) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Work order " + id + " not found"));

        WorkOrderStatus from = wo.getStatus();
        WorkOrderStatus to = req.toStatus();

        if (!from.canTransitionTo(to)) {
            throw new IllegalTransitionException("Cannot move a work order from " + from + " to " + to);
        }
        assertTransitionRole(wo, from, to);

        wo.setStatus(to);
        if (from == WorkOrderStatus.COMPLETED && to == WorkOrderStatus.IN_PROGRESS) {
            wo.setSlaBreached(false); // reopened job gets a clean SLA read; sweep will re-flag if still overdue
        }

        writeHistory(wo, from, to, CurrentUser.get().getEmail(), req.note());
        return WorkOrderDetailResponse.from(wo);
    }

    private void assertTransitionRole(WorkOrder wo, WorkOrderStatus from, WorkOrderStatus to) {
        UserPrincipal me = CurrentUser.get();
        Role role = Role.valueOf(me.getRole());

        boolean isAssignedTechnician = wo.getAssignedTo() != null && wo.getAssignedTo().getId().equals(me.getId());

        boolean allowed = switch (to) {
            case CANCELLED -> role == Role.DISPATCHER || role == Role.MANAGER;
            case IN_PROGRESS -> (role == Role.TECHNICIAN && isAssignedTechnician)
                                  || role == Role.MANAGER; // manager may reopen from COMPLETED
            case ON_HOLD -> role == Role.TECHNICIAN && isAssignedTechnician;
            case COMPLETED -> role == Role.TECHNICIAN && isAssignedTechnician;
            case CLOSED -> role == Role.MANAGER;
            case ASSIGNED, NEW -> false; // reached only via assign()/create(), not this endpoint
        };

        if (!allowed) {
            throw new ForbiddenException("Role " + role + " may not move a work order from " + from + " to " + to);
        }
    }

    // ---------- Parts & time (Section 06 integrity rule: one transaction) ----------

    @PreAuthorize("hasAnyRole('TECHNICIAN','MANAGER')")
    public WorkOrderDetailResponse logParts(Long workOrderId, LogPartsRequest req) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new NotFoundException("Work order " + workOrderId + " not found"));
        assertAssignedTechnicianOrManager(wo);

        Part part = partRepository.findById(req.partId())
                .orElseThrow(() -> new NotFoundException("Part " + req.partId() + " not found"));

        if (part.getStockQty() < req.qtyUsed()) {
            throw new com.zidio.keystone.exception.InsufficientStockException(
                    "Only " + part.getStockQty() + " of " + part.getName() + " in stock");
        }

        // Decrement stock and record usage in the same transaction - if either write fails, both roll back.
        part.setStockQty(part.getStockQty() - req.qtyUsed());

        PartUsage usage = PartUsage.builder().workOrder(wo).part(part).qtyUsed(req.qtyUsed()).build();
        partUsageRepository.save(usage);
        wo.getPartUsages().add(usage);

        return WorkOrderDetailResponse.from(wo);
    }

    @PreAuthorize("hasAnyRole('TECHNICIAN','MANAGER')")
    public WorkOrderDetailResponse logTime(Long workOrderId, LogTimeRequest req) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new NotFoundException("Work order " + workOrderId + " not found"));
        assertAssignedTechnicianOrManager(wo);

        UserPrincipal me = CurrentUser.get();
        User technician = userRepository.findById(me.getId())
                .orElseThrow(() -> new NotFoundException("User " + me.getId() + " not found"));

        TimeLog log = TimeLog.builder()
                .workOrder(wo).technician(technician)
                .minutes(req.minutes()).note(req.note())
                .build();
        timeLogRepository.save(log);
        wo.getTimeLogs().add(log);
        return WorkOrderDetailResponse.from(wo);
    }

    // ---------- SLA breach sweep (called by the scheduled job) ----------

    @Transactional
    public int flagSlaBreaches() {
        List<WorkOrder> overdue = workOrderRepository.findByStatusNotInAndSlaDueAtBeforeAndSlaBreachedFalse(
                WorkOrderStatus.TERMINAL, Instant.now());
        AtomicInteger flagged = new AtomicInteger();
        overdue.forEach(wo -> {
            wo.setSlaBreached(true);
            flagged.incrementAndGet();
        });
        return flagged.get();
    }

    // ---------- Access helpers ----------

    private void assertReadAccess(WorkOrder wo) {
        UserPrincipal me = CurrentUser.get();
        Role role = Role.valueOf(me.getRole());
        if (role == Role.CUSTOMER && !wo.getCustomer().getId().equals(me.getCustomerId())) {
            throw new ForbiddenException("You may only view your own organisation's work orders");
        }
        if (role == Role.TECHNICIAN
                && (wo.getAssignedTo() == null || !wo.getAssignedTo().getId().equals(me.getId()))) {
            throw new ForbiddenException("You may only view work orders assigned to you");
        }
    }

    private void assertMutateAccess(WorkOrder wo) {
        UserPrincipal me = CurrentUser.get();
        Role role = Role.valueOf(me.getRole());
        if (role == Role.CUSTOMER || role == Role.TECHNICIAN) {
            throw new ForbiddenException("Only dispatchers and managers can edit work order details");
        }
    }

    private void assertAssignedTechnicianOrManager(WorkOrder wo) {
        UserPrincipal me = CurrentUser.get();
        Role role = Role.valueOf(me.getRole());
        boolean isAssignedTechnician = role == Role.TECHNICIAN
                && wo.getAssignedTo() != null && wo.getAssignedTo().getId().equals(me.getId());
        if (!(isAssignedTechnician || role == Role.MANAGER)) {
            throw new ForbiddenException("Only the assigned technician or a manager may log parts/time here");
        }
    }

    private long slaMinutesFor(Priority priority) {
        return switch (priority) {
            case URGENT -> slaUrgentMinutes;
            case HIGH -> slaHighMinutes;
            case MEDIUM -> slaMediumMinutes;
            case LOW -> slaLowMinutes;
        };
    }

    private void writeHistory(WorkOrder wo, WorkOrderStatus from, WorkOrderStatus to, String changedBy, String note) {
        WorkOrderStatusHistory row = WorkOrderStatusHistory.builder()
                .workOrder(wo).fromStatus(from).toStatus(to)
                .changedBy(changedBy).changedAt(Instant.now()).note(note)
                .build();
        historyRepository.save(row);
        wo.getStatusHistory().add(row);
    }

    private String generateCode() {
        int year = java.time.Year.now().getValue();
        long seq = workOrderRepository.count() + 1;
        return "WO-" + year + "-" + String.format("%06d", seq);
    }
}
