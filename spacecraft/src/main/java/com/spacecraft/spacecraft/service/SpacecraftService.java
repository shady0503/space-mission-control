package com.spacecraft.spacecraft.service;

import com.spacecraft.spacecraft.model.Spacecraft;
import com.spacecraft.spacecraft.model.SpacecraftType;
import com.spacecraft.spacecraft.repository.SpacecraftRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SpacecraftService {

    private final SpacecraftRepository repo;

    @Autowired
    public SpacecraftService(SpacecraftRepository repo) {
        this.repo = repo;
    }

    /** Get every spacecraft in the system */
    public List<Spacecraft> getAll() {
        return repo.findAll();
    }

    /** Look up by our internal UUID primary key */
    public Spacecraft getById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No spacecraft with id " + id));
    }

    /** Look up by the external satellite ID */
    public Spacecraft getByExternalId(Long externalId) {
        return Optional.ofNullable(repo.findByExternalId(externalId))
                .orElseThrow(() -> new EntityNotFoundException(
                        "No spacecraft with externalId " + externalId));
    }

    /** All spacecraft assigned to a particular mission (nullable) */
    public List<Spacecraft> getByMissionId(UUID missionId) {
        return repo.findByMissionId(missionId);
    }

    /** All spacecraft belonging to an enterprise (missionId may be null) */
    public List<Spacecraft> getByEnterpriseId(UUID enterpriseId) {
        return repo.findByEnterpriseId(enterpriseId);
    }

    /** All of a given type */
    public List<Spacecraft> getByType(SpacecraftType type) {
        return repo.findByType(type);
    }

    /** Create or update a spacecraft record */
    public Spacecraft save(Spacecraft sc) {
        return repo.save(sc);
    }

    /** Delete a spacecraft by external satellite ID */
    public void deleteByExternalId(Long externalId) {
        Spacecraft sc = getByExternalId(externalId);
        repo.delete(sc);
    }

    /** Delete by our internal UUID */
    public void deleteById(UUID id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("No spacecraft with id " + id);
        }
        repo.deleteById(id);
    }

    public long countByMissionIds(List<UUID> missionIds) {
        return repo.countByMissionIdIn(missionIds);

    }

    public Map<SpacecraftType, Long> countByType(List<UUID> missionIds) {
        List<Spacecraft> sc = repo.findByMissionIdIn(missionIds);
        return sc.stream()
                .collect(Collectors.groupingBy(
                        Spacecraft::getType,
                        Collectors.counting()
                ));
    }

    public List<UUID> getSpacecraftCounts(List<UUID> missionIds) {
        return repo.findByMissionIdIn(missionIds)
                .stream()
                .map(Spacecraft::getId)
                .toList();
    }

    public long countByEnterpriseId(UUID enterpriseId) {
        return repo.countByEnterpriseId(enterpriseId);
    }

    public Map<String, Long> countByTypeAndEnterpriseId(UUID enterpriseId) {
        return repo.countByTypeAndEnterpriseId(enterpriseId);
    }
}
