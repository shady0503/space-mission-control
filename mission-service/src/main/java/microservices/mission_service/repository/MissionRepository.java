// src/main/java/microservices/mission_service/repository/MissionRepository.java
package microservices.mission_service.repository;

import microservices.mission_service.dto.MissionMonthlyCount;
import microservices.mission_service.model.Mission;
import microservices.mission_service.model.MissionOperator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MissionRepository extends JpaRepository<Mission, UUID> {
    List<Mission> findByIdIn(Collection<UUID> ids);

    List<Mission> findByEnterpriseId(UUID enterpriseId);

    @Query("""

                SELECT
      FUNCTION('DATE_TRUNC','month', m.createdAt)    AS month,
      COUNT(m)                                        AS count
    FROM Mission m
    GROUP BY FUNCTION('DATE_TRUNC','month', m.createdAt)
    ORDER BY FUNCTION('DATE_TRUNC','month', m.createdAt)
    """)
        List<MissionMonthlyCount> getMissionsByMonth();

    long countByEnterpriseId(UUID enterpriseId);

}

