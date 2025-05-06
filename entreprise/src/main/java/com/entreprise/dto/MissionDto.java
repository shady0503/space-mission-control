package com.entreprise.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for Mission service aggregation.
 */
public class MissionDto {
    private UUID id;
    private String name;
    private String description;
    private Instant startDate;
    private Instant endDate;

    public MissionDto() {}

    public MissionDto(UUID id, String name, String description, Instant startDate, Instant endDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public Instant getStartDate() {
        return startDate;
    }

    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
    }

    public Instant getEndDate() {
        return endDate;
    }

    public void setEndDate(Instant endDate) {
        this.endDate = endDate;
    }
}
