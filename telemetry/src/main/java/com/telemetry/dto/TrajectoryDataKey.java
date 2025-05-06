// src/main/java/com/telemetry/dto/TrajectoryDataKey.java
package com.telemetry.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Objects;

@Embeddable
public class TrajectoryDataKey implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "external_id", nullable = false)
    private Long externalId;

    @Column(name = "timestamp", nullable = false)
    private Timestamp timestamp;

    public TrajectoryDataKey() {}

    public TrajectoryDataKey(Long externalId, Timestamp timestamp) {
        this.externalId = externalId;
        this.timestamp  = timestamp;
    }

    public Long getExternalId() {
        return externalId;
    }

    public void setExternalId(Long externalId) {
        this.externalId = externalId;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrajectoryDataKey)) return false;
        TrajectoryDataKey that = (TrajectoryDataKey) o;
        return Objects.equals(externalId, that.externalId) &&
                Objects.equals(timestamp,  that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(externalId, timestamp);
    }
}
