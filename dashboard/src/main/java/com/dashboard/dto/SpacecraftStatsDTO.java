// SpacecraftStatsDTO.java
package com.dashboard.dto;

import java.util.Map;

public class SpacecraftStatsDTO {
    private Map<String, Long> countByType;
    private long activeSpacecraftCount;
    private double averageOrbitRadius;

    public Map<String, Long> getCountByType() {
        return countByType;
    }

    public void setCountByType(Map<String, Long> countByType) {
        this.countByType = countByType;
    }

    public long getActiveSpacecraftCount() {
        return activeSpacecraftCount;
    }

    public void setActiveSpacecraftCount(long activeSpacecraftCount) {
        this.activeSpacecraftCount = activeSpacecraftCount;
    }

    public double getAverageOrbitRadius() {
        return averageOrbitRadius;
    }

    public void setAverageOrbitRadius(double averageOrbitRadius) {
        this.averageOrbitRadius = averageOrbitRadius;
    }
}

