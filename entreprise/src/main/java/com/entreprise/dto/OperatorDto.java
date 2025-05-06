package com.entreprise.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for Operator service aggregation.
 */
public class OperatorDto {
    private UUID id;
    private String username;
    private String email;
    private Instant createdAt;
    private UUID enterpriseId;

    public OperatorDto(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public OperatorDto(UUID id, String username, String email, String role, Instant createdAt, UUID enterpriseId) {
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
