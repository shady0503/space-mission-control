package com.entreprise.controller;

import com.entreprise.client.MissionClient;
import com.entreprise.client.OperatorClient;
import com.entreprise.client.SpacecraftClient;
import com.entreprise.model.Enterprise;
import com.entreprise.service.EnterpriseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EnterpriseController.class)
class EnterpriseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EnterpriseService enterpriseService;

    @MockBean
    private OperatorClient operatorClient;

    @MockBean
    private MissionClient missionClient;

    @MockBean
    private SpacecraftClient spacecraftClient;

    @Test
    void shouldCreateEnterprise() throws Exception {
        // Given
        String name = "Test Enterprise";
        Enterprise enterprise = new Enterprise(UUID.randomUUID(), name, Instant.now());
        when(enterpriseService.createEnterprise(name)).thenReturn(enterprise);

        String requestBody = "{\"name\":\"" + name + "\"}";

        // When & Then
        mockMvc.perform(post("/api/enterprise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(name))
                .andExpect(jsonPath("$.id").exists());

        verify(enterpriseService).createEnterprise(name);
    }

    @Test
    void shouldGetAllEnterprises() throws Exception {
        // Given
        List<Enterprise> enterprises = Arrays.asList(
                new Enterprise(UUID.randomUUID(), "Enterprise 1", Instant.now()),
                new Enterprise(UUID.randomUUID(), "Enterprise 2", Instant.now()));
        when(enterpriseService.getAllEnterprises()).thenReturn(enterprises);

        // When & Then
        mockMvc.perform(get("/api/enterprise"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Enterprise 1"))
                .andExpect(jsonPath("$[1].name").value("Enterprise 2"));

        verify(enterpriseService).getAllEnterprises();
    }

    @Test
    void shouldGetEnterpriseById() throws Exception {
        // Given
        UUID id = UUID.randomUUID();
        Enterprise enterprise = new Enterprise(id, "Test Enterprise", Instant.now());
        when(enterpriseService.getEnterpriseById(id)).thenReturn(Optional.of(enterprise));

        // When & Then
        mockMvc.perform(get("/api/enterprise/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Test Enterprise"));

        verify(enterpriseService).getEnterpriseById(id);
    }

    @Test
    void shouldReturnNotFoundWhenEnterpriseDoesNotExist() throws Exception {
        // Given
        UUID id = UUID.randomUUID();
        when(enterpriseService.getEnterpriseById(id)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/enterprise/{id}", id))
                .andExpect(status().isNotFound());

        verify(enterpriseService).getEnterpriseById(id);
    }

    @Test
    void shouldUpdateEnterprise() throws Exception {
        // Given
        UUID id = UUID.randomUUID();
        String newName = "Updated Enterprise";
        Enterprise updatedEnterprise = new Enterprise(id, newName, Instant.now());
        when(enterpriseService.updateEnterprise(eq(id), eq(newName))).thenReturn(updatedEnterprise);

        String requestBody = "{\"name\":\"" + newName + "\"}";

        // When & Then
        mockMvc.perform(put("/api/enterprise/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value(newName));

        verify(enterpriseService).updateEnterprise(id, newName);
    }

    @Test
    void shouldDeleteEnterprise() throws Exception {
        // Given
        UUID id = UUID.randomUUID();

        // When & Then
        mockMvc.perform(delete("/api/enterprise/{id}", id))
                .andExpect(status().isNoContent());

        verify(enterpriseService).deleteEnterprise(id);
    }
}