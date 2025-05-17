package microservices.auth_service.dto;

import java.util.UUID;

/**
 * Payload for an operator to update their own profile.
 * Only non-null fields will be applied.
 */
public class UpdateOperatorRequest {

    private String email;
    private String password;
    private String username;
    private UUID enterpriseId;

    public UpdateOperatorRequest() {}

    public UpdateOperatorRequest(String email, String password, UUID enterpriseId, String username) {
        this.email = email;
        this.password = password;
        this.enterpriseId = enterpriseId;
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UUID getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(UUID enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
