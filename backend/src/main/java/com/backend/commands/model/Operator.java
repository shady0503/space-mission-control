package com.backend.commands.model;

import jakarta.persistence.*;

import java.util.Date;
import java.util.List;

@Entity
@Table()
public class Operator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String hashedPassword;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @OneToMany(mappedBy = "operator")
    private List<ActivityLog> activityLogList;

    @OneToMany(mappedBy = "operator")
    private List<Command> commandList;

    public Operator(String username, Role role, Date createdAt, String hashedPassword, String email) {
        this.username = username;
        this.role = role;
        this.createdAt = createdAt;
        this.hashedPassword = hashedPassword;
        this.email = email;
    }

    public Operator() {
    }

    public Long getId() {
        return id;
    }

    public List<ActivityLog> getActivityLogList() {
        return activityLogList;
    }

    public void setActivityLogList(List<ActivityLog> activityLogList) {
        this.activityLogList = activityLogList;
    }

    public List<Command> getCommandList() {
        return commandList;
    }

    public void setCommandList(List<Command> commandList) {
        this.commandList = commandList;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
