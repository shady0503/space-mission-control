package com.backend.commands.model;

import com.backend.spacecraft.model.Spacecraft;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.util.Date;
import java.util.Map;

@Entity
@Table()
public class Command {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "spacecraft_id")
    private Spacecraft spacecraft;

    @ManyToOne
    @JoinColumn(name = "operator_id")
    private Operator operator;

    @Enumerated(EnumType.STRING)
    private CommandType commandType;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> payload;

    private Boolean status;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date executedAt;

    public Command(Spacecraft spacecraft, Operator operator, CommandType commandType, Map<String, Object> payload, Boolean status, Date createdAt, Date executedAt) {
        this.spacecraft = spacecraft;
        this.operator = operator;
        this.commandType = commandType;
        this.payload = payload;
        this.status = status;
        this.createdAt = createdAt;
        this.executedAt = executedAt;
    }

    public Command() {
    }

    public Long getId() {
        return id;
    }

    public Spacecraft getSpacecraft() {
        return spacecraft;
    }

    public void setSpacecraft(Spacecraft spacecraft) {
        this.spacecraft = spacecraft;
    }

    public Operator getOperator() {
        return operator;
    }

    public void setOperator(Operator operator) {
        this.operator = operator;
    }

    public CommandType getCommandType() {
        return commandType;
    }

    public void setCommandType(CommandType commandType) {
        this.commandType = commandType;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Date executedAt) {
        this.executedAt = executedAt;
    }
}
