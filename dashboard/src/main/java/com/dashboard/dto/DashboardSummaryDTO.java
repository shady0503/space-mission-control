package com.dashboard.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class DashboardSummaryDTO {
    private long activeMissionCount;
    private long totalSpacecraftCount;
    private long activeOperatorCount;
    private long pendingCommandCount;
    private long recentAlertCount;

    public long getActiveMissionCount() {
        return activeMissionCount;
    }

    public void setActiveMissionCount(long activeMissionCount) {
        this.activeMissionCount = activeMissionCount;
    }

    public long getTotalSpacecraftCount() {
        return totalSpacecraftCount;
    }

    public void setTotalSpacecraftCount(long totalSpacecraftCount) {
        this.totalSpacecraftCount = totalSpacecraftCount;
    }

    public long getActiveOperatorCount() {
        return activeOperatorCount;
    }

    public void setActiveOperatorCount(long activeOperatorCount) {
        this.activeOperatorCount = activeOperatorCount;
    }

    public long getPendingCommandCount() {
        return pendingCommandCount;
    }

    public void setPendingCommandCount(long pendingCommandCount) {
        this.pendingCommandCount = pendingCommandCount;
    }

    public long getRecentAlertCount() {
        return recentAlertCount;
    }

    public void setRecentAlertCount(long recentAlertCount) {
        this.recentAlertCount = recentAlertCount;
    }
}
