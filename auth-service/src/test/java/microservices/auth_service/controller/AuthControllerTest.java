package microservices.auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import microservices.auth_service.config.RestExceptionHandler;
import microservices.auth_service.dto.LoginRequest;
import microservices.auth_service.dto.MissionRole;
import microservices.auth_service.dto.SignupRequest;
import microservices.auth_service.model.Operator;
import microservices.auth_service.service.OperatorService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private OperatorService operatorService;
    @InjectMocks private AuthController authController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new RestExceptionHandler())
                .build();
    }

    @Test
    void signupSuccess() throws Exception {
        var req = new SignupRequest("alice","a@x.com","secret", MissionRole.VIEWER);
        var op  = new Operator();
        op.setUsername("alice");

        when(operatorService.register(req)).thenReturn(op);
        when(operatorService.generateTokenFor("alice")).thenReturn("jwt-token");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("jwt-token"));

        verify(operatorService).register(req);
        verify(operatorService).generateTokenFor("alice");
    }

    @Test
    void signupFailure() throws Exception {
        var req = new SignupRequest("bob","b@x.com","pw", MissionRole.ADMIN);
        doThrow(new IllegalStateException("Username taken"))
                .when(operatorService).register(req);

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(operatorService).register(req);
    }

    @Test
    void signinSuccess() throws Exception {
        var req = new LoginRequest("alice","secret");
        when(operatorService.authenticate("alice","secret")).thenReturn("jwt-token");

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));

        verify(operatorService).authenticate("alice","secret");
    }

    @Test
    void signinFailure() throws Exception {
        var req = new LoginRequest("alice","wrong");
        doThrow(new IllegalArgumentException("Invalid credentials"))
                .when(operatorService).authenticate("alice","wrong");

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());

        verify(operatorService).authenticate("alice","wrong");
    }
}
