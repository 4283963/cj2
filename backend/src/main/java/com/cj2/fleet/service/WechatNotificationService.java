package com.cj2.fleet.service;

import com.cj2.fleet.entity.NotificationConfig;
import com.cj2.fleet.entity.NotificationLog;
import com.cj2.fleet.repository.NotificationLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class WechatNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WechatNotificationService.class);

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean shouldSendNotification(String entityId, String alertType, NotificationConfig config) {
        if (config.getCooldownMinutes() <= 0) {
            return true;
        }
        LocalDateTime cooldownTime = LocalDateTime.now().minusMinutes(config.getCooldownMinutes());
        return notificationLogRepository.findLatestByEntityAndTypeWithinCooldown(
                entityId, alertType, cooldownTime
        ).isEmpty();
    }

    public void sendOfflineAlert(String vehicleId, String plateNumber, LocalDateTime lastSeenTime, NotificationConfig config) {
        if (!shouldSendNotification(vehicleId, "OFFLINE", config)) {
            logger.info("跳过离线告警通知，冷却期内：vehicleId={}", vehicleId);
            return;
        }

        long minutesAgo = java.time.Duration.between(lastSeenTime, LocalDateTime.now()).toMinutes();
        String message = String.format(
                "🚨【设备离线告警】\n\n" +
                "📋 设备类型：冷藏车\n" +
                "🚚 车辆号牌：%s\n" +
                "🔧 设备编号：%s\n" +
                "⏰ 最后在线：%s\n" +
                "⌛ 已离线：%d 分钟\n" +
                "💡 已超过 %d 分钟未收到报文，请立即检查设备和网络状态！",
                plateNumber, vehicleId, lastSeenTime.toString(), minutesAgo, config.getOfflineTimeoutMinutes()
        );

        sendWechatMessage(message, vehicleId, plateNumber, "OFFLINE", config);
    }

    public void sendTempSpikeAlert(String entityId, String entityName, double temperature, 
                                   boolean isVehicle, NotificationConfig config) {
        String alertType = "TEMP_SPIKE";
        if (!shouldSendNotification(entityId, alertType, config)) {
            logger.info("跳过温度暴顶告警通知，冷却期内：entityId={}", entityId);
            return;
        }

        String entityType = isVehicle ? "冷藏车" : "前置仓";
        String icon = isVehicle ? "🚚" : "🏭";
        String message = String.format(
                "🔥【温度暴顶告警】\n\n" +
                "📋 设备类型：%s\n" +
                "%s 设备名称：%s\n" +
                "🔧 设备编号：%s\n" +
                "🌡️ 当前温度：%.1f°C\n" +
                "⚠️ 告警阈值：%.1f°C\n" +
                "⏰ 告警时间：%s\n" +
                "💡 温度已严重超标，请立即采取降温措施！",
                entityType, icon, entityName, entityId, temperature,
                config.getTempSpikeThreshold(), LocalDateTime.now().toString()
        );

        sendWechatMessage(message, entityId, entityName, alertType, config);
    }

    private void sendWechatMessage(String message, String entityId, String entityName, 
                                   String alertType, NotificationConfig config) {
        String webhookUrl = config.getWechatWebhookUrl();
        if (webhookUrl == null || webhookUrl.trim().isEmpty()) {
            logger.warn("微信 Webhook 未配置，跳过通知");
            return;
        }

        NotificationLog log = new NotificationLog();
        log.setAlertType(alertType);
        log.setEntityId(entityId);
        log.setEntityName(entityName);
        log.setAlertMessage(message);
        log.setNotificationChannel("WECHAT");
        log.setWebhookUrl(webhookUrl);
        log.setAlertTime(LocalDateTime.now());

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("msgtype", "text");
            Map<String, Object> text = new HashMap<>();
            text.put("content", message);
            payload.put("text", text);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    webhookUrl, HttpMethod.POST, request, String.class
            );

            log.setResponseStatus(String.valueOf(response.getStatusCode().value()));
            log.setResponseBody(response.getBody());

            logger.info("微信通知发送成功：entityId={}, alertType={}", entityId, alertType);
        } catch (Exception e) {
            logger.error("微信通知发送失败：entityId={}, alertType={}", entityId, alertType, e);
            log.setResponseStatus("ERROR");
            log.setResponseBody(e.getMessage());
        } finally {
            notificationLogRepository.save(log);
        }
    }
}
