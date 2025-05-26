package com.telemetry.service;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.telemetry.client.SpacecraftClient;
import com.telemetry.model.SatelliteReference;
import com.telemetry.repository.SatelliteReferenceRepository;

@ExtendWith(MockitoExtension.class)
class SatelliteSyncServiceTest {

    @Mock
    private SpacecraftClient spacecraftClient;

    @Mock
    private SatelliteReferenceRepository repository;

    @InjectMocks
    private SatelliteSyncService service;

    @Test
    void shouldSyncNewSpacecraft() {
        // Given
        long externalId = 12345L;
        UUID enterpriseId = UUID.randomUUID();
        SpacecraftClient.SpacecraftSummary summary = new SpacecraftClient.SpacecraftSummary(
                UUID.randomUUID(),
                externalId,
                enterpriseId,
                "Test Satellite");

        when(spacecraftClient.findAllSummary()).thenReturn(List.of(summary));
        when(repository.existsByExternalId(externalId)).thenReturn(false);

        // When
        service.syncSpacecraft();

        // Then
        verify(repository).existsByExternalId(externalId);
        verify(repository).save(any(SatelliteReference.class));
    }

    @Test
    void shouldNotSyncExistingSpacecraft() {
        // Given
        long externalId = 67890L;
        SpacecraftClient.SpacecraftSummary summary = new SpacecraftClient.SpacecraftSummary(
                UUID.randomUUID(),
                externalId,
                UUID.randomUUID(),
                "Existing Satellite");

        when(spacecraftClient.findAllSummary()).thenReturn(List.of(summary));
        when(repository.existsByExternalId(externalId)).thenReturn(true);

        // When
        service.syncSpacecraft();

        // Then
        verify(repository).existsByExternalId(externalId);
        verify(repository, never()).save(any(SatelliteReference.class));
    }

    @Test
    void shouldHandleEmptySpacecraftList() {
        // Given
        when(spacecraftClient.findAllSummary()).thenReturn(List.of());

        // When
        service.syncSpacecraft();

        // Then
        verify(spacecraftClient).findAllSummary();
        verify(repository, never()).existsByExternalId(any());
        verify(repository, never()).save(any());
    }
}