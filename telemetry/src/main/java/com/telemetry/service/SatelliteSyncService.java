// src/main/java/com/telemetry/service/SatelliteSyncService.java
package com.telemetry.service;

import com.telemetry.client.SpacecraftClient;
import com.telemetry.model.SatelliteReference;
import com.telemetry.repository.SatelliteReferenceRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SatelliteSyncService {

    private final SpacecraftClient spacecraftClient;
    private final SatelliteReferenceRepository repo;

    public SatelliteSyncService(SpacecraftClient spacecraftClient,
                                SatelliteReferenceRepository repo) {
        this.spacecraftClient = spacecraftClient;
        this.repo             = repo;
    }

    /** every 60 seconds */
    @Transactional
    @Scheduled(fixedRate = 60_000)
    public void syncSpacecraft() {
        var summaries = spacecraftClient.findAllSummary();
        for (var s : summaries) {
            if (!repo.existsByExternalId(s.getExternalId())) {
                var r = new SatelliteReference();
                r.setExternalId(s.getExternalId());
                r.setEnterpriseId(s.getEnterpriseId());
                r.setSpacecraftName(s.getSpacecraftName());
                repo.save(r);
            }
        }

    }

}
