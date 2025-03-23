package com.backend.commands.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.util.Date;
import java.util.Map;

@Entity
@Table()
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "MISSION_ID")
    private Mission mission;

    @ManyToOne
    @JoinColumn(name = "OPERATOR_ID")
    private Operator operator;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> data;

    @Temporal(TemporalType.TIMESTAMP)
    private Date timeStamp;

    public ActivityLog(Mission mission, Operator operator, EventType eventType, Map<String, Object> data, Date timeStamp) {
        this.mission = mission;
        this.operator = operator;
        this.eventType = eventType;
        this.data = data;
        this.timeStamp = timeStamp;
    }

    public ActivityLog() {
    }

    public Long getId() {
        return id;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }

    public Operator getOperator() {
        return operator;
    }

    public void setOperator(Operator operator) {
        this.operator = operator;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public Date getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(Date timeStamp) {
        this.timeStamp = timeStamp;
    }
}
