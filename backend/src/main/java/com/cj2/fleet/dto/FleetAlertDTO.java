package com.cj2.fleet.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FleetAlertDTO {

    private String vehicleId;

    private String plateNumber;

    private BigDecimal currentTemperature;

    private Integer consecutiveOverTempCount;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private LocalDateTime alertTime;

    private String warehouseId;

    private String warehouseName;

    private List<TrackPointDTO> track;

    @Data
    public static class TrackPointDTO {
        private BigDecimal lng;
        private BigDecimal lat;
        private String time;
        private BigDecimal temperature;
    }
}
