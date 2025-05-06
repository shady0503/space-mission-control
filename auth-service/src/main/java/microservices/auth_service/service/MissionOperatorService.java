// src/main/java/microservices/auth_service/service/MissionOperatorService.java
package microservices.auth_service.service;

import microservices.auth_service.dto.MissionOperatorResponse;
import microservices.auth_service.dto.OperatorResponse;
import microservices.auth_service.dto.OperatorRoleUpdateRequest;
import microservices.auth_service.model.MissionOperator;
import microservices.auth_service.model.Operator;
import microservices.auth_service.repository.MissionOperatorRepository;
import microservices.auth_service.repository.OperatorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MissionOperatorService {

    private final MissionOperatorRepository repo;
    private final OperatorRepository       operatorRepo;

    public MissionOperatorService(
            MissionOperatorRepository repo,
            OperatorRepository operatorRepo
    ) {
        this.repo         = repo;
        this.operatorRepo = operatorRepo;
    }

    /** Create or update an assignment */
    public MissionOperatorResponse upsertRole(OperatorRoleUpdateRequest req) {
        Operator op = operatorRepo.findById(req.operatorId())
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + req.operatorId()));

        MissionOperator mo = repo
                .findByMissionIdAndOperator_Id(req.missionId(), req.operatorId())
                .map(existing -> {
                    existing.setRole(req.role());
                    return existing;
                })
                .orElseGet(() -> new MissionOperator(op, req.missionId(), req.role()));

        mo = repo.save(mo);

        return new MissionOperatorResponse(
                mo.getId(),
                mo.getMissionId(),
                mo.getOperator().getId(),
                mo.getRole(),
                mo.getAssignedAt()
        );
    }

    /** Remove an assignment */
    public void remove(UUID missionId, UUID operatorId) {
        repo
                .findByMissionIdAndOperator_Id(missionId, operatorId)
                .ifPresent(repo::delete);
    }

    @Transactional(readOnly = true)
    public List<OperatorResponse> getOperatorsByMission(UUID missionId) {
        return repo.findByMissionIdFetchOperator(missionId)  // or the fetch-join variant above
                .stream()
                .map(mo -> {
                    Operator op = mo.getOperator();  // still in session
                    return new OperatorResponse(
                            op.getId(),
                            op.getUsername(),
                            op.getEmail(),
                            op.getCreatedAt(),
                            op.getEnterpriseId());
                })
                .toList();
    }
}
