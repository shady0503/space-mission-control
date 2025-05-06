// src/main/java/microservices/auth_service/dto/OperatorRoleUpdateRequest.java
package microservices.auth_service.dto;

import java.util.UUID;

public record OperatorRoleUpdateRequest(
        UUID missionId,
        UUID operatorId,
        MissionRole role
) {}
