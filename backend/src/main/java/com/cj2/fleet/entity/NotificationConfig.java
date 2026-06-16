package com.cj2.fleet.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notification_configs")
public class NotificationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_name", nullable = false, length = 200)
    private String configName;

    @Column(name = "wechat_webhook_url", length = 500)
    private String wechatWebhookUrl;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "enable_offline_alert", nullable = false)
    private Boolean enableOfflineAlert = true;

    @Column(name = "offline_timeout_minutes", nullable = false)
    private Integer offlineTimeoutMinutes = 3;

    @Column(name = "enable_temp_spike_alert", nullable = false)
    private Boolean enableTempSpikeAlert = true;

    @Column(name = "temp_spike_threshold", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal tempSpikeThreshold = new java.math.BigDecimal("20.0");

    @Column(name = "cooldown_minutes", nullable = false)
    private Integer cooldownMinutes = 10;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
