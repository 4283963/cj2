package com.cj2.fleet.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class UrgentAlertScheduler {

    private static final Logger logger = LoggerFactory.getLogger(UrgentAlertScheduler.class);

    @Autowired
    private UrgentAlertService urgentAlertService;

    @Scheduled(fixedRate = 60000)
    public void scheduledCheck() {
        logger.debug("定时紧急告警检测开始...");
        try {
            urgentAlertService.checkAndSendUrgentAlerts();
        } catch (Exception e) {
            logger.error("定时紧急告警检测异常", e);
        }
    }
}
