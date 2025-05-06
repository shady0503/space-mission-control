// src/main/java/microservices/auth_service/model/MissionOperator.java
package microservices.auth_service.model;

import jakarta.persistence.*;
import microservices.auth_service.dto.MissionRole;
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
        @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
        @Column(columnDefinition = "uuid", updatable = false, nullable = false)
        private UUID id;

        @Column(name = "mission_id", nullable = false)
        private UUID missionId;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "operator_id", nullable = false)
        private Operator operator;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 20)
        private MissionRole role;

        @CreationTimestamp
        @Column(name = "assigned_at", nullable = false, updatable = false)
        private LocalDateTime assignedAt;

        public MissionOperator() { }

        // Convenience constructor
        public MissionOperator(Operator operator, UUID missionId, MissionRole role) {
                this.operator  = operator;
                this.missionId = missionId;
                this.role      = role;
        }

        public UUID getId() { return id; }
        public UUID getMissionId() { return missionId; }
        public void setMissionId(UUID missionId) { this.missionId = missionId; }

        public Operator getOperator() { return operator; }
        public void setOperator(Operator operator) { this.operator = operator; }

        public MissionRole getRole() { return role; }
        public void setRole(MissionRole role) { this.role = role; }

        public LocalDateTime getAssignedAt() { return assignedAt; }
}
