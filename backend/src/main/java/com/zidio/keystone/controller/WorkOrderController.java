package com.zidio.keystone.controller;

import com.zidio.keystone.domain.enums.WorkOrderStatus;
import com.zidio.keystone.dto.request.*;
import com.zidio.keystone.dto.response.PageResponse;
import com.zidio.keystone.dto.response.WorkOrderDetailResponse;
import com.zidio.keystone.dto.response.WorkOrderSummaryResponse;
import com.zidio.keystone.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkOrderDetailResponse create(@Valid @RequestBody CreateWorkOrderRequest request) {
        return workOrderService.create(request);
    }

    @GetMapping
    public PageResponse<WorkOrderSummaryResponse> list(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return workOrderService.listScoped(status, q, pageable);
    }

    @GetMapping("/{id}")
    public WorkOrderDetailResponse get(@PathVariable Long id) {
        return workOrderService.getScoped(id);
    }

    @PutMapping("/{id}")
    public WorkOrderDetailResponse update(@PathVariable Long id, @Valid @RequestBody UpdateWorkOrderRequest request) {
        return workOrderService.update(id, request);
    }

    @PostMapping("/{id}/assign")
    public WorkOrderDetailResponse assign(@PathVariable Long id, @Valid @RequestBody AssignWorkOrderRequest request) {
        return workOrderService.assign(id, request);
    }

    @PostMapping("/{id}/status")
    public WorkOrderDetailResponse changeStatus(@PathVariable Long id, @Valid @RequestBody StatusChangeRequest request) {
        return workOrderService.transitionStatus(id, request);
    }

    @PostMapping("/{id}/parts")
    public WorkOrderDetailResponse logParts(@PathVariable Long id, @Valid @RequestBody LogPartsRequest request) {
        return workOrderService.logParts(id, request);
    }

    @PostMapping("/{id}/time")
    public WorkOrderDetailResponse logTime(@PathVariable Long id, @Valid @RequestBody LogTimeRequest request) {
        return workOrderService.logTime(id, request);
    }
}
