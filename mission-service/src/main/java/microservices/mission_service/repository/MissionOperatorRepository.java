// src/main/java/microservices/mission_service/repository/MissionOperatorRepository.java
package microservices.mission_service.repository;

import microservices.mission_service.model.MissionOperator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MissionOperatorRepository extends JpaRepository<MissionOperator, UUID> {
    List<MissionOperator> findByOperatorId(UUID operatorId);
    long countByMissionId(UUID missionId);
    Optional<MissionOperator> findByMissionIdAndOperatorId(UUID missionId, UUID operatorId);


    @Query("""
      SELECT COUNT(DISTINCT mo.mission)
      FROM MissionOperator mo
      JOIN mo.mission m
      WHERE mo.operatorId = :operatorId
        AND (
          (:active = true  AND m.startDate >= CURRENT_TIMESTAMP)
          OR
          (:active = false AND m.startDate <  CURRENT_TIMESTAMP)
        )
      """)
    long countByOperatorIdAndActive(
            @Param("operatorId") UUID operatorId,
            @Param("active")     boolean active
    );

    // get distinct mission IDs for operator
    @Query("SELECT DISTINCT mo.mission.id FROM MissionOperator mo WHERE mo.operatorId = :operatorId")
    List<UUID> findMissionIdsByOperator(@Param("operatorId") UUID operatorId);

    // count distinct operators across missions
    @Query("SELECT COUNT(DISTINCT mo.operatorId) FROM MissionOperator mo WHERE mo.mission.id IN :missionIds")
    int countDistinctOperatorByMissionIds(@Param("missionIds") List<UUID> missionIds);

    // list all mission IDs for given list
    @Query("SELECT DISTINCT mo.mission FROM MissionOperator mo WHERE mo.mission IN :missionIds")
    List<UUID> findMissionsIn(@Param("missionIds") List<UUID> missionIds);

    List<MissionOperator> findByMissionId(UUID missionId);
}
