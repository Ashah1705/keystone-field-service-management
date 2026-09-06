package com.zidio.keystone.controller;

import com.zidio.keystone.dto.request.CreateCustomerRequest;
import com.zidio.keystone.dto.request.CreateSiteRequest;
import com.zidio.keystone.dto.request.UpdateCustomerRequest;
import com.zidio.keystone.dto.request.UpdateSiteRequest;
import com.zidio.keystone.dto.response.CustomerResponse;
import com.zidio.keystone.dto.response.PageResponse;
import com.zidio.keystone.dto.response.SiteResponse;
import com.zidio.keystone.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // ==================== CUSTOMER ====================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(
            @Valid @RequestBody CreateCustomerRequest request) {
        return customerService.createCustomer(request);
    }

    @PutMapping("/{id}")
    public CustomerResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request) {
        return customerService.updateCustomer(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        customerService.deleteCustomer(id);
    }

    @GetMapping
    public PageResponse<CustomerResponse> list(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return customerService.search(q, pageable);
    }

    @GetMapping("/{id}")
    public CustomerResponse get(@PathVariable Long id) {
        return customerService.getOrThrow(id);
    }

    // ==================== SITES ====================

    @PostMapping("/{id}/sites")
    @ResponseStatus(HttpStatus.CREATED)
    public SiteResponse addSite(
            @PathVariable Long id,
            @Valid @RequestBody CreateSiteRequest request) {
        return customerService.addSite(id, request);
    }

    @PutMapping("/{customerId}/sites/{siteId}")
    public SiteResponse updateSite(
            @PathVariable Long customerId,
            @PathVariable Long siteId,
            @Valid @RequestBody UpdateSiteRequest request) {
        return customerService.updateSite(customerId, siteId, request);
    }

    @DeleteMapping("/{customerId}/sites/{siteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSite(
            @PathVariable Long customerId,
            @PathVariable Long siteId) {
        customerService.deleteSite(customerId, siteId);
    }

    @GetMapping("/{id}/sites")
    public List<SiteResponse> sites(@PathVariable Long id) {
        return customerService.sitesFor(id);
    }
}