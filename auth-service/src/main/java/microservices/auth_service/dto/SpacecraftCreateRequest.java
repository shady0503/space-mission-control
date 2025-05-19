// com/client/spacecraft/SpacecraftCreateRequest.java
package microservices.auth_service.dto;

import java.util.UUID;

public class SpacecraftCreateRequest {
    private Long externalId;
    private String externalName;
    private String displayName;
    private UUID enterpriseId;
    private UUID missionId;
    private String type; // Use string to avoid enum coupling

    public SpacecraftCreateRequest() {}

    public SpacecraftCreateRequest(Long externalId, String externalName, String displayName,
                                   UUID enterpriseId, UUID missionId, String type) {
        this.externalId = externalId;
        this.externalName = externalName;
        this.displayName = displayName;
        this.enterpriseId = enterpriseId;
        this.missionId = missionId;
        this.type = type;
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

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public UUID getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public UUID getMissionId() {
        return missionId;
    }

    public void setMissionId(UUID missionId) {
        this.missionId = missionId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
// Getters and setters
    // ...
}
