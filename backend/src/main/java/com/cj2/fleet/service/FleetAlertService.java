package com.cj2.fleet.service;

import com.cj2.fleet.dto.FleetAlertDTO;
import com.cj2.fleet.dto.PageResult;
import com.cj2.fleet.entity.LenglianRecord;
import com.cj2.fleet.repository.LenglianRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FleetAlertService {

    @Autowired
    private LenglianRecordRepository lenglianRecordRepository;

    @Value("${fleet.alert.temperature-threshold:8.0}")
    private BigDecimal temperatureThreshold;

    @Value("${fleet.alert.consecutive-count:3}")
    private int consecutiveCount;

    private static final int TRACK_POINT_COUNT = 10;
    private static final int HISTORY_COUNT = 50;

    public PageResult<FleetAlertDTO> getAlerts(int page, int size) {
        List<FleetAlertDTO> allAlerts = new ArrayList<>();

        List<String> vehicleIds = lenglianRecordRepository.findDistinctVehicleIds();
        for (String vehicleId : vehicleIds) {
            FleetAlertDTO alert = checkAlertStatus(
                    vehicleId,
                    FleetAlertDTO.AlertType.VEHICLE
            );
            if (alert != null) {
                allAlerts.add(alert);
            }
        }

        List<String> warehouseIds = lenglianRecordRepository.findDistinctWarehouseIds();
        for (String warehouseId : warehouseIds) {
            FleetAlertDTO alert = checkAlertStatus(
                    warehouseId,
                    FleetAlertDTO.AlertType.WAREHOUSE
            );
            if (alert != null) {
                allAlerts.add(alert);
            }
        }

        allAlerts.sort(Comparator.comparing(FleetAlertDTO::getAlertTime).reversed());

        int totalElements = allAlerts.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<FleetAlertDTO> pageContent = fromIndex >= totalElements
                ? new ArrayList<>()
                : allAlerts.subList(fromIndex, toIndex);

        return new PageResult<>(pageContent, page, size, totalElements);
    }

    private FleetAlertDTO checkAlertStatus(String entityId, FleetAlertDTO.AlertType type) {
        Pageable historyPageable = PageRequest.of(0, HISTORY_COUNT);
        Pageable trackPageable = PageRequest.of(0, TRACK_POINT_COUNT);

        List<LenglianRecord> historyRecords;
        List<LenglianRecord> trackRecords;

        if (type == FleetAlertDTO.AlertType.VEHICLE) {
            historyRecords = lenglianRecordRepository.findLatestRecordsByVehicleId(entityId, historyPageable);
            trackRecords = lenglianRecordRepository.findLatestRecordsByVehicleId(entityId, trackPageable);
        } else {
            historyRecords = lenglianRecordRepository.findLatestRecordsByWarehouseId(entityId, historyPageable);
            trackRecords = lenglianRecordRepository.findLatestRecordsByWarehouseId(entityId, trackPageable);
        }

        if (historyRecords.size() < consecutiveCount) {
            return null;
        }

        boolean isInAlert = determineAlertStatus(historyRecords);

        if (!isInAlert) {
            return null;
        }

        int[] counts = calculateConsecutiveCounts(historyRecords);
        int consecutiveOverTemp = counts[0];
        int consecutiveNormal = counts[1];

        LenglianRecord latestRecord = historyRecords.get(0);
        return buildAlertDTO(latestRecord, trackRecords, consecutiveOverTemp, consecutiveNormal, type);
    }

    private boolean determineAlertStatus(List<LenglianRecord> records) {
        int i = 0;
        int n = records.size();

        while (i < n) {
            boolean currentOverTemp = isOverTemperature(records.get(i));

            int consecutiveCountOfCurrentState = 0;
            int j = i;
            while (j < n && isOverTemperature(records.get(j)) == currentOverTemp) {
                consecutiveCountOfCurrentState++;
                j++;
            }

            if (consecutiveCountOfCurrentState >= this.consecutiveCount) {
                return currentOverTemp;
            }

            i = j;
        }

        return false;
    }

    private int[] calculateConsecutiveCounts(List<LenglianRecord> records) {
        int consecutiveOverTemp = 0;
        int consecutiveNormal = 0;

        boolean latestIsOverTemp = isOverTemperature(records.get(0));

        for (LenglianRecord record : records) {
            boolean currentOverTemp = isOverTemperature(record);

            if (currentOverTemp == latestIsOverTemp) {
                if (currentOverTemp) {
                    consecutiveOverTemp++;
                } else {
                    consecutiveNormal++;
                }
            } else {
                break;
            }
        }

        return new int[]{consecutiveOverTemp, consecutiveNormal};
    }

    private boolean isOverTemperature(LenglianRecord record) {
        return record.getTemperature() != null
                && record.getTemperature().compareTo(temperatureThreshold) > 0;
    }

    private FleetAlertDTO buildAlertDTO(LenglianRecord latestRecord, List<LenglianRecord> records,
                                        int consecutiveOverTemp, int consecutiveNormal,
                                        FleetAlertDTO.AlertType type) {
        FleetAlertDTO dto = new FleetAlertDTO();
        dto.setAlertType(type);
        dto.setVehicleId(latestRecord.getVehicleId());
        dto.setPlateNumber(latestRecord.getPlateNumber());
        dto.setCurrentTemperature(latestRecord.getTemperature());
        dto.setConsecutiveOverTempCount(consecutiveOverTemp);
        dto.setConsecutiveNormalCount(consecutiveNormal);
        dto.setLatitude(latestRecord.getLatitude());
        dto.setLongitude(latestRecord.getLongitude());
        dto.setLocation(latestRecord.getLocation());
        dto.setAlertTime(latestRecord.getRecordTime());
        dto.setWarehouseId(latestRecord.getWarehouseId());
        dto.setWarehouseName(latestRecord.getWarehouseName());
        dto.setTrack(buildTrackPoints(records));
        return dto;
    }

    private List<FleetAlertDTO.TrackPointDTO> buildTrackPoints(List<LenglianRecord> records) {
        return records.stream()
                .sorted((r1, r2) -> r1.getRecordTime().compareTo(r2.getRecordTime()))
                .map(record -> {
                    FleetAlertDTO.TrackPointDTO point = new FleetAlertDTO.TrackPointDTO();
                    point.setLng(record.getLongitude());
                    point.setLat(record.getLatitude());
                    point.setTime(record.getRecordTime().toLocalTime().toString());
                    point.setTemperature(record.getTemperature());
                    return point;
                })
                .collect(Collectors.toList());
    }
}
