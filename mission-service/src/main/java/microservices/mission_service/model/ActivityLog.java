package microservices.mission_service.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_log")
public class ActivityLog {

    /* ---------- PK ---------- */
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid",
            updatable = false,
            nullable = false)
    private UUID id;

    /* ---------- FK ---------- */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Mission mission;

    /* ---------- Payload ---------- */
    private Long   operatorId;         // who triggered the log (nullable)
    private String eventType;

    /** Arbitrary JSON stored as plain text – no casting errors */
    @Column(columnDefinition = "text")
    private String data;

    @CreationTimestamp
    private LocalDateTime timeStamp;

    /* ---------- Constructors ---------- */
    public ActivityLog() {}

    public ActivityLog(UUID id,
                       Mission mission,
                       Long operatorId,
                       String eventType,
                       String data,
                       LocalDateTime timeStamp) {
        this.id         = id;
        this.mission    = mission;
        this.operatorId = operatorId;
        this.eventType  = eventType;
        this.data       = data;
        this.timeStamp  = timeStamp;
    }

    /* ---------- Getters / Setters ---------- */
    public UUID getId()                     { return id; }
    public void setId(UUID id)              { this.id = id; }

    public Mission getMission()             { return mission; }
    public void setMission(Mission mission) { this.mission = mission; }

    public Long getOperatorId()             { return operatorId; }
    public void setOperatorId(Long operatorId) { this.operatorId = operatorId; }

    public String getEventType()            { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getData()                 { return data; }
    public void setData(String data)        { this.data = data; }  // <- fixed bug

    public LocalDateTime getTimeStamp()     { return timeStamp; }
    public void setTimeStamp(LocalDateTime ts) { this.timeStamp = ts; }
}
