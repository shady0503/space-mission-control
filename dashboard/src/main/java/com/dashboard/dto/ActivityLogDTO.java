package com.dashboard.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public class ActivityLogDTO {
    private UUID id;
    private String eventType;
    private String operatorName;
    private String missionName;
    private Instant timestamp;
    private Map<String, Object> data;

    public ActivityLogDTO() {}

    public ActivityLogDTO(UUID id, String eventType, String operatorName,
                          String missionName, Instant timestamp,
                          Map<String, Object> data) {
        this.id = id;
        this.eventType = eventType;
        this.operatorName = operatorName;
        this.missionName = missionName;
        this.timestamp = timestamp;
        this.data = data;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getMissionName() {
        return missionName;
    }

    public void setMissionName(String missionName) {
        this.missionName = missionName;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}

