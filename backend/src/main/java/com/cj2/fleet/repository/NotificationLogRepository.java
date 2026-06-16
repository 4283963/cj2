package com.cj2.fleet.repository;

import com.cj2.fleet.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    @Query("SELECT l FROM NotificationLog l WHERE l.entityId = :entityId AND l.alertType = :alertType AND l.alertTime >= :cooldownTime ORDER BY l.alertTime DESC")
    Optional<NotificationLog> findLatestByEntityAndTypeWithinCooldown(
            @Param("entityId") String entityId,
            @Param("alertType") String alertType,
            @Param("cooldownTime") LocalDateTime cooldownTime
    );
}
