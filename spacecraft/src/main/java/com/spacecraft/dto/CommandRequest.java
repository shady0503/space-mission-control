package com.spacecraft.dto;

import com.spacecraft.spacecraft.model.CommandType;
import java.util.UUID;

/**
 * Data Transfer Object for creating new commands
 * Separates the API contract from the internal model
 */
public class CommandRequest {
    private UUID spacecraftId; // Field name changed from spacecraft_id to spacecraftId
    private CommandType commandType;
    private UUID operatorId;
    private String  payload; // Can be either JSON string or an object to be serialized

    // Default constructor
    public CommandRequest() {
    }

    // Full constructor
    public CommandRequest(UUID spacecraftId, CommandType commandType, UUID operatorId, String payload) {
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

    // Alternative getter/setter with consistent naming (if you prefer to update calling code)
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

    public Object getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }
}