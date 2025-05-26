package microservices.mission_service.model;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class MissionTest {

    @Test
    void shouldCreateMissionWithAllFields() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        String name = "Test Mission";
        String description = "Test Description";
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);

        // When
        Mission mission = new Mission();
        mission.setEnterpriseId(enterpriseId);
        mission.setName(name);
        mission.setDescription(description);
        mission.setStartDate(startDate);
        mission.setEndDate(endDate);
        mission.setStatus(MissionStatus.PLANNING);

        // Then
        assertThat(mission.getEnterpriseId()).isEqualTo(enterpriseId);
        assertThat(mission.getName()).isEqualTo(name);
        assertThat(mission.getDescription()).isEqualTo(description);
        assertThat(mission.getStartDate()).isEqualTo(startDate);
        assertThat(mission.getEndDate()).isEqualTo(endDate);
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.PLANNING);
    }

    @Test
    void shouldHaveDefaultStatus() {
        // When
        Mission mission = new Mission();

        // Then
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.PLANNING);
    }

    @Test
    void shouldCreateMissionWithConstructor() {
        // Given
        UUID id = UUID.randomUUID();
        UUID enterpriseId = UUID.randomUUID();
        String name = "Constructor Mission";
        String description = "Constructor Description";
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);

        // When
        Mission mission = new Mission(
                id, enterpriseId, name, description, 
                startDate, endDate, MissionStatus.ACTIVE, null
        );

        // Then
        assertThat(mission.getId()).isEqualTo(id);
        assertThat(mission.getEnterpriseId()).isEqualTo(enterpriseId);
        assertThat(mission.getName()).isEqualTo(name);
        assertThat(mission.getDescription()).isEqualTo(description);
        assertThat(mission.getStartDate()).isEqualTo(startDate);
        assertThat(mission.getEndDate()).isEqualTo(endDate);
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.ACTIVE);
    }

    @Test
    void shouldAllowNullOptionalFields() {
        // When
        Mission mission = new Mission();
        mission.setEnterpriseId(UUID.randomUUID());
        mission.setName("Required Name");
        // description, startDate, endDate are optional

        // Then
        assertThat(mission.getDescription()).isNull();
        assertThat(mission.getStartDate()).isNull();
        assertThat(mission.getEndDate()).isNull();
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.PLANNING); // default
    }
} 