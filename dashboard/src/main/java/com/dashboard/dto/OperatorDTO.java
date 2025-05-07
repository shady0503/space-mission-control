package com.dashboard.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class OperatorDTO {
    private UUID id;
    private String username;
    private String email;
    private UUID enterpriseId;

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

    public UUID getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OperatorDTO() {
    }

    public OperatorDTO(UUID id, String username, String email, UUID enterpriseId, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.enterpriseId = enterpriseId;
        this.createdAt = createdAt;
    }

    private LocalDateTime createdAt;
}
