package com.backend.telemetry.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetryResponse {

    private ArrayList<TelemetryPosition> positions;
    private TelemetryInfo telemetryInfo;

    // No-arg constructor
    public TelemetryResponse() {
    }

    public TelemetryResponse(ArrayList<TelemetryPosition> positions, TelemetryInfo telemetryInfo) {
        this.positions = positions;
        this.telemetryInfo = telemetryInfo;
    }

    public ArrayList<TelemetryPosition> getPositions() {
        return positions;
    }

    public void setPositions(ArrayList<TelemetryPosition> positions) {
        this.positions = positions;
    }

    public TelemetryInfo getTelemetryInfo() {
        return telemetryInfo;
    }

    public void setTelemetryInfo(TelemetryInfo telemetryInfo) {
        this.telemetryInfo = telemetryInfo;
    }
}
