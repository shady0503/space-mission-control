// src/main/java/com/telemetry/dto/TelemetryDto.java
package com.telemetry.dto;

import java.sql.Timestamp;

public class TelemetryDto {
    private long externalId;
    private Timestamp timestamp;
    private Float latitude;
    private Float longitude;
    private Float altitude;
    private float velocity;
    private float acceleration;

    public TelemetryDto(long externalId, Timestamp timestamp,
                        Float latitude, Float longitude, Float altitude,
                        float velocity, float acceleration) {
        this.externalId  = externalId;
        this.timestamp   = timestamp;
        this.latitude    = latitude;
        this.longitude   = longitude;
        this.altitude    = altitude;
        this.velocity    = velocity;
        this.acceleration= acceleration;
    }

    // Getters and setters...

    public long getExternalId() {
        return externalId;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public Float getLatitude() {
        return latitude;
    }

    public Float getLongitude() {
        return longitude;
    }

    public Float getAltitude() {
        return altitude;
    }

    public float getVelocity() {
        return velocity;
    }

    public float getAcceleration() {
        return acceleration;
    }
}
