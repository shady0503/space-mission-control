package com.entreprise.controller;


import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.entreprise.dto.CreateEnterpriseRequest;
import com.entreprise.dto.UpdateEnterpriseRequest;
import com.entreprise.model.Enterprise;
import com.entreprise.service.EnterpriseService;

@RestController
@RequestMapping("/api/enterprise")
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    public EnterpriseController(
            EnterpriseService enterpriseService) {
        this.enterpriseService = enterpriseService;
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
}
