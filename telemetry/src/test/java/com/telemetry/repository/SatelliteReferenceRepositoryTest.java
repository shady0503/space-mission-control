package com.telemetry.repository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.telemetry.model.SatelliteReference;

@DataJpaTest
@ActiveProfiles("test")
class SatelliteReferenceRepositoryTest {

    @Autowired
    private SatelliteReferenceRepository repository;

    @Test
    void shouldSaveAndFindSatelliteReference() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        SatelliteReference satellite = new SatelliteReference(
                null,
                12345L,
                enterpriseId,
                "Test Satellite");

        // When
        SatelliteReference saved = repository.save(satellite);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getExternalId()).isEqualTo(12345L);
        assertThat(saved.getEnterpriseId()).isEqualTo(enterpriseId);
        assertThat(saved.getSpacecraftName()).isEqualTo("Test Satellite");
    }

    @Test
    void shouldFindByExternalId() {
        // Given
        long externalId = 67890L;
        UUID enterpriseId = UUID.randomUUID();
        SatelliteReference satellite = new SatelliteReference(
                null,
                externalId,
                enterpriseId,
                "Another Satellite");
        repository.save(satellite);

        // When
        Optional<SatelliteReference> found = repository.findByExternalId(externalId);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getExternalId()).isEqualTo(externalId);
        assertThat(found.get().getSpacecraftName()).isEqualTo("Another Satellite");
    }

    @Test
    void shouldReturnEmptyWhenExternalIdNotFound() {
        // When
        Optional<SatelliteReference> found = repository.findByExternalId(99999L);

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void shouldCheckExistsByExternalId() {
        // Given
        long externalId = 55555L;
        SatelliteReference satellite = new SatelliteReference(
                null,
                externalId,
                UUID.randomUUID(),
                "Existing Satellite");
        repository.save(satellite);

        // When & Then
        assertThat(repository.existsByExternalId(externalId)).isTrue();
        assertThat(repository.existsByExternalId(99999L)).isFalse();
    }

    @Test
    void shouldFindByEnterpriseId() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        SatelliteReference satellite1 = new SatelliteReference(null, 1001L, enterpriseId, "Sat 1");
        SatelliteReference satellite2 = new SatelliteReference(null, 1002L, enterpriseId, "Sat 2");
        SatelliteReference satellite3 = new SatelliteReference(null, 1003L, UUID.randomUUID(), "Sat 3");

        repository.save(satellite1);
        repository.save(satellite2);
        repository.save(satellite3);

        // When
        var satellites = repository.findByEnterpriseId(enterpriseId);

        // Then
        assertThat(satellites).hasSize(2);
        assertThat(satellites).extracting(SatelliteReference::getSpacecraftName)
                .containsExactlyInAnyOrder("Sat 1", "Sat 2");
    }

    @Test
    void shouldCountByEnterpriseId() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        repository.save(new SatelliteReference(null, 2001L, enterpriseId, "Count Sat 1"));
        repository.save(new SatelliteReference(null, 2002L, enterpriseId, "Count Sat 2"));
        repository.save(new SatelliteReference(null, 2003L, UUID.randomUUID(), "Other Sat"));

        // When
        long count = repository.countByEnterpriseId(enterpriseId);

        // Then
        assertThat(count).isEqualTo(2);
    }
}