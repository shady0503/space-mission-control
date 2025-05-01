package com.entreprise.controller;


import com.entreprise.client.MissionClient;
import com.entreprise.client.OperatorClient;
import com.entreprise.client.SpacecraftClient;
import com.entreprise.dto.*;
import com.entreprise.model.Enterprise;
import com.entreprise.service.EnterpriseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enterprise")
public class EnterpriseController {

    private final EnterpriseService enterpriseService;
    private final OperatorClient operatorClient;
    private final MissionClient missionClient;
    private final SpacecraftClient spacecraftClient;

    public EnterpriseController(
            EnterpriseService enterpriseService,
            OperatorClient operatorClient,
            MissionClient missionClient,
            SpacecraftClient spacecraftClient) {
        this.enterpriseService = enterpriseService;
        this.operatorClient    = operatorClient;
        this.missionClient     = missionClient;
        this.spacecraftClient  = spacecraftClient;
    }

    // --- CRUD on Enterprise ---

    /** POST /api/enterprise */
    @PostMapping
    public ResponseEntity<Enterprise> create(@RequestBody CreateEnterpriseRequest req) {
        Enterprise created = enterpriseService.createEnterprise(req.getName());
        return ResponseEntity.ok(created);
    }

    /** GET /api/enterprises */
    @GetMapping
    public ResponseEntity<List<Enterprise>> listAll() {
        return ResponseEntity.ok(enterpriseService.getAllEnterprises());
    }

    /** GET /api/enterprises/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Enterprise> getById(@PathVariable UUID id) {
        return enterpriseService.getEnterpriseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** PUT /api/enterprises/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<Enterprise> update(
            @PathVariable UUID id,
            @RequestBody UpdateEnterpriseRequest req) {
        Enterprise updated = enterpriseService.updateEnterprise(id, req.getName());
        return ResponseEntity.ok(updated);
    }

    /** DELETE /api/enterprises/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        enterpriseService.deleteEnterprise(id);
        return ResponseEntity.noContent().build();
    }

    // --- Aggregates: delegate to other services ---

    /** GET /api/enterprises/{id}/operators */
    @GetMapping("/{id}/operators")
    public ResponseEntity<List<OperatorDto>> operators(@PathVariable UUID id) {
        List<OperatorDto> ops = operatorClient.getByEnterprise(id);
        return ResponseEntity.ok(ops);
    }

    /** GET /api/enterprises/{id}/missions */
    @GetMapping("/{id}/missions")
    public ResponseEntity<List<MissionDto>> missions(@PathVariable UUID id) {
        List<MissionDto> ms = missionClient.getByEnterprise(id);
        return ResponseEntity.ok(ms);
    }

    /** GET /api/enterprises/{id}/spacecraft */
    @GetMapping("/{id}/spacecraft")
    public ResponseEntity<List<SpacecraftDto>> spacecraft(@PathVariable UUID id) {
        List<SpacecraftDto> sc = spacecraftClient.getByEnterprise(id);
        return ResponseEntity.ok(sc);
    }
}
