// com/dashboard/dto/TelemetryCountRequest.java
package com.dashboard.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class TelemetryCountRequest {
    private List<UUID> missionIds;
    private Instant since;

    public TelemetryCountRequest() {}

    public TelemetryCountRequest(List<UUID> missionIds, Instant since) {
        this.missionIds = missionIds;
        this.since     = since;
    }

    public List<UUID> getMissionIds() {
        return missionIds;
    }

    public void setMissionIds(List<UUID> missionIds) {
        this.missionIds = missionIds;
    }

    public Instant getSince() {
        return since;
    }

    public void setSince(Instant since) {
        this.since = since;
    }
}
