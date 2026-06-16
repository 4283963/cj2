package com.cj2.fleet.controller;

import com.cj2.fleet.dto.NotificationConfigDTO;
import com.cj2.fleet.service.NotificationConfigService;
import com.cj2.fleet.service.UrgentAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/fleet/notification-config")
@CrossOrigin(origins = "*")
public class NotificationConfigController {

    @Autowired
    private NotificationConfigService notificationConfigService;

    @Autowired
    private UrgentAlertService urgentAlertService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> response = new HashMap<>();
        try {
            NotificationConfigDTO config = notificationConfigService.getConfig();
            response.put("code", 200);
            response.put("message", "success");
            response.put("data", config);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveConfig(@RequestBody NotificationConfigDTO config) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotificationConfigDTO saved = notificationConfigService.saveConfig(config);
            response.put("code", 200);
            response.put("message", "配置保存成功");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testNotification() {
        Map<String, Object> response = new HashMap<>();
        try {
            urgentAlertService.checkAndSendUrgentAlerts();
            response.put("code", 200);
            response.put("message", "紧急告警检测已触发，请查看通知日志");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "检测触发失败：" + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateConfig(
            @PathVariable Long id, @RequestBody NotificationConfigDTO config) {
        Map<String, Object> response = new HashMap<>();
        try {
            config.setId(id);
            NotificationConfigDTO saved = notificationConfigService.saveConfig(config);
            response.put("code", 200);
            response.put("message", "配置更新成功");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleEnabled() {
        Map<String, Object> response = new HashMap<>();
        try {
            NotificationConfigDTO current = notificationConfigService.getConfig();
            current.setEnabled(!current.getEnabled());
            NotificationConfigDTO saved = notificationConfigService.saveConfig(current);
            response.put("code", 200);
            response.put("message", saved.getEnabled() ? "通知已启用" : "通知已禁用");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
