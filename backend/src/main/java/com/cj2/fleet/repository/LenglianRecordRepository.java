package com.cj2.fleet.repository;

import com.cj2.fleet.entity.LenglianRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LenglianRecordRepository extends JpaRepository<LenglianRecord, Long> {

    @Query("SELECT r FROM LenglianRecord r WHERE r.vehicleId = :vehicleId ORDER BY r.recordTime DESC")
    List<LenglianRecord> findTopNByVehicleIdOrderByRecordTimeDesc(@Param("vehicleId") String vehicleId, Pageable pageable);

    @Query("SELECT DISTINCT r.vehicleId FROM LenglianRecord r")
    Page<String> findDistinctVehicleIds(Pageable pageable);

    @Query("SELECT DISTINCT r.vehicleId FROM LenglianRecord r")
    List<String> findDistinctVehicleIds();

    @Query("SELECT r FROM LenglianRecord r WHERE r.vehicleId = :vehicleId ORDER BY r.recordTime DESC")
    List<LenglianRecord> findLatestRecordsByVehicleId(@Param("vehicleId") String vehicleId, Pageable pageable);

    @Query("SELECT r FROM LenglianRecord r WHERE r.vehicleId IN :vehicleIds ORDER BY r.vehicleId, r.recordTime DESC")
    List<LenglianRecord> findByVehicleIdInOrderByRecordTimeDesc(@Param("vehicleIds") List<String> vehicleIds);

    long countByVehicleId(String vehicleId);
}
