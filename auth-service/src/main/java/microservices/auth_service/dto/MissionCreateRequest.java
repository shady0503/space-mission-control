package microservices.auth_service.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Payload for creating a new mission.
 */
public record MissionCreateRequest(
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        UUID enterpriseId
) { }