// src/main/java/microservices/mission_service/dto/OperatorDto.java
package microservices.mission_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OperatorDto(
        UUID id,
        String username,
        String email,
        LocalDateTime createdAt
) {}
