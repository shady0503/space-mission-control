package com.telemetry.dto;

import java.sql.Timestamp;

public class PredictiveOrbitPoint {
    private double latitude;
    private double longitude;
    private double altitude;
    private Timestamp timestamp;
    private boolean isFullOrbit;

    public PredictiveOrbitPoint() {
    }

    public PredictiveOrbitPoint(double latitude, double longitude, double altitude, Timestamp timestamp) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.timestamp = timestamp;
        this.isFullOrbit = false;
    }

    public PredictiveOrbitPoint(double latitude, double longitude, double altitude, Timestamp timestamp, boolean isFullOrbit) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.timestamp = timestamp;
        this.isFullOrbit = isFullOrbit;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getAltitude() {
        return altitude;
    }

    public void setAltitude(double altitude) {
        this.altitude = altitude;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isFullOrbit() {
        return isFullOrbit;
    }

    public void setFullOrbit(boolean fullOrbit) {
        isFullOrbit = fullOrbit;
    }
}