// src/main/java/com/spacecraft/spacecraft/model/Command.java
package com.spacecraft.spacecraft.model;

import java.util.Date;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "command")
public class Command {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // simple unidirectional FK to Spacecraft
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spacecraft_id", nullable = false)
    @JsonBackReference
    private Spacecraft spacecraft;

    @Enumerated(EnumType.STRING)
    @Column(name = "command_type", nullable = false)
    private CommandType commandType;

    @Column(name = "operator_id", columnDefinition = "uuid", nullable = false)
    private UUID operatorId;

    // Use TEXT for H2 compatibility, JSONB for PostgreSQL
    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false)
    private Boolean status;

    @Column(name = "created_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "executed_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date executedAt;

    public Command() {}

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public CommandType getCommandType() {
        return commandType;
    }

    public void setCommandType(CommandType commandType) {
        this.commandType = commandType;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Date executedAt) {
        this.executedAt = executedAt;
    }

    public Spacecraft getSpacecraft() {
        return spacecraft;
    }

    public void setSpacecraft(Spacecraft spacecraft) {
        this.spacecraft = spacecraft;
    }

    public UUID getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(UUID operatorId) {
        this.operatorId = operatorId;
    }

    public Command(Spacecraft spacecraft,
                   CommandType commandType,
                   String payload,
                   Boolean status,
                   Date createdAt,
                   Date executedAt) {
        this.spacecraft   = spacecraft;
        this.commandType  = commandType;
        this.payload      = payload;
        this.status       = status;
        this.createdAt    = createdAt;
        this.executedAt   = executedAt;
    }
}