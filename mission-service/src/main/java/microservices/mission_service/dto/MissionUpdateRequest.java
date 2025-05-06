package microservices.mission_service.dto;

import microservices.mission_service.model.MissionStatus;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Payload for updating an existing mission.
 * Only non-null fields will be applied.
 */
public record MissionUpdateRequest(
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        MissionStatus status
) { }