package com.backend.telemetry.model;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.io.Serializable;
import java.util.Map;

@Entity
@Table(name = "trajectory_data")
public class TrajectoryData implements Serializable {

    @EmbeddedId
    private TrajectoryDataKey key;

    private float positionX;
    private float positionY;
    private float positionZ;

    // velocity components
    private float velocityX;
    private float velocityY;
    private float velocityZ;

    // speed (magnitude)
    private float velocity;

    private float acceleration;

    private float orbitRadius;
    private String source;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> traceContext;

    public TrajectoryData() {
        // No-arg constructor for JPA
    }

    public TrajectoryData(TrajectoryDataKey key,
                          float positionX, float positionY, float positionZ,
                          float velocityX, float velocityY, float velocityZ,
                          float velocity, float acceleration,
                          float orbitRadius,
                          String source,
                          Map<String, Object> traceContext) {
        this.key = key;
        this.positionX = positionX;
        this.positionY = positionY;
        this.positionZ = positionZ;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.velocityZ = velocityZ;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.orbitRadius = orbitRadius;
        this.source = source;
        this.traceContext = traceContext;
    }

    public TrajectoryDataKey getKey() {
        return key;
    }

    public void setKey(TrajectoryDataKey key) {
        this.key = key;
    }

    public float getPositionX() {
        return positionX;
    }

    public void setPositionX(float positionX) {
        this.positionX = positionX;
    }

    public float getPositionY() {
        return positionY;
    }

    public void setPositionY(float positionY) {
        this.positionY = positionY;
    }

    public float getPositionZ() {
        return positionZ;
    }

    public void setPositionZ(float positionZ) {
        this.positionZ = positionZ;
    }

    public float getVelocityX() {
        return velocityX;
    }

    public void setVelocityX(float velocityX) {
        this.velocityX = velocityX;
    }

    public float getVelocityY() {
        return velocityY;
    }

    public void setVelocityY(float velocityY) {
        this.velocityY = velocityY;
    }

    public float getVelocityZ() {
        return velocityZ;
    }

    public void setVelocityZ(float velocityZ) {
        this.velocityZ = velocityZ;
    }

    public float getVelocity() {
        return velocity;
    }

    public void setVelocity(float velocity) {
        this.velocity = velocity;
    }

    public float getAcceleration() {
        return acceleration;
    }

    public void setAcceleration(float acceleration) {
        this.acceleration = acceleration;
    }

    public float getOrbitRadius() {
        return orbitRadius;
    }

    public void setOrbitRadius(float orbitRadius) {
        this.orbitRadius = orbitRadius;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Map<String, Object> getTraceContext() {
        return traceContext;
    }

    public void setTraceContext(Map<String, Object> traceContext) {
        this.traceContext = traceContext;
    }
}
