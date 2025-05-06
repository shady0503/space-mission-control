// src/main/java/microservices/auth_service/dto/MissionRole.java
package microservices.auth_service.dto;

/**
 * Mirror of mission‐service’s MissionRole for client‐side use.
 */
public enum MissionRole {
    VIEWER,
    ADMIN;

    public static MissionRole fromString(MissionRole role) {
        return switch (role) {
            case VIEWER -> VIEWER;
            case ADMIN -> ADMIN;
        };
    }
}
