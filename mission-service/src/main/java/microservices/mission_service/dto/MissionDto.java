package microservices.mission_service.dto;

import microservices.mission_service.model.MissionStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Read-only DTO for Mission.
 */
public record MissionDto(
        UUID id,
        UUID enterpriseId,
        String name,
        String description,
        LocalDateTime startDate,
        LocalDateTime endDate,
        MissionStatus status,
        LocalDateTime createdAt
) { }
