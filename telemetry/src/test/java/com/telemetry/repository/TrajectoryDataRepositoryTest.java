package com.telemetry.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.telemetry.dto.TrajectoryDataKey;
import com.telemetry.model.TrajectoryData;

@DataJpaTest
@ActiveProfiles("test")
class TrajectoryDataRepositoryTest {

    @Autowired
    private TrajectoryDataRepository repository;

    @Test
    void shouldSaveAndFindTrajectoryData() {
        // Given
        TrajectoryDataKey key = new TrajectoryDataKey(1L, Timestamp.from(Instant.now()));
        TrajectoryData data = new TrajectoryData(
                key,
                100.0f, 200.0f, 300.0f, // position
                10.0f, 20.0f, 30.0f, // velocity vector
                50.0f, // velocity scalar
                5.0f, // acceleration
                7000.0f, // orbit radius
                45.0f, 90.0f, 400.0f, // lat, lon, alt
                180.0f, 45.0f, 90.0f, 45.0f // azimuth, elevation, RA, declination
        );

        // When
        TrajectoryData saved = repository.save(data);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isEqualTo(key);
        assertThat(saved.getPositionX()).isEqualTo(100.0f);
        assertThat(saved.getVelocity()).isEqualTo(50.0f);
    }

        @Test
    void shouldFindByExternalId() {
        // Given
        long externalId = 123L;
        Timestamp timestamp1 = Timestamp.valueOf("2023-01-01 10:00:00");
        Timestamp timestamp2 = Timestamp.valueOf("2023-01-01 11:00:00");
        TrajectoryDataKey key1 = new TrajectoryDataKey(externalId, timestamp1);
        TrajectoryDataKey key2 = new TrajectoryDataKey(externalId, timestamp2);
        
        TrajectoryData data1 = createTestData(key1);
        TrajectoryData data2 = createTestData(key2);
        
        repository.save(data1);
        repository.save(data2);

        // When
        List<TrajectoryData> results = repository.findByIdExternalIdOrderByIdTimestampAsc(externalId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results.get(0).getExternalId()).isEqualTo(externalId);
        assertThat(results.get(1).getExternalId()).isEqualTo(externalId);
        // First result should be the earlier timestamp
        assertThat(results.get(0).getTimestamp()).isEqualTo(timestamp1);
        assertThat(results.get(1).getTimestamp()).isEqualTo(timestamp2);
    }

        @Test
    void shouldFindLatestByExternalId() {
        // Given
        long externalId = 456L;
        Timestamp oldTimestamp = Timestamp.valueOf("2023-01-01 09:00:00");
        Timestamp newTimestamp = Timestamp.valueOf("2023-01-01 12:00:00");
        TrajectoryDataKey oldKey = new TrajectoryDataKey(externalId, oldTimestamp);
        TrajectoryDataKey newKey = new TrajectoryDataKey(externalId, newTimestamp);
        
        repository.save(createTestData(oldKey));
        repository.save(createTestData(newKey));

        // When
        Optional<TrajectoryData> latest = repository.findFirstByIdExternalIdOrderByIdTimestampDesc(externalId);

        // Then
        assertThat(latest).isPresent();
        assertThat(latest.get().getExternalId()).isEqualTo(externalId);
        assertThat(latest.get().getTimestamp()).isEqualTo(newTimestamp);
    }

    @Test
    void shouldFindDistinctExternalIds() {
        // Given
        repository.save(createTestData(new TrajectoryDataKey(100L, Timestamp.from(Instant.now()))));
        repository.save(createTestData(new TrajectoryDataKey(200L, Timestamp.from(Instant.now()))));
        repository.save(createTestData(new TrajectoryDataKey(100L, Timestamp.from(Instant.now().plusSeconds(60)))));

        // When
        List<Long> distinctIds = repository.findDistinctExternalIds();

        // Then
        assertThat(distinctIds).hasSize(2);
        assertThat(distinctIds).containsExactlyInAnyOrder(100L, 200L);
    }

    @Test
    void shouldCountByTimestampAfterAndExternalId() {
        // Given
        long externalId = 789L;
        Timestamp cutoff = Timestamp.from(Instant.now().minusSeconds(30));

        // Old data (before cutoff)
        repository.save(
                createTestData(new TrajectoryDataKey(externalId, Timestamp.from(Instant.now().minusSeconds(60)))));

        // New data (after cutoff)
        repository.save(createTestData(new TrajectoryDataKey(externalId, Timestamp.from(Instant.now()))));
        repository
                .save(createTestData(new TrajectoryDataKey(externalId, Timestamp.from(Instant.now().plusSeconds(10)))));

        // When
        long count = repository.countByIdTimestampAfterAndIdExternalId(cutoff, externalId);

        // Then
        assertThat(count).isEqualTo(2);
    }

    private TrajectoryData createTestData(TrajectoryDataKey key) {
        return new TrajectoryData(
                key,
                1.0f, 2.0f, 3.0f, // position
                0.1f, 0.2f, 0.3f, // velocity vector
                0.5f, // velocity scalar
                0.01f, // acceleration
                7000.0f, // orbit radius
                null, null, null, // optional geospatial
                null, null, null, null // optional angles
        );
    }
}