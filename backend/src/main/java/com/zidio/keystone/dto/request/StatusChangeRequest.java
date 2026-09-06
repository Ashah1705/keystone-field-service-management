package com.zidio.keystone.dto.request;

import com.zidio.keystone.domain.enums.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(
        @NotNull WorkOrderStatus toStatus,
        String note
) {}
