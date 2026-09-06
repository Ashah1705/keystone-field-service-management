package com.zidio.keystone.service;

import com.zidio.keystone.domain.Customer;
import com.zidio.keystone.domain.Site;
import com.zidio.keystone.dto.request.CreateCustomerRequest;
import com.zidio.keystone.dto.request.CreateSiteRequest;
import com.zidio.keystone.dto.request.UpdateCustomerRequest;
import com.zidio.keystone.dto.request.UpdateSiteRequest;
import com.zidio.keystone.dto.response.CustomerResponse;
import com.zidio.keystone.dto.response.PageResponse;
import com.zidio.keystone.dto.response.SiteResponse;
import com.zidio.keystone.exception.NotFoundException;
import com.zidio.keystone.repository.CustomerRepository;
import com.zidio.keystone.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;

    // ==================== CREATE CUSTOMER ====================

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public CustomerResponse createCustomer(CreateCustomerRequest request) {

        Customer customer = Customer.builder()
                .name(request.name())
                .contactEmail(request.contactEmail())
                .build();

        return CustomerResponse.from(
                customerRepository.save(customer)
        );
    }

    // ==================== UPDATE CUSTOMER ====================

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public CustomerResponse updateCustomer(
            Long id,
            UpdateCustomerRequest request) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Customer " + id + " not found"
                        ));

        customer.setName(request.name());
        customer.setContactEmail(request.contactEmail());

        return CustomerResponse.from(
                customerRepository.save(customer)
        );
    }

    // ==================== DELETE CUSTOMER ====================

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public void deleteCustomer(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Customer " + id + " not found"
                        ));

        customerRepository.delete(customer);
    }

    // ==================== SEARCH CUSTOMERS ====================

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public PageResponse<CustomerResponse> search(
            String q,
            Pageable pageable) {

        var page = (q == null || q.isBlank())
                ? customerRepository.findAll(pageable)
                : customerRepository.findByNameContainingIgnoreCase(
                        q,
                        pageable
                );

        return PageResponse.from(
                page,
                CustomerResponse::from
        );
    }

    // ==================== CREATE SITE ====================

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public SiteResponse addSite(
            Long customerId,
            CreateSiteRequest request) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Customer " + customerId + " not found"
                        ));

        Site site = Site.builder()
                .customer(customer)
                .name(request.name())
                .address(request.address())
                .build();

        return SiteResponse.from(
                siteRepository.save(site)
        );
    }

    // ==================== UPDATE SITE ====================

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public SiteResponse updateSite(
            Long customerId,
            Long siteId,
            UpdateSiteRequest request) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Customer " + customerId + " not found"
                        ));

        Site site = siteRepository.findById(siteId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Site " + siteId + " not found"
                        ));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new NotFoundException(
                    "Site " + siteId +
                    " not found for customer " + customerId
            );
        }

        site.setName(request.name());
        site.setAddress(request.address());

        return SiteResponse.from(
                siteRepository.save(site)
        );
    }

    // ==================== DELETE SITE ====================

    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public void deleteSite(
            Long customerId,
            Long siteId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Customer " + customerId + " not found"
                        ));

        Site site = siteRepository.findById(siteId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Site " + siteId + " not found"
                        ));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new NotFoundException(
                    "Site " + siteId +
                    " not found for customer " + customerId
            );
        }

        siteRepository.delete(site);
    }

    // ==================== GET SITES ====================

    @Transactional(readOnly = true)
    public List<SiteResponse> sitesFor(Long customerId) {

        return siteRepository.findByCustomerId(customerId)
                .stream()
                .map(SiteResponse::from)
                .toList();
    }

    // ==================== GET CUSTOMER ====================

    @Transactional(readOnly = true)
    public CustomerResponse getOrThrow(Long id) {

        return customerRepository.findById(id)
                .map(CustomerResponse::from)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Customer " + id + " not found"
                        ));
    }
}