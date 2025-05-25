package microservices.mission_service.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import microservices.mission_service.model.Mission;
import microservices.mission_service.model.MissionStatus;

@DataJpaTest
@ActiveProfiles("test")
class MissionRepositoryTest {

    @Autowired
    private MissionRepository missionRepository;

    @Test
    void shouldSaveAndFindMission() {
        // Given
        Mission mission = new Mission();
        mission.setEnterpriseId(UUID.randomUUID());
        mission.setName("Test Mission");
        mission.setDescription("Test Description");
        mission.setStartDate(LocalDate.now());
        mission.setEndDate(LocalDate.now().plusDays(30));
        mission.setStatus(MissionStatus.PLANNING);

        // When
        Mission saved = missionRepository.save(mission);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Test Mission");
        // Note: createdAt is set by @CreationTimestamp during persistence
    }

    @Test
    void shouldFindByEnterpriseId() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        Mission mission1 = createTestMission(enterpriseId, "Mission 1");
        Mission mission2 = createTestMission(enterpriseId, "Mission 2");
        Mission mission3 = createTestMission(UUID.randomUUID(), "Mission 3");

        missionRepository.saveAll(List.of(mission1, mission2, mission3));

        // When
        List<Mission> missions = missionRepository.findByEnterpriseId(enterpriseId);

        // Then
        assertThat(missions).hasSize(2);
        assertThat(missions).extracting(Mission::getName)
                .containsExactlyInAnyOrder("Mission 1", "Mission 2");
    }

    @Test
    void shouldCountByEnterpriseId() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        Mission mission1 = createTestMission(enterpriseId, "Mission 1");
        Mission mission2 = createTestMission(enterpriseId, "Mission 2");
        Mission mission3 = createTestMission(UUID.randomUUID(), "Mission 3");

        missionRepository.saveAll(List.of(mission1, mission2, mission3));

        // When
        long count = missionRepository.countByEnterpriseId(enterpriseId);

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    void shouldFindByIdIn() {
        // Given
        Mission mission1 = createTestMission(UUID.randomUUID(), "Mission 1");
        Mission mission2 = createTestMission(UUID.randomUUID(), "Mission 2");
        Mission mission3 = createTestMission(UUID.randomUUID(), "Mission 3");

        List<Mission> saved = missionRepository.saveAll(List.of(mission1, mission2, mission3));
        List<UUID> idsToFind = List.of(saved.get(0).getId(), saved.get(2).getId());

        // When
        List<Mission> found = missionRepository.findByIdIn(idsToFind);

        // Then
        assertThat(found).hasSize(2);
        assertThat(found).extracting(Mission::getName)
                .containsExactlyInAnyOrder("Mission 1", "Mission 3");
    }

    @Test
    void shouldDeleteMission() {
        // Given
        Mission mission = createTestMission(UUID.randomUUID(), "Mission to Delete");
        Mission saved = missionRepository.save(mission);

        // When
        missionRepository.deleteById(saved.getId());

        // Then
        Optional<Mission> found = missionRepository.findById(saved.getId());
        assertThat(found).isEmpty();
    }

    private Mission createTestMission(UUID enterpriseId, String name) {
        Mission mission = new Mission();
        mission.setEnterpriseId(enterpriseId);
        mission.setName(name);
        mission.setDescription("Test Description");
        mission.setStartDate(LocalDate.now());
        mission.setEndDate(LocalDate.now().plusDays(30));
        mission.setStatus(MissionStatus.PLANNING);
        return mission;
    }
} 