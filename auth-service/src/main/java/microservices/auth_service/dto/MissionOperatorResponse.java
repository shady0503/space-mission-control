// src/main/java/microservices/auth_service/dto/MissionOperatorResponse.java
package microservices.auth_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MissionOperatorResponse(
        UUID id,
        UUID missionId,
        UUID operatorId,
        MissionRole role,
        LocalDateTime assignedAt
) {}
