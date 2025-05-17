// src/main/java/com/telemetry/dto/TelemetryResponse.java
package com.telemetry.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetryResponse {

    private List<TelemetryPosition> positions;
    private TelemetryInfo           telemetryInfo;

    public TelemetryResponse() {
    }

    public TelemetryResponse(List<TelemetryPosition> positions,
                             TelemetryInfo telemetryInfo) {
        this.positions     = positions;
        this.telemetryInfo = telemetryInfo;
    }

    public List<TelemetryPosition> getPositions() {
        return positions;
    }

    public void setPositions(List<TelemetryPosition> positions) {
        this.positions = positions;
    }

    public TelemetryInfo getTelemetryInfo() {
        return telemetryInfo;
    }

    public void setTelemetryInfo(TelemetryInfo telemetryInfo) {
        this.telemetryInfo = telemetryInfo;
    }
}
