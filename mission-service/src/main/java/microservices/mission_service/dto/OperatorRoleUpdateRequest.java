package microservices.mission_service.dto;

import microservices.mission_service.model.MissionRole;
import java.util.UUID;

/**
 * Payload for changing an operator's role on a mission.
 */
public record OperatorRoleUpdateRequest(
        UUID missionId,
        UUID operatorId,
        MissionRole role
) { }
