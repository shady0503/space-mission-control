package com.spacecraft.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.spacecraft.spacecraft.model.CommandType;
import java.util.UUID;

/**
 * Data Transfer Object for creating new commands
 * Separates the API contract from the internal model
 */
public class CommandRequest {
    private UUID spacecraftId;
    private CommandType commandType;
    private UUID operatorId;

    @JsonProperty("payload")
    private JsonNode payload; // Changed from Object to JsonNode for better JSON handling

    // Default constructor
    public CommandRequest() {
    }

    // Full constructor
    public CommandRequest(UUID spacecraftId, CommandType commandType, UUID operatorId, JsonNode payload) {
        this.spacecraftId = spacecraftId;
        this.commandType = commandType;
        this.operatorId = operatorId;
        this.payload = payload;
    }

    // Getters and setters with consistent naming
    public UUID getSpacecraft() { // Kept method name for backward compatibility
        return spacecraftId;
    }

    public void setSpacecraft(UUID spacecraftId) { // Kept method name for backward compatibility
        this.spacecraftId = spacecraftId;
    }

    // Alternative getter/setter with consistent naming
    public UUID getSpacecraftId() {
        return spacecraftId;
    }

    public void setSpacecraftId(UUID spacecraftId) {
        this.spacecraftId = spacecraftId;
    }

    public CommandType getCommandType() {
        return commandType;
    }

    public void setCommandType(CommandType commandType) {
        this.commandType = commandType;
    }

    public UUID getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(UUID operatorId) {
        this.operatorId = operatorId;
    }

    public JsonNode getPayload() {
        return payload;
    }

    public void setPayload(JsonNode payload) {
        this.payload = payload;
    }

    @Override
    public String toString() {
        return "CommandRequest{" +
                "spacecraftId=" + spacecraftId +
                ", commandType=" + commandType +
                ", operatorId=" + operatorId +
                ", payload=" + payload +
                '}';
    }
}