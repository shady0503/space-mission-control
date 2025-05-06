package microservices.auth_service.dto;

public record SignupRequest(
        String username,
        String email,
        String password,
        MissionRole role
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
}