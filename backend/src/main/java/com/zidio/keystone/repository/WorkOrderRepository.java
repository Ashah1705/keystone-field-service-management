package com.zidio.keystone.repository;

import com.zidio.keystone.domain.WorkOrder;
import com.zidio.keystone.domain.enums.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    // Role-scoped queries - every list endpoint goes through one of these,
    // never a bare findAll(), so a customer can never see another customer's jobs.

    Page<WorkOrder> findByCustomerId(Long customerId, Pageable pageable);

    @Query(value = """
           select w from WorkOrder w
           join fetch w.customer join fetch w.site left join fetch w.assignedTo
           where w.assignedTo.id = :technicianId
           """,
           countQuery = "select count(w) from WorkOrder w where w.assignedTo.id = :technicianId")
    Page<WorkOrder> findByAssignedToId(@Param("technicianId") Long technicianId, Pageable pageable);

    @Query(value = """
           select w from WorkOrder w
           join fetch w.customer join fetch w.site left join fetch w.assignedTo
           where (:status is null or w.status = :status)
             and (:customerId is null or w.customer.id = :customerId)
             and (:q = '' or lower(w.title) like lower(concat('%', :q, '%'))
                or lower(w.code) like lower(concat('%', :q, '%')))
              """,
           countQuery = """
           select count(w) from WorkOrder w
           where (:status is null or w.status = :status)
             and (:customerId is null or w.customer.id = :customerId)
             and (:q = '' or lower(w.title) like lower(concat('%', :q, '%'))
                or lower(w.code) like lower(concat('%', :q, '%')))
              """)
    Page<WorkOrder> search(@Param("status") WorkOrderStatus status,
                            @Param("customerId") Long customerId,
                            @Param("q") String q,
                            Pageable pageable);

    List<WorkOrder> findByStatusNotInAndSlaDueAtBeforeAndSlaBreachedFalse(
            List<WorkOrderStatus> terminalStatuses, Instant now);

    long countByStatus(WorkOrderStatus status);

    @Query("select count(w) from WorkOrder w where w.slaDueAt < :now and w.status not in :terminal")
    long countOverdue(@Param("now") Instant now, @Param("terminal") List<WorkOrderStatus> terminal);
}
