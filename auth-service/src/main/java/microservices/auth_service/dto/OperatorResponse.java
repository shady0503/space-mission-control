// src/main/java/microservices/auth_service/dto/OperatorResponse.java
package microservices.auth_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OperatorResponse(
        UUID id,
        String username,
        String email,
        LocalDateTime createdAt,
        UUID enterpriseId) {}
