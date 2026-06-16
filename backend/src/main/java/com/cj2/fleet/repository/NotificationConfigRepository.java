package com.cj2.fleet.repository;

import com.cj2.fleet.entity.NotificationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationConfigRepository extends JpaRepository<NotificationConfig, Long> {

    @Query("SELECT c FROM NotificationConfig c WHERE c.enabled = true ORDER BY c.id DESC")
    Optional<NotificationConfig> findActiveConfig();
}
