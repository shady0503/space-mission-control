package microservices.auth_service.model;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "operator")
public class Operator {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "hashed_password", nullable = false, length = 255)
    private String hashedPassword;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "enterprise_id", nullable = true)
    private UUID enterpriseId;

    /**
     * All the mission‐assignments for this operator.
     * Uses a join via the mission_operator table.
     */
    @OneToMany(
            mappedBy = "operator",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private Set<MissionOperator> missionAssignments;

    public Operator() { }

    // getters & setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // no setter for createdAt

    public UUID getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public Set<MissionOperator> getMissionAssignments() {
        return missionAssignments;
    }

    public void setMissionAssignments(Set<MissionOperator> missionAssignments) {
        this.missionAssignments = missionAssignments;
    }
}
