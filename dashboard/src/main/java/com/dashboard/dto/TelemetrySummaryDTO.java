package com.dashboard.dto;

import java.util.List;
import java.util.Map;

/**
 * Wrapper DTO that contains per-spacecraft telemetry details and overall system metrics.
 */
public class TelemetrySummaryDTO {

    /** List of telemetry snapshots for individual spacecrafts */
    private List<SpacecraftTelemetry> spacecrafts;

    /** Overall system-wide telemetry metrics */
    private SystemMetrics system;

    public List<SpacecraftTelemetry> getSpacecrafts() {
        return spacecrafts;
    }

    public void setSpacecrafts(List<SpacecraftTelemetry> spacecrafts) {
        this.spacecrafts = spacecrafts;
    }

    public SystemMetrics getSystem() {
        return system;
    }

    public void setSystem(SystemMetrics system) {
        this.system = system;
    }

    /**
     * DTO for a single spacecraft's telemetry snapshot.
     */
    public static class SpacecraftTelemetry {
        private Long externalId;
        private String spacecraftName;
        private Map<String, Float> currentPosition;
        private float currentVelocity;
        private float currentOrbitRadius;
        private String timestamp;
        private long dataPointsLast24h;
        private boolean currentlyTracked;

        public Long getExternalId() {
            return externalId;
        }

        public void setExternalId(Long externalId) {
            this.externalId = externalId;
        }

        public String getSpacecraftName() {
            return spacecraftName;
        }

        public void setSpacecraftName(String spacecraftName) {
            this.spacecraftName = spacecraftName;
        }

        public Map<String, Float> getCurrentPosition() {
            return currentPosition;
        }

        public void setCurrentPosition(Map<String, Float> currentPosition) {
            this.currentPosition = currentPosition;
        }

        public float getCurrentVelocity() {
            return currentVelocity;
        }

        public void setCurrentVelocity(float currentVelocity) {
            this.currentVelocity = currentVelocity;
        }

        public float getCurrentOrbitRadius() {
            return currentOrbitRadius;
        }

        public void setCurrentOrbitRadius(float currentOrbitRadius) {
            this.currentOrbitRadius = currentOrbitRadius;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }

        public long getDataPointsLast24h() {
            return dataPointsLast24h;
        }

        public void setDataPointsLast24h(long dataPointsLast24h) {
            this.dataPointsLast24h = dataPointsLast24h;
        }

        public boolean isCurrentlyTracked() {
            return currentlyTracked;
        }

        public void setCurrentlyTracked(boolean currentlyTracked) {
            this.currentlyTracked = currentlyTracked;
        }
    }

    /**
     * DTO for overall system telemetry metrics.
     */
    public static class SystemMetrics {
        private long totalDataPointsLast24h;
        private double averageSystemVelocity;
        private int spacecraftWithTelemetryCount;

        public long getTotalDataPointsLast24h() {
            return totalDataPointsLast24h;
        }

        public void setTotalDataPointsLast24h(long totalDataPointsLast24h) {
            this.totalDataPointsLast24h = totalDataPointsLast24h;
        }

        public double getAverageSystemVelocity() {
            return averageSystemVelocity;
        }

        public void setAverageSystemVelocity(double averageSystemVelocity) {
            this.averageSystemVelocity = averageSystemVelocity;
        }

        public int getSpacecraftWithTelemetryCount() {
            return spacecraftWithTelemetryCount;
        }

        public void setSpacecraftWithTelemetryCount(int spacecraftWithTelemetryCount) {
            this.spacecraftWithTelemetryCount = spacecraftWithTelemetryCount;
        }
    }
}