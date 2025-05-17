// src/main/java/microservices/mission_service/model/MissionOperator.java
package microservices.mission_service.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mission_operator",
        uniqueConstraints = @UniqueConstraint(columnNames = {"mission_id","operator_id"}))
public class MissionOperator {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    /** External reference to auth-service operator (UUID) */
    @Column(name = "operator_id", nullable = false)
    private UUID operatorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MissionRole role = MissionRole.VIEWER;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    public MissionOperator() {}

    public MissionOperator(Mission mission,
                           UUID operatorId,
                           MissionRole role) {
        this.mission = mission;
        this.operatorId = operatorId;
        this.role = role;
    }

    // --- getters & setters ---

    public UUID getId() {
        return id;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }

    public UUID getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(UUID operatorId) {
        this.operatorId = operatorId;
    }

    public MissionRole getRole() {
        return role;
    }

    public void setRole(MissionRole role) {
        this.role = role;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
    // no setter for assignedAt
}
