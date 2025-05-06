// MissionStatsDTO.java
package com.dashboard.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class MissionStatsDTO {
    private long activeMissionCount;
    private long inactiveMissionCount;
    private Map<String, Long> missionsByMonth;
    private List<MissionDTO> missions;  // Changed to reuse a DTO if needed
    private int  distinctOperators;
    private List<UUID> spacecraftsCount;

    public long getActiveMissionCount() {
        return activeMissionCount;
    }

    public void setActiveMissionCount(long activeMissionCount) {
        this.activeMissionCount = activeMissionCount;
    }

    public long getInactiveMissionCount() {
        return inactiveMissionCount;
    }

    public void setInactiveMissionCount(long inactiveMissionCount) {
        this.inactiveMissionCount = inactiveMissionCount;
    }

    public Map<String, Long> getMissionsByMonth() {
        return missionsByMonth;
    }

    public void setMissionsByMonth(Map<String, Long> missionsByMonth) {
        this.missionsByMonth = missionsByMonth;
    }

    public List<MissionDTO> getMissions() {
        return missions;
    }

    public void setMissions(List<MissionDTO> missions) {
        this.missions = missions;
    }


    public int getDistinctOperators() {
        return distinctOperators;
    }

    public void setDistinctOperators(int distinctOperators) {
        this.distinctOperators = distinctOperators;
    }

    public List<UUID> getSpacecraftsCount() {
        return spacecraftsCount;
    }

    public void setSpacecraftsCount(List<UUID> spacecraftsCount) {
        this.spacecraftsCount = spacecraftsCount;
    }
}
