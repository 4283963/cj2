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

    public PageResult<FleetAlertDTO> getAlerts(int page, int size) {
        List<String> allVehicleIds = lenglianRecordRepository.findDistinctVehicleIds();

        List<FleetAlertDTO> allAlerts = new ArrayList<>();

        for (String vehicleId : allVehicleIds) {
            Pageable topNPageable = PageRequest.of(0, consecutiveCount);
            List<LenglianRecord> latestRecords = lenglianRecordRepository
                    .findLatestRecordsByVehicleId(vehicleId, topNPageable);

            if (latestRecords.size() < consecutiveCount) {
                continue;
            }

            int consecutiveOverTemp = countConsecutiveOverTemp(latestRecords);

            if (consecutiveOverTemp >= consecutiveCount) {
                Pageable trackPageable = PageRequest.of(0, TRACK_POINT_COUNT);
                List<LenglianRecord> trackRecords = lenglianRecordRepository
                        .findLatestRecordsByVehicleId(vehicleId, trackPageable);

                LenglianRecord latestRecord = latestRecords.get(0);
                FleetAlertDTO alert = buildAlertDTO(latestRecord, trackRecords, consecutiveOverTemp);
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

    private int countConsecutiveOverTemp(List<LenglianRecord> records) {
        int count = 0;
        for (LenglianRecord record : records) {
            if (record.getTemperature().compareTo(temperatureThreshold) > 0) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    private FleetAlertDTO buildAlertDTO(LenglianRecord latestRecord, List<LenglianRecord> records, int consecutiveCount) {
        FleetAlertDTO dto = new FleetAlertDTO();
        dto.setVehicleId(latestRecord.getVehicleId());
        dto.setPlateNumber(latestRecord.getPlateNumber());
        dto.setCurrentTemperature(latestRecord.getTemperature());
        dto.setConsecutiveOverTempCount(consecutiveCount);
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
