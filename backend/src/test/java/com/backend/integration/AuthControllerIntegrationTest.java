package com.backend.integration;

import com.backend.auth.dto.SignupRequest;
import com.backend.commands.repository.OperatorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OperatorRepository operatorRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testSignupAndReturnToken() throws Exception {
        // Generate a unique username to avoid conflicts in the DB
        String uniqueUsername = "intUser_" + System.currentTimeMillis();
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername(uniqueUsername);
        signupRequest.setEmail(uniqueUsername + "@example.com");
        signupRequest.setPassword("intpassword");
        signupRequest.setRole("ADMIN");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}
