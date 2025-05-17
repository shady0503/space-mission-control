package microservices.auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import microservices.auth_service.TestAuthUtil;
import microservices.auth_service.client.MissionClient;
import microservices.auth_service.config.RestExceptionHandler;
import microservices.auth_service.dto.MissionRole;
import microservices.auth_service.model.Operator;
import microservices.auth_service.service.OperatorService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OperatorControllerTest {

    @Mock private OperatorService operatorService;
    @Mock private MissionClient missionClient;
    @InjectMocks private OperatorController operatorController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Operator sample = new Operator();

    @BeforeEach
    void setUp() {
        sample.setId(1L);
        sample.setUsername("bob");
        sample.setEmail("bob@x.com");

        mockMvc = MockMvcBuilders
                .standaloneSetup(operatorController)
                .setControllerAdvice(new RestExceptionHandler())
                .build();
    }

    @AfterEach
    void tearDown() {
        TestAuthUtil.clearAuth();
    }

    @Test
    void getCurrentOperator() throws Exception {
        when(operatorService.getByUsername("bob")).thenReturn(sample);

        TestAuthUtil.setAuth("bob");
        mockMvc.perform(get("/api/operator/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));

        verify(operatorService).getByUsername("bob");
    }

    @Test
    void getOperatorById() throws Exception {
        when(operatorService.getById(1L)).thenReturn(sample);

        mockMvc.perform(get("/api/operator/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("bob"));

        verify(operatorService).getById(1L);
    }

    @Test
    void getAllOperators() throws Exception {
        // your “me”
        when(operatorService.getByUsername("bob")).thenReturn(sample);

        // a “peer” with id != 1L
        Operator peer = new Operator();
        peer.setId(2L);
        peer.setUsername("alice");
        peer.setEmail("alice@x.com");
        peer.setRole(MissionRole.VIEWER);

        // now findTeamPeers returns [ sample, peer ]
        when(operatorService.findTeamPeers(1L))
                .thenReturn(List.of(sample, peer));

        TestAuthUtil.setAuth("bob");
        mockMvc.perform(get("/api/operator/all"))
                .andExpect(status().isOk())
                // the only element after filtering is `peer`
                .andExpect(jsonPath("$[0].email").value("alice@x.com"));

        verify(operatorService).findTeamPeers(1L);
    }


    @Test
    void getOperatorMissions() throws Exception {
        when(operatorService.getByUsername("bob")).thenReturn(sample);
        var dto = new MissionClient.MissionDto(
                5L, "m1", "desc", true, "2025-01-01", "2025-02-01"
        );
        when(missionClient.getMissionsForOperator(1L)).thenReturn(List.of(dto));

        TestAuthUtil.setAuth("bob");
        mockMvc.perform(get("/api/operator/missions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5L));

        verify(missionClient).getMissionsForOperator(1L);
    }

    @Test
    void updateOperatorRoleSuccess() throws Exception {
        // use a valid role ("ADMIN"), not "COMMANDER"
        var req = new OperatorRoleUpdateRequest(5L, 1L, "ADMIN");

        // and stub + expect ADMIN everywhere
        var updated = new MissionClient.MissionOperatorDto(
                /* id */        10L,
                /* missionId */  5L,
                /* operatorId */ 1L,
                /* role */      "ADMIN",
                /* assignedAt */ "2025-04-27T00:00:00"
        );
        when(operatorService.updateOperatorRole(5L, 1L, MissionRole.ADMIN))
                .thenReturn(updated);

        mockMvc.perform(put("/api/operator/update/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        verify(operatorService).updateOperatorRole(5L, 1L, MissionRole.ADMIN);
    }

    @Test
    void updateOperatorRoleBad() throws Exception {
        var req = new OperatorRoleUpdateRequest(5L, 1L, "INVALID");

        mockMvc.perform(put("/api/operator/update/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(operatorService);
    }
}
