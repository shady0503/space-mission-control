package microservices.auth_service.integration;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;

import microservices.auth_service.dto.LoginRequest;
import microservices.auth_service.dto.SignupRequest;
import microservices.auth_service.model.Operator;
import microservices.auth_service.repository.OperatorRepository;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private OperatorRepository operatorRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        operatorRepository.deleteAll();
    }

    @Test
    void shouldSignupAndSigninOperator() throws Exception {
        // Given
        SignupRequest signupRequest = new SignupRequest("integrationuser", "integration@test.com", "password123", null,
                null);

        // When - Signup
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        // Then - Verify user was created in database
        assertThat(operatorRepository.findByUsername("integrationuser")).isPresent();

        // When - Signin
        LoginRequest loginRequest = new LoginRequest("integrationuser", "password123");

        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void shouldRejectDuplicateUsername() throws Exception {
        // Given - Create an existing user
        Operator existingOperator = new Operator();
        existingOperator.setUsername("duplicate");
        existingOperator.setEmail("duplicate@test.com");
        existingOperator.setHashedPassword(passwordEncoder.encode("password"));
        operatorRepository.save(existingOperator);

        // When - Try to signup with same username
        SignupRequest signupRequest = new SignupRequest("duplicate", "different@test.com", "password123", null, null);

        // Then - Should fail
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest))
                .with(csrf()))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void shouldRejectInvalidCredentials() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("nonexistent", "wrongpassword");

        // When & Then
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
                .with(csrf()))
                .andExpect(status().is4xxClientError());
    }
}