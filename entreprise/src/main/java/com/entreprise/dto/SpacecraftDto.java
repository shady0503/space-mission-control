// src/main/java/com/entreprise/dto/SpacecraftDto.java
package com.entreprise.dto;

import java.util.UUID;

public class SpacecraftDto {
    private UUID id;
    private Long externalId;
    private String externalName;
    private UUID missionId;
    private UUID enterpriseId;
    private SpacecraftType type;
    private String displayName;

    public SpacecraftDto() {}

    public SpacecraftDto(UUID id, Long externalId, String externalName,
                         UUID missionId, UUID enterpriseId,
                         SpacecraftType type, String displayName) {
        this.id = id;
        this.externalId = externalId;
        this.externalName = externalName;
        this.missionId = missionId;
        this.enterpriseId = enterpriseId;
        this.type = type;
        this.displayName = displayName;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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
}
