package com.cj2.fleet.service;

import com.cj2.fleet.entity.LenglianRecord;
import com.cj2.fleet.entity.NotificationConfig;
import com.cj2.fleet.repository.LenglianRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UrgentAlertService {

    private static final Logger logger = LoggerFactory.getLogger(UrgentAlertService.class);
    private static final int CHECK_RECORD_COUNT = 5;

    @Autowired
    private LenglianRecordRepository lenglianRecordRepository;

    @Autowired
    private NotificationConfigService notificationConfigService;

    @Autowired
    private WechatNotificationService wechatNotificationService;

    public void checkAndSendUrgentAlerts() {
        Optional<NotificationConfig> configOpt = notificationConfigService.getActiveConfig();
        if (configOpt.isEmpty()) {
            logger.info("通知配置未启用，跳过紧急告警检测");
            return;
        }

        NotificationConfig config = configOpt.get();
        if (!config.getEnabled()) {
            logger.info("通知功能已禁用，跳过紧急告警检测");
            return;
        }

        if (config.getEnableOfflineAlert()) {
            checkOfflineVehicles(config);
        }

        if (config.getEnableTempSpikeAlert()) {
            checkTemperatureSpikes(config);
        }
    }

    private void checkOfflineVehicles(NotificationConfig config) {
        List<String> vehicleIds = lenglianRecordRepository.findDistinctVehicleIds();
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(config.getOfflineTimeoutMinutes());

        for (String vehicleId : vehicleIds) {
            Pageable pageable = PageRequest.of(0, 1);
            List<LenglianRecord> latestRecords = lenglianRecordRepository
                    .findLatestRecordsByVehicleId(vehicleId, pageable);

            if (latestRecords.isEmpty()) {
                continue;
            }

            LenglianRecord latestRecord = latestRecords.get(0);
            if (latestRecord.getRecordTime().isBefore(cutoffTime)) {
                logger.warn("检测到设备离线：vehicleId={}, lastSeen={}", 
                        vehicleId, latestRecord.getRecordTime());
                wechatNotificationService.sendOfflineAlert(
                        vehicleId,
                        latestRecord.getPlateNumber(),
                        latestRecord.getRecordTime(),
                        config
                );
            }
        }
    }

    private void checkTemperatureSpikes(NotificationConfig config) {
        BigDecimal threshold = config.getTempSpikeThreshold();
        Pageable pageable = PageRequest.of(0, CHECK_RECORD_COUNT);

        List<String> vehicleIds = lenglianRecordRepository.findDistinctVehicleIds();
        for (String vehicleId : vehicleIds) {
            List<LenglianRecord> records = lenglianRecordRepository
                    .findLatestRecordsByVehicleId(vehicleId, pageable);
            checkRecordsForSpike(records, threshold, config, true);
        }

        List<String> warehouseIds = lenglianRecordRepository.findDistinctWarehouseIds();
        for (String warehouseId : warehouseIds) {
            List<LenglianRecord> records = lenglianRecordRepository
                    .findLatestRecordsByWarehouseId(warehouseId, pageable);
            checkRecordsForSpike(records, threshold, config, false);
        }
    }

    private void checkRecordsForSpike(List<LenglianRecord> records, BigDecimal threshold,
                                      NotificationConfig config, boolean isVehicle) {
        if (records.isEmpty()) {
            return;
        }

        LenglianRecord latest = records.get(0);
        if (latest.getTemperature() != null 
                && latest.getTemperature().compareTo(threshold) >= 0) {
            String entityId = isVehicle ? latest.getVehicleId() : latest.getWarehouseId();
            String entityName = isVehicle ? latest.getPlateNumber() : latest.getWarehouseName();

            logger.warn("检测到温度暴顶：entityId={}, temperature={}", 
                    entityId, latest.getTemperature());
            wechatNotificationService.sendTempSpikeAlert(
                    entityId,
                    entityName,
                    latest.getTemperature().doubleValue(),
                    isVehicle,
                    config
            );
        }
    }
}
