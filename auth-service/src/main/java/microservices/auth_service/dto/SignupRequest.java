package microservices.auth_service.dto;

import java.util.UUID;

public record SignupRequest(
        String username,
        String email,
        String password,
        MissionRole role,
        UUID enterpriseId
) {
    public CharSequence getPassword() {
        return password;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public MissionRole getRole() {
        return role;
    }

    public UUID getEnterpriseId() {
        return enterpriseId;
    }
}