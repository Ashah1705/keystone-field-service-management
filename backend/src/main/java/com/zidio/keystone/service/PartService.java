package com.zidio.keystone.service;

import com.zidio.keystone.domain.Part;
import com.zidio.keystone.dto.request.CreatePartRequest;
import com.zidio.keystone.dto.response.PartResponse;
import com.zidio.keystone.exception.NotFoundException;
import com.zidio.keystone.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PartService {

    private final PartRepository partRepository;

    @PreAuthorize("hasRole('MANAGER')")
    public PartResponse create(CreatePartRequest request) {
        Part part = Part.builder()
                .name(request.name())
                .sku(request.sku())
                .unitCost(request.unitCost())
                .stockQty(request.stockQty() == null ? 0 : request.stockQty())
                .build();
        return PartResponse.from(partRepository.save(part));
    }

    @Transactional(readOnly = true)
    public List<PartResponse> listAll() {
        return partRepository.findAll().stream().map(PartResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Part getOrThrow(Long id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Part " + id + " not found"));
    }
}
