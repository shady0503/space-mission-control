package com.entreprise.integration;

import com.entreprise.model.Enterprise;
import com.entreprise.repository.EnterpriseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
class EnterpriseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Mock external clients to avoid dependencies
    @MockBean
    private com.entreprise.client.OperatorClient operatorClient;

    @MockBean
    private com.entreprise.client.MissionClient missionClient;

    @MockBean
    private com.entreprise.client.SpacecraftClient spacecraftClient;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        enterpriseRepository.deleteAll();
    }

    @Test
    void shouldCreateAndRetrieveEnterprise() throws Exception {
        // Given
        String enterpriseName = "Integration Test Enterprise";
        String requestBody = "{\"name\":\"" + enterpriseName + "\"}";

        // When - Create enterprise
        String response = mockMvc.perform(post("/api/enterprise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(enterpriseName))
                .andExpect(jsonPath("$.id").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract ID from response
        Enterprise createdEnterprise = objectMapper.readValue(response, Enterprise.class);
        UUID enterpriseId = createdEnterprise.getId();

        // Then - Verify it's stored in database
        assertThat(enterpriseRepository.findById(enterpriseId)).isPresent();

        // And - Retrieve it via API
        mockMvc.perform(get("/api/enterprise/{id}", enterpriseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(enterpriseId.toString()))
                .andExpect(jsonPath("$.name").value(enterpriseName));
    }

    @Test
    void shouldUpdateEnterprise() throws Exception {
        // Given - Create an enterprise first
        Enterprise enterprise = new Enterprise();
        enterprise.setName("Original Name");
        Enterprise saved = enterpriseRepository.save(enterprise);

        String newName = "Updated Name";
        String requestBody = "{\"name\":\"" + newName + "\"}";

        // When - Update the enterprise
        mockMvc.perform(put("/api/enterprise/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                .andExpect(jsonPath("$.name").value(newName));

        // Then - Verify it's updated in database
        Enterprise updated = enterpriseRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getName()).isEqualTo(newName);
    }

    @Test
    void shouldDeleteEnterprise() throws Exception {
        // Given - Create an enterprise first
        Enterprise enterprise = new Enterprise();
        enterprise.setName("To Be Deleted");
        Enterprise saved = enterpriseRepository.save(enterprise);

        // When - Delete the enterprise
        mockMvc.perform(delete("/api/enterprise/{id}", saved.getId()))
                .andExpect(status().isNoContent());

        // Then - Verify it's deleted from database
        assertThat(enterpriseRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    void shouldListAllEnterprises() throws Exception {
        // Given - Create multiple enterprises
        Enterprise enterprise1 = new Enterprise();
        enterprise1.setName("Enterprise 1");
        Enterprise enterprise2 = new Enterprise();
        enterprise2.setName("Enterprise 2");

        enterpriseRepository.save(enterprise1);
        enterpriseRepository.save(enterprise2);

        // When & Then - List all enterprises
        mockMvc.perform(get("/api/enterprise"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].name")
                        .value(org.hamcrest.Matchers.containsInAnyOrder("Enterprise 1", "Enterprise 2")));
    }

    @Test
    void shouldReturnNotFoundForNonExistentEnterprise() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/api/enterprise/{id}", nonExistentId))
                .andExpect(status().isNotFound());
    }
}