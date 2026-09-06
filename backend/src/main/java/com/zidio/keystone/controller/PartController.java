package com.zidio.keystone.controller;

import com.zidio.keystone.dto.request.CreatePartRequest;
import com.zidio.keystone.dto.response.PartResponse;
import com.zidio.keystone.service.PartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService partService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PartResponse create(@Valid @RequestBody CreatePartRequest request) {
        return partService.create(request);
    }

    @GetMapping
    public List<PartResponse> list() {
        return partService.listAll();
    }
}
