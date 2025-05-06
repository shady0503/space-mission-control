// src/main/java/com/telemetry/repository/SatelliteReferenceRepository.java
package com.telemetry.repository;

import com.telemetry.model.SatelliteReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SatelliteReferenceRepository
        extends JpaRepository<SatelliteReference, UUID> {

    boolean existsByExternalId(long externalId);

    SatelliteReference findByExternalId(long externalId);
    List<SatelliteReference> findByEnterpriseId(UUID enterpriseId);

    long countByEnterpriseId(UUID enterpriseId);
}
