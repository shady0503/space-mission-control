package com.telemetry.dto;

import java.util.List;
import java.util.UUID;

public class TelemetryCountRequest {
    private List<UUID> missionIds;
    public List<UUID> getMissionIds() { return missionIds; }
    public void setMissionIds(List<UUID> missionIds) { this.missionIds = missionIds; }
}