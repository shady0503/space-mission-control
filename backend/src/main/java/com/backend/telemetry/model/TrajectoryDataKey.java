package com.backend.telemetry.model;

import jakarta.persistence.Embeddable;
import java.sql.Timestamp;
import java.util.Objects;

@Embeddable
public class TrajectoryDataKey {
    private Timestamp timestamp;
    private Long spacecraftId;

    public TrajectoryDataKey() {
    }

    public TrajectoryDataKey(Timestamp timestamp, Long spacecraftId) {
        this.timestamp = timestamp;
        this.spacecraftId = spacecraftId;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    public Long getSpacecraftId() {
        return spacecraftId;
    }

    public void setSpacecraftId(Long spacecraftId) {
        this.spacecraftId = spacecraftId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrajectoryDataKey)) return false;
        TrajectoryDataKey that = (TrajectoryDataKey) o;
        return Objects.equals(timestamp, that.timestamp) &&
                Objects.equals(spacecraftId, that.spacecraftId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(timestamp, spacecraftId);
    }
}
