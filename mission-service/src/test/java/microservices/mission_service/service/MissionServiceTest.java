package microservices.mission_service.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import microservices.mission_service.dto.MissionCreateRequest;
import microservices.mission_service.dto.MissionDto;
import microservices.mission_service.model.Mission;
import microservices.mission_service.model.MissionOperator;
import microservices.mission_service.model.MissionStatus;
import microservices.mission_service.repository.ActivityLogRepository;
import microservices.mission_service.repository.MissionOperatorRepository;
import microservices.mission_service.repository.MissionRepository;

@ExtendWith(MockitoExtension.class)
class MissionServiceTest {

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private MissionOperatorRepository missionOperatorRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private MissionService missionService;

    @BeforeEach
    void setUp() {
        missionService = new MissionService(
                missionRepository,
                missionOperatorRepository,
                activityLogRepository,
                kafkaTemplate);
    }

    @Test
    void shouldCreateMission() {
        // Given
        UUID operatorId = UUID.randomUUID();
        UUID enterpriseId = UUID.randomUUID();
        MissionCreateRequest request = new MissionCreateRequest(
                "Test Mission",
                "Test Description",
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                enterpriseId);

        Mission savedMission = createTestMission(enterpriseId, "Test Mission");
        savedMission.setId(UUID.randomUUID());

        when(missionRepository.save(any(Mission.class))).thenAnswer(invocation -> {
            Mission mission = invocation.getArgument(0);
            mission.setId(savedMission.getId());
            return savedMission;
        });
        when(missionRepository.findById(any(UUID.class))).thenReturn(Optional.of(savedMission));
        when(missionOperatorRepository.save(any(MissionOperator.class))).thenReturn(new MissionOperator());

        // When
        MissionDto result = missionService.create(request, operatorId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Test Mission");
        assertThat(result.enterpriseId()).isEqualTo(enterpriseId);
        assertThat(result.status()).isEqualTo(MissionStatus.PLANNING);

        verify(missionRepository).save(any(Mission.class));
        verify(missionOperatorRepository).save(any(MissionOperator.class));
        verify(kafkaTemplate).send(eq("mission.events"), any(), any());
    }

    @Test
    void shouldFindMissionsByEnterprise() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        List<Mission> missions = List.of(
                createTestMission(enterpriseId, "Mission 1"),
                createTestMission(enterpriseId, "Mission 2"));

        when(missionRepository.findByEnterpriseId(enterpriseId)).thenReturn(missions);

        // When
        List<MissionDto> result = missionService.findByEnterprise(enterpriseId);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(MissionDto::name)
                .containsExactlyInAnyOrder("Mission 1", "Mission 2");

        verify(missionRepository).findByEnterpriseId(enterpriseId);
    }

    @Test
    void shouldFindMissionsForOperator() {
        // Given
        UUID operatorId = UUID.randomUUID();
        UUID missionId1 = UUID.randomUUID();
        UUID missionId2 = UUID.randomUUID();

        Mission mission1 = createTestMission(UUID.randomUUID(), "Mission 1");
        mission1.setId(missionId1);
        Mission mission2 = createTestMission(UUID.randomUUID(), "Mission 2");
        mission2.setId(missionId2);

        MissionOperator mo1 = new MissionOperator();
        mo1.setMission(mission1);
        MissionOperator mo2 = new MissionOperator();
        mo2.setMission(mission2);

        when(missionOperatorRepository.findByOperatorId(operatorId))
                .thenReturn(List.of(mo1, mo2));
        when(missionRepository.findByIdIn(List.of(missionId1, missionId2)))
                .thenReturn(List.of(mission1, mission2));

        // When
        List<MissionDto> result = missionService.forOperator(operatorId);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(MissionDto::name)
                .containsExactlyInAnyOrder("Mission 1", "Mission 2");

        verify(missionOperatorRepository).findByOperatorId(operatorId);
        verify(missionRepository).findByIdIn(List.of(missionId1, missionId2));
    }

    @Test
    void shouldFindMissionById() throws Exception {
        // Given
        UUID missionId = UUID.randomUUID();
        Mission mission = createTestMission(UUID.randomUUID(), "Test Mission");
        mission.setId(missionId);

        when(missionRepository.findById(missionId)).thenReturn(Optional.of(mission));

        // When
        MissionDto result = missionService.findById(missionId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(missionId);
        assertThat(result.name()).isEqualTo("Test Mission");

        verify(missionRepository).findById(missionId);
    }

    @Test
    void shouldCountAllMissions() {
        // Given
        List<Mission> missions = List.of(
                createTestMission(UUID.randomUUID(), "Mission 1"),
                createTestMission(UUID.randomUUID(), "Mission 2"),
                createTestMission(UUID.randomUUID(), "Mission 3"));

        when(missionRepository.findAll()).thenReturn(missions);

        // When
        List<Mission> result = missionService.findAll();

        // Then
        assertThat(result).hasSize(3);
        verify(missionRepository).findAll();
    }

    @Test
    void shouldCountByEnterpriseId() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        when(missionRepository.countByEnterpriseId(enterpriseId)).thenReturn(5L);

        // When
        long result = missionService.countByEnterpriseId(enterpriseId);

        // Then
        assertThat(result).isEqualTo(5L);
        verify(missionRepository).countByEnterpriseId(enterpriseId);
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