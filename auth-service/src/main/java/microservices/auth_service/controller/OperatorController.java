package microservices.auth_service.controller;

import microservices.auth_service.dto.MissionOperatorResponse;
import microservices.auth_service.dto.OperatorResponse;
import microservices.auth_service.dto.OperatorRoleUpdateRequest;
import microservices.auth_service.dto.UpdateOperatorRequest;
import microservices.auth_service.model.Operator;
import microservices.auth_service.service.MissionOperatorService;
import microservices.auth_service.service.OperatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operator")
public class OperatorController {

    private static final Logger logger = LoggerFactory.getLogger(OperatorController.class);

    @Autowired
    private OperatorService operatorService;

    @Autowired
    private MissionOperatorService missionOperatorService;

    /** GET /api/operator/current */
    @GetMapping("/current")
    public OperatorResponse getCurrentOperator(Authentication auth) {
        String username = auth.getName();
        Operator op = operatorService
                .findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + username));

        return new OperatorResponse(
                op.getId(),
                op.getUsername(),
                op.getEmail(),
                op.getCreatedAt(),
                op.getEnterpriseId()
        );
    }

    @GetMapping("/enterprise/{enterpriseId}")
    public List<OperatorResponse> getByEnterprise(@PathVariable UUID enterpriseId) {
        return operatorService.findByEnterpriseId(enterpriseId).stream()
                .map(op -> new OperatorResponse(
                        op.getId(),
                        op.getUsername(),
                        op.getEmail(),
                        op.getCreatedAt(),
                        op.getEnterpriseId()
                ))
                .collect(Collectors.toList());
    }

    /** GET /api/operator/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<OperatorResponse> getOperatorById(@PathVariable UUID id) {
        Operator operator = operatorService.getById(id);
        OperatorResponse resp = new OperatorResponse(
                operator.getId(),
                operator.getUsername(),
                operator.getEmail(),
                operator.getCreatedAt(),
                operator.getEnterpriseId());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/mission/{id}")
    public List<OperatorResponse> getByMission(@PathVariable("id") UUID missionId) {
        return missionOperatorService.getOperatorsByMission(missionId);
    }



    @PutMapping
    public ResponseEntity<OperatorResponse> updateProfile(
            @RequestBody UpdateOperatorRequest req,
            Authentication auth) {

        // 1) Determine the current operator’s UUID from their username
        String username = auth.getName();
        Operator current = operatorService.getByUsername(username);
        UUID operatorId = current.getId();

        // 2) Delegate to service to apply any non-null updates
        Operator updated = operatorService.updateProfile(operatorId, req);

        // 3) Map back to DTO
        OperatorResponse resp = new OperatorResponse(
                updated.getId(),
                updated.getUsername(),
                updated.getEmail(),
                updated.getCreatedAt(),
                updated.getEnterpriseId());

        return ResponseEntity.ok(resp);
    }

    @PutMapping("/update-role")
    public ResponseEntity<MissionOperatorResponse> updateRole(
            @RequestBody OperatorRoleUpdateRequest req
    ) {
        MissionOperatorResponse resp = missionOperatorService.upsertRole(req);
        return ResponseEntity.ok(resp);
    }

    /**
     * Remove an operator from a mission.
     *
     * DELETE /api/operator/remove/{missionId}/{operatorId}
     */
    @DeleteMapping("/remove/{missionId}/{operatorId}")
    public ResponseEntity<Void> remove(
            @PathVariable UUID missionId,
            @PathVariable UUID operatorId
    ) {
        missionOperatorService.remove(missionId, operatorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/enterprise/count")
    public Long count(Authentication auth) {
        String username = auth.getName();
        Operator op = operatorService
                .findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + username));

        return operatorService.countByEnterpriseId(op.getEnterpriseId());
    }

    @GetMapping("/search")
    public List<OperatorResponse> search(@RequestParam String searchQuery){
        return operatorService.search(searchQuery);
    }

    @PostMapping("/addToEnterprise")
    public OperatorResponse addToEntreprise(@RequestParam UUID operatorId, @RequestParam UUID enterpriseId){
        return operatorService.addToenterprise(operatorId, enterpriseId);
    }




}
