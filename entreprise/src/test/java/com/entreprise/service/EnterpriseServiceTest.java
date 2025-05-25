package com.entreprise.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.entreprise.model.Enterprise;
import com.entreprise.repository.EnterpriseRepository;

@ExtendWith(MockitoExtension.class)
class EnterpriseServiceTest {

    @Mock
    private EnterpriseRepository enterpriseRepository;

    private EnterpriseService enterpriseService;

    @BeforeEach
    void setUp() {
        enterpriseService = new EnterpriseServiceImpl(enterpriseRepository);
    }

    @Test
    void shouldCreateEnterprise() {
        // Given
        String name = "Test Enterprise";
        Enterprise savedEnterprise = new Enterprise(UUID.randomUUID(), name, Instant.now());
        when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(savedEnterprise);

        // When
        Enterprise result = enterpriseService.createEnterprise(name);

        // Then
        assertThat(result.getName()).isEqualTo(name);
        verify(enterpriseRepository).save(any(Enterprise.class));
    }

    @Test
    void shouldGetEnterpriseById() {
        // Given
        UUID id = UUID.randomUUID();
        Enterprise enterprise = new Enterprise(id, "Test Enterprise", Instant.now());
        when(enterpriseRepository.findById(id)).thenReturn(Optional.of(enterprise));

        // When
        Optional<Enterprise> result = enterpriseService.getEnterpriseById(id);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(id);
        verify(enterpriseRepository).findById(id);
    }

    @Test
    void shouldReturnEmptyWhenEnterpriseNotFound() {
        // Given
        UUID id = UUID.randomUUID();
        when(enterpriseRepository.findById(id)).thenReturn(Optional.empty());

        // When
        Optional<Enterprise> result = enterpriseService.getEnterpriseById(id);

        // Then
        assertThat(result).isEmpty();
        verify(enterpriseRepository).findById(id);
    }

    @Test
    void shouldGetAllEnterprises() {
        // Given
        List<Enterprise> enterprises = Arrays.asList(
                new Enterprise(UUID.randomUUID(), "Enterprise 1", Instant.now()),
                new Enterprise(UUID.randomUUID(), "Enterprise 2", Instant.now()));
        when(enterpriseRepository.findAll()).thenReturn(enterprises);

        // When
        List<Enterprise> result = enterpriseService.getAllEnterprises();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Enterprise::getName)
                .containsExactly("Enterprise 1", "Enterprise 2");
        verify(enterpriseRepository).findAll();
    }

    @Test
    void shouldGetEnterpriseByName() {
        // Given
        String name = "Test Enterprise";
        Enterprise enterprise = new Enterprise(UUID.randomUUID(), name, Instant.now());
        when(enterpriseRepository.findByName(name)).thenReturn(Optional.of(enterprise));

        // When
        Optional<Enterprise> result = enterpriseService.getEnterpriseByName(name);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo(name);
        verify(enterpriseRepository).findByName(name);
    }

    @Test
    void shouldUpdateEnterprise() {
        // Given
        UUID id = UUID.randomUUID();
        String newName = "Updated Enterprise";
        Enterprise existingEnterprise = new Enterprise(id, "Old Name", Instant.now());
        Enterprise updatedEnterprise = new Enterprise(id, newName, Instant.now());

        when(enterpriseRepository.findById(id)).thenReturn(Optional.of(existingEnterprise));
        when(enterpriseRepository.save(any(Enterprise.class))).thenReturn(updatedEnterprise);

        // When
        Enterprise result = enterpriseService.updateEnterprise(id, newName);

        // Then
        assertThat(result.getName()).isEqualTo(newName);
        verify(enterpriseRepository).findById(id);
        verify(enterpriseRepository).save(any(Enterprise.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentEnterprise() {
        // Given
        UUID id = UUID.randomUUID();
        when(enterpriseRepository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> enterpriseService.updateEnterprise(id, "New Name"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Enterprise not found: " + id);

        verify(enterpriseRepository).findById(id);
        verify(enterpriseRepository, never()).save(any(Enterprise.class));
    }

    @Test
    void shouldDeleteEnterprise() {
        // Given
        UUID id = UUID.randomUUID();

        // When
        enterpriseService.deleteEnterprise(id);

        // Then
        verify(enterpriseRepository).deleteById(id);
    }
}