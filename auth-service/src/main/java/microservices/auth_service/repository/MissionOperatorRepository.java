// src/main/java/microservices/auth_service/repository/MissionOperatorRepository.java
package microservices.auth_service.repository;

import microservices.auth_service.model.MissionOperator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MissionOperatorRepository extends JpaRepository<MissionOperator, UUID> {
    Optional<MissionOperator> findByMissionIdAndOperator_Id(UUID missionId, UUID operatorId);

    @Query("""
    SELECT mo 
      FROM MissionOperator mo
      JOIN FETCH mo.operator
     WHERE mo.missionId = :missionId
  """)
    List<MissionOperator> findByMissionIdFetchOperator(@Param("missionId") UUID missionId);
}
