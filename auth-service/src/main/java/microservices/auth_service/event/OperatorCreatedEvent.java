package microservices.auth_service.event;

import java.util.Objects;
import java.util.UUID;
import org.springframework.context.ApplicationEvent;

public class OperatorCreatedEvent extends ApplicationEvent {
    private final UUID id;
    private final String username;
    private final String email;

    public OperatorCreatedEvent(Object source, UUID id, String username, String email) {
        super(source);
        this.id = Objects.requireNonNull(id, "Operator ID must not be null");
        this.username = Objects.requireNonNull(username, "Username must not be null");
        this.email = (email != null) ? email : username + "@no-email.local"; // safe fallback
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
