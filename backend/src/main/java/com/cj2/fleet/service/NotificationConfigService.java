package com.cj2.fleet.service;

import com.cj2.fleet.dto.NotificationConfigDTO;
import com.cj2.fleet.entity.NotificationConfig;
import com.cj2.fleet.repository.NotificationConfigRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NotificationConfigService {

    @Autowired
    private NotificationConfigRepository notificationConfigRepository;

    public NotificationConfigDTO getConfig() {
        Optional<NotificationConfig> config = notificationConfigRepository.findActiveConfig();
        if (config.isPresent()) {
            return convertToDTO(config.get());
        }
        NotificationConfig defaultConfig = createDefaultConfig();
        return convertToDTO(defaultConfig);
    }

    public NotificationConfigDTO saveConfig(NotificationConfigDTO dto) {
        NotificationConfig config;
        if (dto.getId() != null) {
            config = notificationConfigRepository.findById(dto.getId())
                    .orElse(new NotificationConfig());
        } else {
            config = new NotificationConfig();
        }
        BeanUtils.copyProperties(dto, config);
        if (config.getConfigName() == null) {
            config.setConfigName("默认通知配置");
        }
        config = notificationConfigRepository.save(config);
        return convertToDTO(config);
    }

    public Optional<NotificationConfig> getActiveConfig() {
        return notificationConfigRepository.findActiveConfig();
    }

    private NotificationConfig createDefaultConfig() {
        NotificationConfig config = new NotificationConfig();
        config.setConfigName("默认通知配置");
        config.setEnabled(true);
        config.setEnableOfflineAlert(true);
        config.setOfflineTimeoutMinutes(3);
        config.setEnableTempSpikeAlert(true);
        config.setTempSpikeThreshold(new java.math.BigDecimal("20.0"));
        config.setCooldownMinutes(10);
        return notificationConfigRepository.save(config);
    }

    private NotificationConfigDTO convertToDTO(NotificationConfig config) {
        NotificationConfigDTO dto = new NotificationConfigDTO();
        BeanUtils.copyProperties(config, dto);
        return dto;
    }
}
