// CommandStatsDTO.java
package com.dashboard.dto;

import java.util.Map;
import java.util.UUID;

public class CommandStatsDTO {
    private long successfulCommandCount;
    private long pendingCommandCount;
    private Map<String, Long> commandsByType;
    private Map<UUID, Long> commandsByOperator;  // key is operatorId

    public long getSuccessfulCommandCount() {
        return successfulCommandCount;
    }

    public void setSuccessfulCommandCount(long successfulCommandCount) {
        this.successfulCommandCount = successfulCommandCount;
    }

    public long getPendingCommandCount() {
        return pendingCommandCount;
    }

    public void setPendingCommandCount(long pendingCommandCount) {
        this.pendingCommandCount = pendingCommandCount;
    }

    public Map<String, Long> getCommandsByType() {
        return commandsByType;
    }

    public void setCommandsByType(Map<String, Long> commandsByType) {
        this.commandsByType = commandsByType;
    }

    public Map<UUID, Long> getCommandsByOperator() {
        return commandsByOperator;
    }

    public void setCommandsByOperator(Map<UUID, Long> commandsByOperator) {
        this.commandsByOperator = commandsByOperator;
    }
}
