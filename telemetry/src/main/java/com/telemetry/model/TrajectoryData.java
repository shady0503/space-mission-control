// src/main/java/com/telemetry/model/TrajectoryData.java
package com.telemetry.model;

import com.telemetry.dto.TrajectoryDataKey;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(
        name = "trajectory_data",
        indexes = {
                @Index(name = "idx_traj_spacecraft_ts", columnList = "external_id, timestamp")
        }
)
public class TrajectoryData {

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "externalId", column = @Column(name = "external_id", nullable = false)),
            @AttributeOverride(name = "timestamp",  column = @Column(name = "timestamp",   nullable = false))
    })
    private TrajectoryDataKey id;

    // position
    @Column(name = "position_x", nullable = false) private float positionX;
    @Column(name = "position_y", nullable = false) private float positionY;
    @Column(name = "position_z", nullable = false) private float positionZ;

    // velocity vector + scalar
    @Column(name = "velocity_x", nullable = false) private float velocityX;
    @Column(name = "velocity_y", nullable = false) private float velocityY;
    @Column(name = "velocity_z", nullable = false) private float velocityZ;
    @Column(nullable = false)                   private float velocity;

    // other metrics
    @Column(nullable = false)                   private float acceleration;
    @Column(name = "orbit_radius", nullable = false)
    private float orbitRadius;

    // optional geospatial fields
    @Column(name = "sat_latitude")    private Float satLatitude;
    @Column(name = "sat_longitude")   private Float satLongitude;
    @Column(name = "sat_altitude")    private Float satAltitude;
    @Column                          private Float azimuth;
    @Column                          private Float elevation;
    @Column(name = "right_ascension") private Float rightAscension;
    @Column                          private Float declination;

    protected TrajectoryData() {
        // JPA
    }

    public TrajectoryData(TrajectoryDataKey id,
                          float positionX,
                          float positionY,
                          float positionZ,
                          float velocityX,
                          float velocityY,
                          float velocityZ,
                          float velocity,
                          float acceleration,
                          float orbitRadius,
                          Float satLatitude,
                          Float satLongitude,
                          Float satAltitude,
                          Float azimuth,
                          Float elevation,
                          Float rightAscension,
                          Float declination) {
        this.id             = id;
        this.positionX      = positionX;
        this.positionY      = positionY;
        this.positionZ      = positionZ;
        this.velocityX      = velocityX;
        this.velocityY      = velocityY;
        this.velocityZ      = velocityZ;
        this.velocity       = velocity;
        this.acceleration   = acceleration;
        this.orbitRadius    = orbitRadius;
        this.satLatitude    = satLatitude;
        this.satLongitude   = satLongitude;
        this.satAltitude    = satAltitude;
        this.azimuth        = azimuth;
        this.elevation      = elevation;
        this.rightAscension = rightAscension;
        this.declination    = declination;
    }

    public TrajectoryDataKey getId() {
        return id;
    }

    public void setId(TrajectoryDataKey id) {
        this.id = id;
    }

    // Convenience getters
    public Long      getExternalId() { return id.getExternalId(); }
    public Timestamp getTimestamp()  { return id.getTimestamp(); }

    // -- remaining getters & setters --

    public float getPositionX() { return positionX; }
    public void  setPositionX(float positionX) { this.positionX = positionX; }

    public float getPositionY() { return positionY; }
    public void  setPositionY(float positionY) { this.positionY = positionY; }

    public float getPositionZ() { return positionZ; }
    public void  setPositionZ(float positionZ) { this.positionZ = positionZ; }

    public float getVelocityX() { return velocityX; }
    public void  setVelocityX(float velocityX) { this.velocityX = velocityX; }

    public float getVelocityY() { return velocityY; }
    public void  setVelocityY(float velocityY) { this.velocityY = velocityY; }

    public float getVelocityZ() { return velocityZ; }
    public void  setVelocityZ(float velocityZ) { this.velocityZ = velocityZ; }

    public float getVelocity() { return velocity; }
    public void  setVelocity(float velocity) { this.velocity = velocity; }

    public float getAcceleration() { return acceleration; }
    public void  setAcceleration(float acceleration) { this.acceleration = acceleration; }

    public float getOrbitRadius() { return orbitRadius; }
    public void  setOrbitRadius(float orbitRadius) { this.orbitRadius = orbitRadius; }

    public Float getSatLatitude() { return satLatitude; }
    public void  setSatLatitude(Float satLatitude) { this.satLatitude = satLatitude; }

    public Float getSatLongitude() { return satLongitude; }
    public void  setSatLongitude(Float satLongitude) { this.satLongitude = satLongitude; }

    public Float getSatAltitude() { return satAltitude; }
    public void  setSatAltitude(Float satAltitude) { this.satAltitude = satAltitude; }

    public Float getAzimuth() { return azimuth; }
    public void  setAzimuth(Float azimuth) { this.azimuth = azimuth; }

    public Float getElevation() { return elevation; }
    public void  setElevation(Float elevation) { this.elevation = elevation; }

    public Float getRightAscension() { return rightAscension; }
    public void  setRightAscension(Float rightAscension) { this.rightAscension = rightAscension; }

    public Float getDeclination() { return declination; }
    public void  setDeclination(Float declination) { this.declination = declination; }
}
