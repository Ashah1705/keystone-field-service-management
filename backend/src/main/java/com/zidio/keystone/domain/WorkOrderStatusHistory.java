package com.zidio.keystone.domain;

import com.zidio.keystone.domain.enums.WorkOrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Append-only audit trail. Rows are never edited or deleted (Section 05 integrity rule) -
 * there is deliberately no setter-driven update path; only the constructor populates a row.
 */
@Entity
@Table(name = "work_order_status_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private WorkOrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private WorkOrderStatus toStatus;

    @Column(name = "changed_by", nullable = false)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    private String note;
}
