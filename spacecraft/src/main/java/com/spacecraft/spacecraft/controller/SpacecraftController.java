package com.spacecraft.spacecraft.controller;

import com.spacecraft.client.TelemetryClient;
import com.spacecraft.dto.SpacecraftSummary;
import com.spacecraft.spacecraft.model.Spacecraft;
import com.spacecraft.spacecraft.model.SpacecraftType;
import com.spacecraft.spacecraft.service.SpacecraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/spacecraft")
public class SpacecraftController {

    @Autowired
    private final SpacecraftService svc;
    private final RestTemplate rest = new RestTemplate();
    private final TelemetryClient Tl;
    @Value("${n2yo.api.key}")
    private String apiKey;

    public SpacecraftController(SpacecraftService svc, TelemetryClient tl) {
        this.svc = svc;
        Tl = tl;
    }

    /**
     * List all spacecraft, or optionally filter by enterpriseId or missionId.
     */
    @GetMapping
    public List<Spacecraft> list(
            @RequestParam Optional<UUID> enterpriseId,
            @RequestParam Optional<UUID> missionId
    ) {
        if (enterpriseId.isPresent()) {
            return svc.getByEnterpriseId(enterpriseId.get());
        }
        if (missionId.isPresent()) {
            return svc.getByMissionId(missionId.get());
        }
        return svc.getAll();
    }

    /**
     * Fetch one by its UUID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Spacecraft> getOne(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(svc.getById(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new spacecraft.
     */
    @PostMapping
    public ResponseEntity<Spacecraft> create(@RequestBody Spacecraft sc) {
        Spacecraft created = svc.save(sc);
        // Location header pointing to GET /api/spacecraft/{id}
        SpacecraftSummary summary = new SpacecraftSummary(
                created.getId(),
                created.getExternalId(),
                created.getEnterpriseId(),
                created.getExternalName()
        );

        Tl.addReference(summary);



        return ResponseEntity
                .created(URI.create("/api/spacecraft/" + created.getId()))
                .body(created);
    }

    /**
     * Update an existing spacecraft (partial or full).
     */
    @PutMapping("/{id}")
    public ResponseEntity<Spacecraft> update(
            @PathVariable UUID id,
            @RequestBody Spacecraft patch
    ) {
        try {
            Spacecraft existing = svc.getById(id);

            // Only overwrite non-null patch fields:
            if (patch.getExternalId() != null) {
                existing.setExternalId(patch.getExternalId());
            }
            if (patch.getExternalName() != null) {
                existing.setExternalName(patch.getExternalName());
            }
            if (patch.getDisplayName() != null) {
                existing.setDisplayName(patch.getDisplayName());
            }
            if (patch.getType() != null) {
                existing.setType(patch.getType());
            }

            // enterpriseId and missionId may be null in the patch to clear them:
            existing.setEnterpriseId(patch.getEnterpriseId());
            existing.setMissionId(patch.getMissionId());

            Spacecraft saved = svc.save(existing);
            return ResponseEntity.ok(saved);

        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     *
     * @param enterpriseId
     * @return
     */


    @GetMapping("/enterprise/{enterpriseId}")
    public ResponseEntity<List<Spacecraft>> getByEnterpriseId(@PathVariable UUID enterpriseId) {
        return ResponseEntity.ok(svc.getByEnterpriseId(enterpriseId));
    }

    /**
     * Delete by UUID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        try {
            svc.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/summary")
    public List<SpacecraftSummary> getAllSummaries() {
        return svc.getAll().stream()
                .map(sc -> new SpacecraftSummary(sc.getId(), sc.getExternalId(), sc.getEnterpriseId(), sc.getExternalName()))
                .toList();
    }

    @GetMapping("/external/{externalId}")
    public Spacecraft getByExternalId(@PathVariable Long externalId) {
        return svc.getByExternalId(externalId);
    }



    /* returns if the sat exists or not */
    @GetMapping("/{externalId}/exists")
    public ResponseEntity<Boolean> exists(@PathVariable Long externalId) {
        String url = String.format(
                "https://api.n2yo.com/rest/v1/satellite/positions/%d/0/0/0/1?apiKey=%s",
                externalId, apiKey
        );
        try {
            var response = rest.getForEntity(url, String.class);
            // if they gave us any 2xx at all, consider the satellite to exist
            boolean found = response.getStatusCode().is2xxSuccessful();
            return ResponseEntity.ok(found);
        } catch (Exception ex) {
            // network error, 4xx/5xx, etc.
            return ResponseEntity.ok(false);
        }
    }

    @PostMapping("/count/ids")
    public long countByMissionIds(@RequestBody List<UUID> missionIds) {
        return svc.countByMissionIds(missionIds);
    }
    @PostMapping("/count/type")
    public Map<SpacecraftType, Long> countSpacecraftByType(@RequestBody List<UUID> missionIds) {
        return svc.countByType(missionIds);
    }

    @PostMapping("/counts")
    public List<UUID> getSpacecraftCounts(@RequestBody List<UUID> missionIds) {
        return svc.getSpacecraftCounts(missionIds);
    }


    @GetMapping("/mission/{missionId}")
    public ResponseEntity<List<Spacecraft>> getByMissionId(@PathVariable UUID missionId) {
        return ResponseEntity.ok(svc.getByMissionId(missionId));
    }

    @GetMapping("/count/{enterpriseId}")
    public long count(@PathVariable UUID enterpriseId) {
        return svc.countByEnterpriseId(enterpriseId);
    }

    @GetMapping("/count/type")
    public Map<String, Long> countSpacecraftByType(@RequestParam UUID enterpriseId) {
        return svc.countByTypeAndEnterpriseId(enterpriseId);
    }

}
