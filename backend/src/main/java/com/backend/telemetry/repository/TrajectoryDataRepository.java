package com.backend.telemetry.repository;

import com.backend.telemetry.model.TrajectoryData;
import com.backend.telemetry.model.TrajectoryDataKey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrajectoryDataRepository extends JpaRepository<TrajectoryData, TrajectoryDataKey> {
    // Add custom queries if needed
}
