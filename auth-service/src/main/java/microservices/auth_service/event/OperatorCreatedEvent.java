package microservices.auth_service.event;

import org.springframework.context.ApplicationEvent;

import java.util.Objects;
import java.util.UUID;

public class OperatorCreatedEvent extends ApplicationEvent {
    private final UUID operatorId;
    private final String username;
    private final String email;

    public OperatorCreatedEvent(Object source, UUID operatorId, String username, String email) {
        super(source);
        this.operatorId = Objects.requireNonNull(operatorId);
        this.username   = Objects.requireNonNull(username);
        this.email      = Objects.requireNonNull(email);
    }

    public UUID getOperatorId() {
        return operatorId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "OperatorCreatedEvent{" +
                "operatorId=" + operatorId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}