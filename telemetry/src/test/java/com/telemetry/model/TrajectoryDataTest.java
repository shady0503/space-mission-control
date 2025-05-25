package com.telemetry.model;

import java.sql.Timestamp;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

import com.telemetry.dto.TrajectoryDataKey;

class TrajectoryDataTest {

    @Test
    void shouldCreateTrajectoryDataWithAllFields() {
        // Given
        TrajectoryDataKey key = new TrajectoryDataKey(123L, Timestamp.from(Instant.now()));

        // When
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

        // Then
        assertThat(data.getId()).isEqualTo(key);
        assertThat(data.getExternalId()).isEqualTo(123L);
        assertThat(data.getPositionX()).isEqualTo(100.0f);
        assertThat(data.getPositionY()).isEqualTo(200.0f);
        assertThat(data.getPositionZ()).isEqualTo(300.0f);
        assertThat(data.getVelocity()).isEqualTo(50.0f);
        assertThat(data.getAcceleration()).isEqualTo(5.0f);
        assertThat(data.getOrbitRadius()).isEqualTo(7000.0f);
        assertThat(data.getSatLatitude()).isEqualTo(45.0f);
        assertThat(data.getSatLongitude()).isEqualTo(90.0f);
        assertThat(data.getSatAltitude()).isEqualTo(400.0f);
    }

    @Test
    void shouldCreateTrajectoryDataWithNullOptionalFields() {
        // Given
        TrajectoryDataKey key = new TrajectoryDataKey(456L, Timestamp.from(Instant.now()));

        // When
        TrajectoryData data = new TrajectoryData(
                key,
                1.0f, 2.0f, 3.0f, // position
                0.1f, 0.2f, 0.3f, // velocity vector
                0.5f, // velocity scalar
                0.01f, // acceleration
                7000.0f, // orbit radius
                null, null, null, // optional geospatial
                null, null, null, null // optional angles
        );

        // Then
        assertThat(data.getId()).isEqualTo(key);
        assertThat(data.getExternalId()).isEqualTo(456L);
        assertThat(data.getSatLatitude()).isNull();
        assertThat(data.getSatLongitude()).isNull();
        assertThat(data.getSatAltitude()).isNull();
        assertThat(data.getAzimuth()).isNull();
        assertThat(data.getElevation()).isNull();
        assertThat(data.getRightAscension()).isNull();
        assertThat(data.getDeclination()).isNull();
    }

    @Test
    void shouldUpdateFields() {
        // Given
        TrajectoryDataKey key = new TrajectoryDataKey(789L, Timestamp.from(Instant.now()));
        TrajectoryData data = new TrajectoryData(
                key, 1.0f, 2.0f, 3.0f, 0.1f, 0.2f, 0.3f, 0.5f, 0.01f, 7000.0f,
                null, null, null, null, null, null, null);

        // When
        data.setPositionX(999.0f);
        data.setVelocity(100.0f);
        data.setSatLatitude(12.34f);

        // Then
        assertThat(data.getPositionX()).isEqualTo(999.0f);
        assertThat(data.getVelocity()).isEqualTo(100.0f);
        assertThat(data.getSatLatitude()).isEqualTo(12.34f);
    }
}