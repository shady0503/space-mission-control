// src/main/java/com/telemetry/repository/SatelliteReferenceRepository.java
package com.telemetry.repository;

import com.telemetry.model.SatelliteReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SatelliteReferenceRepository extends JpaRepository<SatelliteReference, UUID> {

    boolean existsByExternalId(Long externalId);

    List<SatelliteReference> findByEnterpriseId(UUID enterpriseId);

    Optional<SatelliteReference> findByExternalId(Long externalId);

    long countByEnterpriseId(UUID enterpriseId);
}