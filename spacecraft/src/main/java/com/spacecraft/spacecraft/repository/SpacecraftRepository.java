package com.spacecraft.spacecraft.repository;

import com.spacecraft.spacecraft.model.Spacecraft;
import com.spacecraft.spacecraft.model.SpacecraftType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public interface SpacecraftRepository extends JpaRepository<Spacecraft, UUID> {
    Spacecraft findByExternalId(Long externalId);
    List<Spacecraft> findByMissionId(UUID missionId);
    List<Spacecraft> findByType(SpacecraftType type);

    List<Spacecraft> findByEnterpriseId(UUID enterpriseId);

    long countByMissionIdIn(List<UUID> missionIds);

    List<Spacecraft> findByMissionIdIn(List<UUID> missionIds);

    long countByEnterpriseId(UUID enterpriseId);

    @Query("""
        SELECT s.type, COUNT(s)
        FROM Spacecraft s
        WHERE s.enterpriseId = :enterpriseId
        GROUP BY s.type
    """)
    List<Object[]> findTypeCountsByEnterprise(@Param("enterpriseId") UUID enterpriseId);

    /**
     * Returns a map from type name to count for that enterprise.
     */
    default Map<String, Long> countByTypeAndEnterpriseId(UUID enterpriseId) {
        return findTypeCountsByEnterprise(enterpriseId).stream()
                .collect(Collectors.toMap(
                        tuple -> ((SpacecraftType) tuple[0]).name(),
                        tuple -> (Long) tuple[1]
                ));
    }
}
