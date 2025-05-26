package microservices.mission_service.integration;

import microservices.mission_service.dto.MissionCreateRequest;
import microservices.mission_service.dto.MissionDto;
import microservices.mission_service.model.MissionStatus;
import microservices.mission_service.service.MissionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MissionServiceIntegrationTest {

        @Autowired
        private MissionService missionService;

        @MockBean
        private KafkaTemplate<String, Object> kafkaTemplate;

        @Test
        void shouldCreateAndRetrieveMission() {
                // Given
                UUID operatorId = UUID.randomUUID();
                UUID enterpriseId = UUID.randomUUID();
                MissionCreateRequest request = new MissionCreateRequest(
                                "Integration Test Mission",
                                "Test Description",
                                LocalDate.now(),
                                LocalDate.now().plusDays(30),
                                enterpriseId);

                // When
                MissionDto created = missionService.create(request, operatorId);

                // Then
                assertThat(created).isNotNull();
                assertThat(created.id()).isNotNull();
                assertThat(created.name()).isEqualTo("Integration Test Mission");
                assertThat(created.enterpriseId()).isEqualTo(enterpriseId);
                assertThat(created.status()).isEqualTo(MissionStatus.PLANNING);
                // Note: createdAt is set by @CreationTimestamp during persistence
        }

        @Test
        void shouldFindMissionsByEnterprise() {
                // Given
                UUID operatorId = UUID.randomUUID();
                UUID enterpriseId = UUID.randomUUID();

                MissionCreateRequest request1 = new MissionCreateRequest(
                                "Mission 1", "Description 1", LocalDate.now(), LocalDate.now().plusDays(30),
                                enterpriseId);
                MissionCreateRequest request2 = new MissionCreateRequest(
                                "Mission 2", "Description 2", LocalDate.now(), LocalDate.now().plusDays(30),
                                enterpriseId);
                MissionCreateRequest request3 = new MissionCreateRequest(
                                "Mission 3", "Description 3", LocalDate.now(), LocalDate.now().plusDays(30),
                                UUID.randomUUID());

                // When
                missionService.create(request1, operatorId);
                missionService.create(request2, operatorId);
                missionService.create(request3, operatorId);

                List<MissionDto> missions = missionService.findByEnterprise(enterpriseId);

                // Then
                assertThat(missions).hasSize(2);
                assertThat(missions).extracting(MissionDto::name)
                                .containsExactlyInAnyOrder("Mission 1", "Mission 2");
        }

        @Test
        void shouldFindMissionsForOperator() {
                // Given
                UUID operatorId = UUID.randomUUID();
                UUID anotherOperatorId = UUID.randomUUID();
                UUID enterpriseId = UUID.randomUUID();

                MissionCreateRequest request1 = new MissionCreateRequest(
                                "Operator Mission 1", "Description 1", LocalDate.now(), LocalDate.now().plusDays(30),
                                enterpriseId);
                MissionCreateRequest request2 = new MissionCreateRequest(
                                "Operator Mission 2", "Description 2", LocalDate.now(), LocalDate.now().plusDays(30),
                                enterpriseId);
                MissionCreateRequest request3 = new MissionCreateRequest(
                                "Another Mission", "Description 3", LocalDate.now(), LocalDate.now().plusDays(30),
                                enterpriseId);

                // When
                missionService.create(request1, operatorId);
                missionService.create(request2, operatorId);
                missionService.create(request3, anotherOperatorId);

                List<MissionDto> operatorMissions = missionService.forOperator(operatorId);

                // Then
                assertThat(operatorMissions).hasSize(2);
                assertThat(operatorMissions).extracting(MissionDto::name)
                                .containsExactlyInAnyOrder("Operator Mission 1", "Operator Mission 2");
        }

        @Test
        void shouldCountMissionsByEnterprise() {
                // Given
                UUID operatorId = UUID.randomUUID();
                UUID enterpriseId = UUID.randomUUID();

                MissionCreateRequest request1 = new MissionCreateRequest(
                                "Count Mission 1", "Description 1", LocalDate.now(), LocalDate.now().plusDays(30),
                                enterpriseId);
                MissionCreateRequest request2 = new MissionCreateRequest(
                                "Count Mission 2", "Description 2", LocalDate.now(), LocalDate.now().plusDays(30),
                                enterpriseId);

                // When
                missionService.create(request1, operatorId);
                missionService.create(request2, operatorId);

                long count = missionService.countByEnterpriseId(enterpriseId);

                // Then
                assertThat(count).isEqualTo(2);
        }
}