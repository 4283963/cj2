package com.cj2.fleet.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notification_logs")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_type", nullable = false, length = 50)
    private String alertType;

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @Column(name = "entity_name", length = 200)
    private String entityName;

    @Column(name = "alert_message", length = 2000)
    private String alertMessage;

    @Column(name = "notification_channel", length = 50)
    private String notificationChannel;

    @Column(name = "webhook_url", length = 500)
    private String webhookUrl;

    @Column(name = "response_status", length = 50)
    private String responseStatus;

    @Column(name = "response_body", length = 2000)
    private String responseBody;

    @Column(name = "alert_time", nullable = false)
    private LocalDateTime alertTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (alertTime == null) {
            alertTime = LocalDateTime.now();
        }
    }
}
