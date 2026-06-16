package com.cj2.fleet.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class NotificationConfigDTO {

    private Long id;
    private String configName;
    private String wechatWebhookUrl;
    private Boolean enabled;
    private Boolean enableOfflineAlert;
    private Integer offlineTimeoutMinutes;
    private Boolean enableTempSpikeAlert;
    private BigDecimal tempSpikeThreshold;
    private Integer cooldownMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
