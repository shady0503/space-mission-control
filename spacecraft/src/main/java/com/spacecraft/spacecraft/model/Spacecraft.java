// src/main/java/com/spacecraft/spacecraft/model/Spacecraft.java
package com.spacecraft.spacecraft.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "spacecraft")
public class Spacecraft {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "external_id", nullable = false)
    private Long externalId;

    @Column(name = "external_name", nullable = false)
    private String externalName;

    @Column(name = "mission_id", columnDefinition = "uuid")
    private UUID missionId;

    @Column(name = "enterprise_id", columnDefinition = "uuid", nullable = false)
    private UUID enterpriseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private SpacecraftType type;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @OneToMany(
            mappedBy = "spacecraft",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Command> commands = new ArrayList<>();

    public Spacecraft() {}

    // existing getters/setters...

    public UUID getId() {
        return id;
    }

    public Long getExternalId() {
        return externalId;
    }
    public void setExternalId(Long externalId) {
        this.externalId = externalId;
    }

    public String getExternalName() {
        return externalName;
    }
    public void setExternalName(String externalName) {
        this.externalName = externalName;
    }

    public UUID getMissionId() {
        return missionId;
    }
    public void setMissionId(UUID missionId) {
        this.missionId = missionId;
    }

    public UUID getEnterpriseId() {
        return enterpriseId;
    }
    public void setEnterpriseId(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public SpacecraftType getType() {
        return type;
    }
    public void setType(SpacecraftType type) {
        this.type = type;
    }

    public String getDisplayName() {
        return displayName;
    }
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<Command> getCommands() {
        return commands;
    }
    public void setCommands(List<Command> commands) {
        this.commands = commands;
    }

}
