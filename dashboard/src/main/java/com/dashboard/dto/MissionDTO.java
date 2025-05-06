// src/main/java/com/dashboard/dto/MissionDto.java
package com.dashboard.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for missions returned by the mission‐service.
 * Maps to JSON:
 * {
 *   "id": "4f7933e2-5875-40c3-ada9-c3eafa75b951",
 *   "enterpriseId": "8bd26a26-e0bb-43f8-80bf-e8b87f014afd",
 *   "name": "Your Mission Name",
 *   "description": "A brief description of the mission",
 *   "startDate": "2025-05-05T00:00:00",
 *   "endDate": "2025-06-05T00:00:00",
 *   "status": "PLANNING",
 *   "createdAt": "2025-05-02T00:46:59.953967"
 * }
 */
public class MissionDTO {
    private UUID id;
    private UUID enterpriseId;
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private LocalDateTime createdAt;

    public MissionDTO() {
    }

    public MissionDTO(
            UUID id,
            UUID enterpriseId,
            String name,
            String description,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String status,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.enterpriseId = enterpriseId;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
