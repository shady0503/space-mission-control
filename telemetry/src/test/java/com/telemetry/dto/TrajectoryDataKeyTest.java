package com.telemetry.dto;

import java.sql.Timestamp;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class TrajectoryDataKeyTest {

    @Test
    void shouldCreateTrajectoryDataKey() {
        // Given
        Long externalId = 123L;
        Timestamp timestamp = Timestamp.from(Instant.now());

        // When
        TrajectoryDataKey key = new TrajectoryDataKey(externalId, timestamp);

        // Then
        assertThat(key.getExternalId()).isEqualTo(externalId);
        assertThat(key.getTimestamp()).isEqualTo(timestamp);
    }

    @Test
    void shouldBeEqualWhenSameValues() {
        // Given
        Long externalId = 456L;
        Timestamp timestamp = Timestamp.from(Instant.now());

        TrajectoryDataKey key1 = new TrajectoryDataKey(externalId, timestamp);
        TrajectoryDataKey key2 = new TrajectoryDataKey(externalId, timestamp);

        // When & Then
        assertThat(key1).isEqualTo(key2);
        assertThat(key1.hashCode()).isEqualTo(key2.hashCode());
    }

    @Test
    void shouldNotBeEqualWhenDifferentValues() {
        // Given
        Timestamp timestamp = Timestamp.from(Instant.now());

        TrajectoryDataKey key1 = new TrajectoryDataKey(123L, timestamp);
        TrajectoryDataKey key2 = new TrajectoryDataKey(456L, timestamp);

        // When & Then
        assertThat(key1).isNotEqualTo(key2);
    }

    @Test
    void shouldNotBeEqualWhenDifferentTimestamp() {
        // Given
        Long externalId = 789L;

        TrajectoryDataKey key1 = new TrajectoryDataKey(externalId, Timestamp.from(Instant.now()));
        TrajectoryDataKey key2 = new TrajectoryDataKey(externalId, Timestamp.from(Instant.now().plusSeconds(60)));

        // When & Then
        assertThat(key1).isNotEqualTo(key2);
    }

    @Test
    void shouldUpdateFields() {
        // Given
        TrajectoryDataKey key = new TrajectoryDataKey();
        Long newExternalId = 999L;
        Timestamp newTimestamp = Timestamp.from(Instant.now());

        // When
        key.setExternalId(newExternalId);
        key.setTimestamp(newTimestamp);

        // Then
        assertThat(key.getExternalId()).isEqualTo(newExternalId);
        assertThat(key.getTimestamp()).isEqualTo(newTimestamp);
    }
}