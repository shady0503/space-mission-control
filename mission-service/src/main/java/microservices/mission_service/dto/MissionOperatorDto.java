package microservices.mission_service.dto;

import microservices.mission_service.model.MissionRole;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for assignment of an operator to a mission.
 */
public record MissionOperatorDto(
        UUID id,
        UUID missionId,
        UUID operatorId,
        MissionRole role,
        LocalDateTime assignedAt
) { }
