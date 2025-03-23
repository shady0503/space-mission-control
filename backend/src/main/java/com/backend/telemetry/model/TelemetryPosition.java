package com.backend.telemetry.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.sql.Timestamp;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetryPosition {

    private float satlatitude;
    private float satlongitude;
    private float sataltitude;
    private float azimuth;
    private float elevation;
    private float ra;
    private float dec;
    private Timestamp timestamp;

    // No-arg constructor
    public TelemetryPosition() {
    }

    public TelemetryPosition(float satlatitude, float satlongitude, float sataltitude, float azimuth,
                             float elevation, float ra, float dec, Timestamp timestamp) {
        this.satlatitude = satlatitude;
        this.satlongitude = satlongitude;
        this.sataltitude = sataltitude;
        this.azimuth = azimuth;
        this.elevation = elevation;
        this.ra = ra;
        this.dec = dec;
        this.timestamp = timestamp;
    }

    public float getSatlatitude() {
        return satlatitude;
    }

    public void setSatlatitude(float satlatitude) {
        this.satlatitude = satlatitude;
    }

    public float getSatlongitude() {
        return satlongitude;
    }

    public void setSatlongitude(float satlongitude) {
        this.satlongitude = satlongitude;
    }

    public float getSataltitude() {
        return sataltitude;
    }

    public void setSataltitude(float sataltitude) {
        this.sataltitude = sataltitude;
    }

    public float getAzimuth() {
        return azimuth;
    }

    public void setAzimuth(float azimuth) {
        this.azimuth = azimuth;
    }

    public float getElevation() {
        return elevation;
    }

    public void setElevation(float elevation) {
        this.elevation = elevation;
    }

    public float getRa() {
        return ra;
    }

    public void setRa(float ra) {
        this.ra = ra;
    }

    public float getDec() {
        return dec;
    }

    public void setDec(float dec) {
        this.dec = dec;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }
}
