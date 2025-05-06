// src/main/java/microservices/mission_service/controller/MissionController.java
package microservices.mission_service.controller;

import microservices.mission_service.client.AuthClient;
import microservices.mission_service.dto.*;
import microservices.mission_service.model.Mission;
import microservices.mission_service.model.MissionOperator;
import microservices.mission_service.model.MissionRole;
import microservices.mission_service.service.MissionService;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService svc;
    private final AuthClient     auth;   // Feign injected here

    public MissionController(MissionService svc, AuthClient auth) {
        this.svc  = svc;
        this.auth = auth;
    }

    /* ---------- CRUD ---------- */

    @PostMapping
    public MissionDto create(@RequestBody MissionCreateRequest req) {
        return svc.create(req);
    }

    @GetMapping("/enterprise/{enterpriseId}")
    public List<MissionDto> byEnterprise(@PathVariable UUID enterpriseId) {
        return svc.findByEnterprise(enterpriseId);
    }

    @GetMapping("/operator/{operatorId}")
    public List<MissionDto> mine(@PathVariable UUID operatorId) {
        return svc.forOperator(operatorId);
    }

    @GetMapping("/{missionId}")
    public MissionDto getOne(@PathVariable UUID missionId)
            throws ChangeSetPersister.NotFoundException {
        return svc.findById(missionId);
    }

    @GetMapping
    public List<Mission> getAll() { return svc.findAll(); }

    @PutMapping("/{missionId}")
    public MissionDto update(@PathVariable UUID missionId,
                             @RequestBody MissionUpdateRequest req,
                             @RequestParam UUID operatorId)
            throws Exception {
        return svc.updateIfAdmin(missionId, operatorId, req);
    }

    @DeleteMapping("/{missionId}")
    public ResponseEntity<Void> delete(@PathVariable UUID missionId,
                                       @RequestParam UUID operatorId)
            throws Exception {
        svc.deleteIfAdmin(missionId, operatorId);
        return ResponseEntity.noContent().build();
    }
    // get operators of a mission
    @GetMapping("/{missionId}/operators")
    public List<OperatorDtoWithRole> getOperators(@PathVariable("missionId") UUID missionId) {
        List<MissionOperator> operators = svc.getOperators(missionId);
        return operators.stream()
                .map(mo -> {
                    OperatorDto operatorDto = auth.getOperator(mo.getOperatorId());
                    return new OperatorDtoWithRole(operatorDto, mo.getRole());
                })
                .collect(Collectors.toList());
    }

    // static so Jackson can instantiate it
    public static class OperatorDtoWithRole {
        private OperatorDto operator;
        private MissionRole role;

        public OperatorDtoWithRole() { /* Jackson */ }

        public OperatorDtoWithRole(OperatorDto operator, MissionRole role) {
            this.operator = operator;
            this.role     = role;
        }

        public OperatorDto getOperator() {
            return operator;
        }

        public void setOperator(OperatorDto operator) {
            this.operator = operator;
        }

        public MissionRole getRole() {
            return role;
        }

        public void setRole(MissionRole role) {
            this.role = role;
        }
    }

    /* ---------- Operator upsert / unassign ---------- */

    @PutMapping("/{missionId}/operators")
    public ResponseEntity<MissionOperatorDto> upsertOperatorRole(
            @PathVariable UUID missionId,
            @RequestParam UUID operatorId,
            @RequestParam(required = false) MissionRole role,
            @RequestParam UUID adminOperatorId
    ) throws Exception {

        // 1) Verify the operator exists in auth-service
        auth.getOperator(operatorId);

        if (role == null) {
            // --- UNASSIGN locally ---
            svc.unassignIfAdmin(missionId, adminOperatorId, operatorId);

            // --- UNASSIGN in auth-service ---
            auth.removeOperatorFromMission(missionId, operatorId);

            return ResponseEntity.noContent().build();
        } else {
            // --- ASSIGN/CHANGE locally ---
            MissionOperatorDto dto =
                    svc.assignOrChangeRole(missionId, operatorId, role, adminOperatorId);

            // --- PROPAGATE role change to auth-service ---
            auth.updateOperatorRole(
                    new OperatorRoleUpdateRequest(missionId, operatorId, role)
            );

            return ResponseEntity.ok(dto);
        }
    }

    @GetMapping("/operator/{operatorId}/count/active")
    public long countActive(@PathVariable UUID operatorId) {
        return svc.countByOperatorAndStatus(operatorId, true);
    }

    @GetMapping("/operator/{operatorId}/count/inactive")
    public long countInactive(@PathVariable UUID operatorId) {
        return svc.countByOperatorAndStatus(operatorId, false);
    }

    @GetMapping("/operator/{operatorId}/ids")
    public List<UUID> missionIdsByOperator(@PathVariable UUID operatorId) {
        return svc.getMissionIdsByOperator(operatorId);
    }

    @PostMapping("/count/operators/distinct")
    public int countDistinctOperatorsByMissionIds(@RequestBody List<UUID> missionIds) {
        if (missionIds == null || missionIds.isEmpty()) return 0;
        return svc.countDistinctOperators(missionIds);
    }


    @PostMapping("/operator/counts")
    public List<UUID> getOperatorCounts(@RequestBody List<UUID> missionIds) {
        return svc.getOperatorCounts(missionIds);
    }

    @GetMapping("/statistics/monthly")
    public ResponseEntity<List<MissionMonthlyCount>> getMonthlyStats() {
        return ResponseEntity.ok(svc.getMissionsByMonth());
    }

    @GetMapping("/count/{enterpriseId}")
    public long count(@PathVariable UUID enterpriseId) {
        return svc.countByEnterpriseId(enterpriseId);
    }


}
