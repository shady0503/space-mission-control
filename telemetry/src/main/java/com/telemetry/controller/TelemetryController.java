// src/main/java/com/telemetry/controller/TelemetryController.java
package com.telemetry.controller;

import com.telemetry.client.SpacecraftClient;
import com.telemetry.dto.TelemetrySummaryDTO;
import com.telemetry.model.SatelliteReference;
import com.telemetry.repository.SatelliteReferenceRepository;
import com.telemetry.service.SatelliteSyncService;
import com.telemetry.service.TelemetryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final SatelliteSyncService satelliteSyncService;
    private final SatelliteReferenceRepository repo;

    @Autowired
    public TelemetryController(TelemetryService telemetryService, SatelliteSyncService satelliteSyncService, SatelliteReferenceRepository repo) {
        this.telemetryService = telemetryService;
        this.satelliteSyncService = satelliteSyncService;
        this.repo = repo;
    }

    /**
     * Accept a spacecraft reference summary and register it for telemetry tracking.
     *
     * Example request body:
     * {
     *   "id":           "3e2f1a4d-5b6c-7d8e-9fab-0c1d2e3f4a5b",
     *   "externalId":   25544,
     *   "displayName":  "Zarya Satellite",
     *   "enterpriseId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
     * }
     */

    @PostMapping("/references")
    public ResponseEntity<Void> addReference(@RequestBody SpacecraftClient.SpacecraftSummary s) {

        // short-circuit if we already hold that satellite
        if (repo.existsByExternalId(s.getExternalId())) {
            return ResponseEntity.noContent().build();   // 204
        }

        SatelliteReference ref = new SatelliteReference();
        // DO NOT setId(...)
        ref.setExternalId(s.getExternalId());
        ref.setEnterpriseId(s.getEnterpriseId());
        ref.setSpacecraftName(s.getSpacecraftName());

        repo.save(ref);         // JPA issues INSERT, not UPDATE
        return ResponseEntity.status(201).build();       // 201 Created
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> triggerSync() {
        satelliteSyncService.syncSpacecraft();
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/active/count")
    public long countActive(@RequestParam UUID enterpriseId) {
        return telemetryService.countActiveTelemetry(enterpriseId);
    }
    @GetMapping("/AverageOrbit")
    public double getAverageOrbitRadius(@RequestParam UUID enterpriseId){
        return telemetryService.averageOrbit(enterpriseId);
    }

    @GetMapping("/summary")
    TelemetrySummaryDTO getTelemetrySummary(
            @RequestParam(value = "enterpriseId") UUID enterpriseId
    ) {
        return telemetryService.getTelemetrySummary(enterpriseId);
    }

    @GetMapping("/refs")
    List<SatelliteReference> getReferences(@RequestParam UUID enterpriseId) {
        return telemetryService.getRefs(enterpriseId);
    }

}

