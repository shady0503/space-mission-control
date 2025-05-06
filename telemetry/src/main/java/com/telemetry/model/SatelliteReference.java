// src/main/java/com/telemetry/model/SatelliteReference.java
package com.telemetry.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "satellite_reference")
public class SatelliteReference {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "external_id", nullable = false, unique = true)
    private long externalId;


    @Column(name = "enterprise_id", columnDefinition = "uuid", nullable = false)
    private UUID enterpriseId;

    @Column(name = "spacecraftName", nullable = true)
    private String spacecraftName;


    public SatelliteReference(UUID id, long externalId, UUID enterpriseId, String spacecraftName) {
        this.id = id;
        this.externalId = externalId;
        this.enterpriseId = enterpriseId;
        this.spacecraftName = spacecraftName;
    }

    public SatelliteReference() {}                       // JPA

    public String getSpacecraftName() {
        return spacecraftName;
    }

    public void setSpacecraftName(String spacecraftName) {
        this.spacecraftName = spacecraftName;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getId()             { return id; }
    public long  getExternalId()    { return externalId; }
    public void  setExternalId(long externalId) { this.externalId = externalId; }

    public UUID getEnterpriseId()   { return enterpriseId; }
    public void setEnterpriseId(UUID enterpriseId) { this.enterpriseId = enterpriseId; }
}
