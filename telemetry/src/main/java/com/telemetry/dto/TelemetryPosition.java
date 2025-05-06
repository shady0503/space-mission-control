// src/main/java/com/telemetry/dto/TelemetryPosition.java
package com.telemetry.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.sql.Timestamp;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetryPosition {

    // raw fields for JSON binding and other services
    private float satlatitude;
    private float satlongitude;
    private float sataltitude;
    private float azimuth;
    private float elevation;
    private float rightAscension;
    private float declination;
    private Timestamp timestamp;

    public TelemetryPosition() {}

    /**
     * Convenience ctor for manual instantiation in PredictionService tests or other uses.
     */
    public TelemetryPosition(double latitude, double longitude, double altitude, Timestamp timestamp) {
        this.satlatitude  = (float) latitude;
        this.satlongitude = (float) longitude;
        this.sataltitude  = (float) altitude;
        this.timestamp    = timestamp;
    }

    public TelemetryPosition(
            float satlatitude,
            float satlongitude,
            float sataltitude,
            float azimuth,
            float elevation,
            float rightAscension,
            float declination,
            Timestamp timestamp
    ) {
        this.satlatitude   = satlatitude;
        this.satlongitude  = satlongitude;
        this.sataltitude   = sataltitude;
        this.azimuth       = azimuth;
        this.elevation     = elevation;
        this.rightAscension= rightAscension;
        this.declination   = declination;
        this.timestamp     = timestamp;
    }

    // — Raw getters & setters for JSON binding and TelemetryService —

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

    public float getRightAscension() {
        return rightAscension;
    }
    public void setRightAscension(float rightAscension) {
        this.rightAscension = rightAscension;
    }

    public float getDeclination() {
        return declination;
    }
    public void setDeclination(float declination) {
        this.declination = declination;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    // — Convenience getters/setters for PredictionService —

    /**
     * Alias for satlatitude so PredictionService.predict*Orbit() can call getLatitude()
     */
    public double getLatitude() {
        return satlatitude;
    }
    public void setLatitude(double latitude) {
        this.satlatitude = (float) latitude;
    }

    public double getLongitude() {
        return satlongitude;
    }
    public void setLongitude(double longitude) {
        this.satlongitude = (float) longitude;
    }

    public double getAltitude() {
        return sataltitude;
    }
    public void setAltitude(double altitude) {
        this.sataltitude = (float) altitude;
    }

    @Override
    public String toString() {
        return "TelemetryPosition{" +
                "latitude=" + getLatitude() +
                ", longitude=" + getLongitude() +
                ", altitude=" + getAltitude() +
                ", timestamp=" + timestamp +
                ", azimuth=" + azimuth +
                ", elevation=" + elevation +
                ", rightAscension=" + rightAscension +
                ", declination=" + declination +
                '}';
    }
}
