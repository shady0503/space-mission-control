package com.entreprise.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Operator service aggregation.
 */
public class OperatorDto {
    private UUID id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private UUID enterpriseId;

    public OperatorDto() {
    }
    public OperatorDto(UUID id, String username, String email, String role, LocalDateTime createdAt, UUID enterpriseId) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
        this.enterpriseId = enterpriseId;
    }

    public UUID getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
