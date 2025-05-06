package microservices.auth_service.dto;

public record LoginRequest(
        String identifier,
        String password
) {}