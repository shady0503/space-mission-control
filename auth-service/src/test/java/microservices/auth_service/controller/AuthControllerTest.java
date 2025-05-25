package microservices.auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import microservices.auth_service.client.EnterpriseClient;
import microservices.auth_service.client.MissionClient;
import microservices.auth_service.client.SpacecraftClient;
import microservices.auth_service.config.TestSecurityConfig;
import microservices.auth_service.dto.LoginRequest;
import microservices.auth_service.dto.SignupRequest;
import microservices.auth_service.model.Operator;
import microservices.auth_service.service.OperatorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OperatorService operatorService;

    @MockBean
    private EnterpriseClient enterpriseClient;

    @MockBean
    private MissionClient missionClient;

    @MockBean
    private SpacecraftClient spacecraftClient;

    @Test
    void shouldSignupNewOperator() throws Exception {
        // Given
        SignupRequest request = new SignupRequest("testuser", "test@example.com", "password123", null, null);

        Operator operator = new Operator();
        operator.setId(UUID.randomUUID());
        operator.setUsername("testuser");
        operator.setEmail("test@example.com");

        when(operatorService.register(any(SignupRequest.class))).thenReturn(operator);
        when(operatorService.generateTokenFor("testuser")).thenReturn("jwt-token");

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void shouldSigninExistingOperator() throws Exception {
        // Given
        LoginRequest request = new LoginRequest("testuser", "password123");

        when(operatorService.authenticate("testuser", "password123")).thenReturn("jwt-token");

        // When & Then
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void shouldReturnBadRequestForInvalidSignin() throws Exception {
        // Given
        LoginRequest request = new LoginRequest("invalid", "wrong");

        when(operatorService.authenticate("invalid", "wrong"))
                .thenThrow(new IllegalArgumentException("Invalid credentials"));

        // When & Then
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
    }
}