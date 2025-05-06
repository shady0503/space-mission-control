// src/main/java/com/telemetry/repository/TrajectoryDataRepository.java
package com.telemetry.repository;

import com.telemetry.model.TrajectoryData;
import com.telemetry.dto.TrajectoryDataKey;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrajectoryDataRepository
        extends JpaRepository<TrajectoryData, TrajectoryDataKey> {

    Optional<TrajectoryData> findFirstByIdExternalIdOrderByIdTimestampDesc(long externalId);

    List<TrajectoryData> findByIdExternalIdOrderByIdTimestampAsc(long externalId);

    List<TrajectoryData> findByIdExternalIdOrderByIdTimestampDesc(
            long externalId,
            Pageable pageable
    );

    @Query("""
    SELECT t
      FROM TrajectoryData t
     WHERE t.id.externalId = :externalId
       AND t.id.timestamp BETWEEN :start AND :end
     ORDER BY t.id.timestamp
    """)
    List<TrajectoryData> findByExternalIdAndTimeRange(
            @Param("externalId") long externalId,
            @Param("start") java.sql.Timestamp start,
            @Param("end")   java.sql.Timestamp end
    );

    Optional<TrajectoryData>
    findTopByIdExternalIdOrderByIdTimestampDesc(Long externalId);



    @Query("SELECT DISTINCT t.id.externalId FROM TrajectoryData t")
    List<Long> findDistinctExternalIds();

    Optional<TrajectoryData> findTopByIdExternalIdOrderByIdTimestampDesc(long externalId);
    long countByIdTimestampAfterAndIdExternalId(Timestamp since, long externalId);

}
