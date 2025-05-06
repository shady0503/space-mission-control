// src/main/java/microservices/mission_service/service/MissionService.java
package microservices.mission_service.service;

import jakarta.transaction.Transactional;
import microservices.mission_service.dto.*;
import microservices.mission_service.model.*;
import microservices.mission_service.repository.*;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.*;

@Service
@Transactional
public class MissionService {

    private final MissionRepository        missionRepo;
    private final MissionOperatorRepository mopRepo;
    private final ActivityLogRepository     logRepo;
    private final KafkaTemplate<String,Object> kafkaTemplate;

    public MissionService(MissionRepository missionRepo,
                          MissionOperatorRepository mopRepo,
                          ActivityLogRepository logRepo,
                          KafkaTemplate<String,Object> kafkaTemplate) {
        this.missionRepo   = missionRepo;
        this.mopRepo       = mopRepo;
        this.logRepo       = logRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    /* ---------- Mission creation ---------- */

    public MissionDto create(MissionCreateRequest req) {
        Mission m = new Mission();
        m.setEnterpriseId(req.enterpriseId());
        m.setName(req.name());
        m.setDescription(req.description());
        m.setStartDate(req.startDate());
        m.setEndDate(req.endDate());
        missionRepo.save(m);

        publishEvent("MissionCreated", Map.of(
                "missionId",    m.getId(),
                "enterpriseId", m.getEnterpriseId(),
                "name",         m.getName()
        ));
        return toDto(m);
    }

    /* ---------- Queries ---------- */

    public List<MissionDto> findByEnterprise(UUID enterpriseId) {
        return missionRepo.findByEnterpriseId(enterpriseId)
                .stream().map(this::toDto).toList();
    }

    public List<MissionDto> forOperator(UUID operatorId) {
        var missionIds = mopRepo.findByOperatorId(operatorId)
                .stream().map(mo -> mo.getMission().getId()).toList();
        return missionRepo.findByIdIn(missionIds)
                .stream().map(this::toDto).toList();
    }

    public MissionDto findById(UUID missionId) throws ChangeSetPersister.NotFoundException {
        Mission m = missionRepo.findById(missionId)
                .orElseThrow(ChangeSetPersister.NotFoundException::new);
        return toDto(m);
    }

    /* ---------- Mutation (admin only) ---------- */

    public MissionDto updateIfAdmin(UUID missionId,
                                    UUID adminOperatorId,
                                    MissionUpdateRequest req)
            throws ChangeSetPersister.NotFoundException, AccessDeniedException {

        verifyAdmin(missionId, adminOperatorId);
        Mission m = missionRepo.findById(missionId)
                .orElseThrow(ChangeSetPersister.NotFoundException::new);

        if (req.name()        != null) m.setName(req.name());
        if (req.description() != null) m.setDescription(req.description());
        if (req.startDate()   != null) m.setStartDate(req.startDate());
        if (req.endDate()     != null) m.setEndDate(req.endDate());
        if (req.status()      != null) m.setStatus(req.status());

        missionRepo.save(m);
        logActivity(m, "MissionUpdated", Map.of(
                "missionId", missionId,
                "operatorId", adminOperatorId
        ));
        return toDto(m);
    }

    public void deleteIfAdmin(UUID missionId, UUID adminOperatorId)
            throws ChangeSetPersister.NotFoundException, AccessDeniedException {

        verifyAdmin(missionId, adminOperatorId);
        missionRepo.deleteById(missionId);
        publishEvent("MissionDeleted", Map.of(
                "missionId", missionId,
                "operatorId", adminOperatorId
        ));
    }

    /* ---------- Operator upsert (assign & change role) ---------- */

    /**
     * If the assignment exists, updates its role; otherwise creates a new assignment.
     * Caller (adminOperatorId) must be ADMIN on the mission.
     * Operator existence is checked by the **controller**, not here.
     */
    public MissionOperatorDto assignOrChangeRole(
            UUID missionId,
            UUID operatorId,
            MissionRole newRole,
            UUID adminOperatorId
    ) throws ChangeSetPersister.NotFoundException, AccessDeniedException {

        Mission mission = missionRepo.findById(missionId)
                .orElseThrow(ChangeSetPersister.NotFoundException::new);

        long assignmentCount = mopRepo.countByMissionId(missionId);

        if (assignmentCount > 0) {
            verifyAdmin(missionId, adminOperatorId);
        } else {
            if (!adminOperatorId.equals(operatorId) || newRole != MissionRole.ADMIN) {
                throw new AccessDeniedException("Initial assignment must be self with ADMIN role");
            }
        }

        Optional<MissionOperator> existing =
                mopRepo.findByMissionIdAndOperatorId(missionId, operatorId);

        MissionOperator mo;
        String eventType;
        if (existing.isPresent()) {
            mo = existing.get();
            mo.setRole(newRole);
            eventType = "OperatorRoleChanged";
        } else {
            mo = new MissionOperator(mission, operatorId, newRole);
            eventType = "OperatorAssigned";
        }
        mopRepo.save(mo);

        logActivity(mission, eventType, Map.of(
                "missionId",   missionId,
                "operatorId",  operatorId,
                "role",        newRole
        ));
        publishEvent(eventType, Map.of(
                "missionId",   missionId,
                "operatorId",  operatorId,
                "role",        newRole
        ));
        return toOperatorDto(mo);
    }

    /* ---------- Operator unassign ---------- */

    public void unassignIfAdmin(UUID missionId,
                                UUID adminOperatorId,
                                UUID operatorId)
            throws ChangeSetPersister.NotFoundException, AccessDeniedException {

        verifyAdmin(missionId, adminOperatorId);

        MissionOperator mo = mopRepo.findByMissionIdAndOperatorId(missionId, operatorId)
                .orElseThrow(ChangeSetPersister.NotFoundException::new);

        mopRepo.delete(mo);
        logActivity(mo.getMission(), "OperatorUnassigned", Map.of(
                "missionId", missionId,
                "operatorId", operatorId
        ));
        publishEvent("OperatorUnassigned", Map.of(
                "missionId", missionId,
                "operatorId", operatorId
        ));
    }

    /* ---------- Private helpers ---------- */

    private void verifyAdmin(UUID missionId, UUID operatorId)
            throws ChangeSetPersister.NotFoundException, AccessDeniedException {

        MissionOperator mo = mopRepo.findByMissionIdAndOperatorId(missionId, operatorId)
                .orElseThrow(ChangeSetPersister.NotFoundException::new);
        if (mo.getRole() != MissionRole.ADMIN) {
            throw new AccessDeniedException("Operator is not an ADMIN of mission");
        }
    }

    private void logActivity(Mission m, String type, Map<String,Object> data) {
        ActivityLog log = new ActivityLog();
        log.setMission(m);
        log.setEventType(type);
        log.setData(data.toString());
        logRepo.save(log);
    }

    private void publishEvent(String type, Object payload) {
        kafkaTemplate.send("mission.events", type, payload);
    }

    private MissionDto toDto(Mission m) {
        return new MissionDto(
                m.getId(), m.getEnterpriseId(), m.getName(), m.getDescription(),
                m.getStartDate().atStartOfDay(), m.getEndDate().atStartOfDay(), m.getStatus(), m.getCreatedAt());
    }

    private MissionOperatorDto toOperatorDto(MissionOperator mo) {
        return new MissionOperatorDto(
                mo.getId(), mo.getMission().getId(), mo.getOperatorId(),
                mo.getRole(), mo.getAssignedAt());
    }

    /* ---------- Misc queries ---------- */

    public List<Mission> findAll() { return missionRepo.findAll(); }


    public long countByOperatorAndStatus(UUID operatorId, boolean active) {
        return mopRepo.countByOperatorIdAndActive(operatorId, active);
    }

    public List<UUID> getMissionIdsByOperator(UUID operatorId) {
        return mopRepo.findMissionIdsByOperator(operatorId);
    }

    public int countDistinctOperators(List<UUID> missionIds) {
        return (int) mopRepo.countDistinctOperatorByMissionIds(missionIds);
    }


    public List<UUID> getOperatorCounts(List<UUID> missionIds) {
        return mopRepo.findMissionsIn(missionIds);
    }


    public List<MissionMonthlyCount> getMissionsByMonth() {
        return missionRepo.getMissionsByMonth(); // or whatever your JPA query method is
    }

    public long countByEnterpriseId(UUID enterpriseId) {
        return missionRepo.countByEnterpriseId(enterpriseId);
    }

    public List<MissionOperator> getOperators(UUID missionId) {
        return mopRepo.findByMissionId(missionId);
    }
}
