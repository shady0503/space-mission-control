package com.backend.spacecraft.model;

import com.backend.commands.model.Command;
import com.backend.commands.model.Mission;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table()
public class Spacecraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // External satellite ID from N2YO or similar source
    private Long spacecraftId;

    private String spacecraftName;

    @OneToMany(mappedBy = "spacecraft")
    private List<Command> commands;

    @ManyToOne
    @JoinColumn(name = "mission_id")
    private Mission mission;

    @Enumerated(EnumType.STRING)
    private SpacecraftType spacecraftType;

    private String name;

    // Use Double for precision
    private Double orbitRadius;

    private Double positionX;
    private Double positionY;
    private Double positionZ;

    private Double velocityX;
    private Double velocityY;
    private Double velocityZ;

    private Double acceleration;

    public Spacecraft(Long spacecraftId, Mission mission, String spacecraftName, List<Command> commands,
                      SpacecraftType spacecraftType, String name, Double orbitRadius,
                      Double positionX, Double positionY, Double positionZ,
                      Double velocityX, Double velocityY, Double velocityZ, Double acceleration) {
        this.spacecraftId = spacecraftId;
        this.mission = mission;
        this.spacecraftName = spacecraftName;
        this.commands = commands;
        this.spacecraftType = spacecraftType;
        this.name = name;
        this.orbitRadius = orbitRadius;
        this.positionX = positionX;
        this.positionY = positionY;
        this.positionZ = positionZ;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.velocityZ = velocityZ;
        this.acceleration = acceleration;
    }

    public Spacecraft() {
    }

    public Long getId() {
        return id;
    }

    public Long getSpacecraftId() {
        return spacecraftId;
    }

    public void setSpacecraftId(Long spacecraftId) {
        this.spacecraftId = spacecraftId;
    }

    public String getSpacecraftName() {
        return spacecraftName;
    }

    public void setSpacecraftName(String spacecraftName) {
        this.spacecraftName = spacecraftName;
    }

    public List<Command> getCommands() {
        return commands;
    }

    public void setCommands(List<Command> commands) {
        this.commands = commands;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }

    public SpacecraftType getSpacecraftType() {
        return spacecraftType;
    }

    public void setSpacecraftType(SpacecraftType spacecraftType) {
        this.spacecraftType = spacecraftType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getOrbitRadius() {
        return orbitRadius;
    }

    public void setOrbitRadius(Double orbitRadius) {
        this.orbitRadius = orbitRadius;
    }

    public Double getPositionX() {
        return positionX;
    }

    public void setPositionX(Double positionX) {
        this.positionX = positionX;
    }

    public Double getPositionY() {
        return positionY;
    }

    public void setPositionY(Double positionY) {
        this.positionY = positionY;
    }

    public Double getPositionZ() {
        return positionZ;
    }

    public void setPositionZ(Double positionZ) {
        this.positionZ = positionZ;
    }

    public Double getVelocityX() {
        return velocityX;
    }

    public void setVelocityX(Double velocityX) {
        this.velocityX = velocityX;
    }

    public Double getVelocityY() {
        return velocityY;
    }

    public void setVelocityY(Double velocityY) {
        this.velocityY = velocityY;
    }

    public Double getVelocityZ() {
        return velocityZ;
    }

    public void setVelocityZ(Double velocityZ) {
        this.velocityZ = velocityZ;
    }

    public Double getAcceleration() {
        return acceleration;
    }

    public void setAcceleration(Double acceleration) {
        this.acceleration = acceleration;
    }
}
