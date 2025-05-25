package com.dashboard.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyList;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dashboard.client.MissionClient;
import com.dashboard.client.OperatorClient;
import com.dashboard.client.SpacecraftServiceClient;
import com.dashboard.client.TelemetryClient;
import com.dashboard.dto.CommandStatsDTO;
import com.dashboard.dto.DashboardSummaryDTO;
import com.dashboard.dto.MissionDTO;
import com.dashboard.dto.MissionMonthlyCountDTO;
import com.dashboard.dto.MissionStatsDTO;
import com.dashboard.dto.OperatorDTO;
import com.dashboard.dto.SpacecraftStatsDTO;
import com.dashboard.dto.TelemetrySummaryDTO;
import com.dashboard.service.DashboardService;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock
    private MissionClient missionClient;

    @Mock
    private SpacecraftServiceClient spacecraftServiceClient;

    @Mock
    private TelemetryClient telemetryClient;

    @Mock
    private DashboardService dashboardService;

    @Mock
    private OperatorClient operatorClient;

    private DashboardController dashboardController;

    @BeforeEach
    void setUp() {
        dashboardController = new DashboardController(
                missionClient,
                spacecraftServiceClient,
                telemetryClient,
                dashboardService,
                operatorClient);
    }

    @Test
    void getDashboardSummary_WithOperatorId_ShouldReturnSummary() {
        // Given
        UUID operatorId = UUID.randomUUID();
        List<UUID> missionIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());
        DashboardSummaryDTO expectedSummary = new DashboardSummaryDTO();
        expectedSummary.setActiveMissionCount(5L);
        expectedSummary.setTotalSpacecraftCount(15L);

        when(missionClient.countActiveMissions(operatorId)).thenReturn(5L);
        when(missionClient.getMissionIdsByOperator(operatorId)).thenReturn(missionIds);
        when(spacecraftServiceClient.countByMissionIds(missionIds)).thenReturn(15L);
        when(missionClient.countDistinctOperatorsByMissionIds(missionIds)).thenReturn(3);
        when(spacecraftServiceClient.countPendingCommands(operatorId)).thenReturn(8L);
        when(dashboardService.buildSummary(5L, 15L, 3L, 8L)).thenReturn(expectedSummary);

        // When
        DashboardSummaryDTO result = dashboardController.getDashboardSummary(operatorId);

        // Then
        assertNotNull(result);
        assertEquals(expectedSummary, result);
    }

    @Test
    void getDashboardSummary_WithoutOperatorId_ShouldUseDefaultOperatorId() {
        // Given
        UUID defaultOperatorId = UUID.fromString("00000000-0000-0000-0000-000000000000");
        List<UUID> missionIds = Arrays.asList(UUID.randomUUID());
        DashboardSummaryDTO expectedSummary = new DashboardSummaryDTO();

        when(missionClient.countActiveMissions(defaultOperatorId)).thenReturn(2L);
        when(missionClient.getMissionIdsByOperator(defaultOperatorId)).thenReturn(missionIds);
        when(spacecraftServiceClient.countByMissionIds(missionIds)).thenReturn(5L);
        when(missionClient.countDistinctOperatorsByMissionIds(missionIds)).thenReturn(1);
        when(spacecraftServiceClient.countPendingCommands(defaultOperatorId)).thenReturn(3L);
        when(dashboardService.buildSummary(2L, 5L, 1L, 3L)).thenReturn(expectedSummary);

        // When
        DashboardSummaryDTO result = dashboardController.getDashboardSummary(null);

        // Then
        assertNotNull(result);
        assertEquals(expectedSummary, result);
    }

    @Test
    void getMissionStats_ShouldReturnMissionStats() {
        // Given
        UUID operatorId = UUID.randomUUID();
        List<MissionDTO> missions = Arrays.asList(new MissionDTO(), new MissionDTO());
        MissionMonthlyCountDTO monthlyCount = new MissionMonthlyCountDTO();
        monthlyCount.setMonth(java.time.LocalDateTime.of(2024, 1, 1, 0, 0));
        monthlyCount.setCount(2L);
        List<MissionMonthlyCountDTO> monthlyData = Arrays.asList(monthlyCount);
        List<UUID> spacecraftCounts = Arrays.asList(UUID.randomUUID());
        MissionStatsDTO expectedStats = new MissionStatsDTO();

        when(missionClient.countActiveMissions(operatorId)).thenReturn(3L);
        when(missionClient.countInactiveMissions(operatorId)).thenReturn(2L);
        when(missionClient.getMissionsByOperator(operatorId)).thenReturn(missions);
        when(missionClient.getMissionsByMonth()).thenReturn(monthlyData);
        when(missionClient.countDistinctOperatorsByMissionIds(anyList())).thenReturn(4);
        when(spacecraftServiceClient.getSpacecraftCounts(anyList())).thenReturn(spacecraftCounts);
        when(dashboardService.buildMissionStats(3L, 2L, missions, Map.of("2024-01-01T00:00", 2L), 4, spacecraftCounts))
                .thenReturn(expectedStats);

        // When
        MissionStatsDTO result = dashboardController.getMissionStats(operatorId);

        // Then
        assertNotNull(result);
        assertEquals(expectedStats, result);
    }

    @Test
    void getSpacecraftStats_ShouldReturnSpacecraftStats() {
        // Given
        UUID operatorId = UUID.randomUUID();
        UUID enterpriseId = UUID.randomUUID();
        OperatorDTO operator = new OperatorDTO();
        operator.setEnterpriseId(enterpriseId);

        Map<String, Long> countByType = Map.of("SATELLITE", 5L, "PROBE", 3L);
        SpacecraftStatsDTO expectedStats = new SpacecraftStatsDTO();

        when(operatorClient.getOperator(operatorId)).thenReturn(operator);
        when(spacecraftServiceClient.countSpacecraftByType(enterpriseId)).thenReturn(countByType);
        when(telemetryClient.countActiveSpacecraft(enterpriseId)).thenReturn(7L);
        when(telemetryClient.getAverageOrbitRadius(enterpriseId)).thenReturn(6371.5);
        when(dashboardService.buildSpacecraftStats(countByType, 7L, 6371.5)).thenReturn(expectedStats);

        // When
        SpacecraftStatsDTO result = dashboardController.getSpacecraftStats(operatorId);

        // Then
        assertNotNull(result);
        assertEquals(expectedStats, result);
    }

    @Test
    void getCommandStats_ShouldReturnCommandStats() {
        // Given
        UUID operatorId = UUID.randomUUID();
        Map<String, Long> commandsByType = Map.of("DEPLOY", 10L, "MANEUVER", 15L);
        Map<UUID, Long> commandsByOperator = Map.of(operatorId, 25L);
        CommandStatsDTO expectedStats = new CommandStatsDTO();

        when(spacecraftServiceClient.countSuccessfulCommands(operatorId)).thenReturn(20L);
        when(spacecraftServiceClient.countPendingCommands(operatorId)).thenReturn(5L);
        when(spacecraftServiceClient.countCommandsByType()).thenReturn(commandsByType);
        when(spacecraftServiceClient.countByOperator(operatorId)).thenReturn(commandsByOperator);
        when(dashboardService.buildCommandStats(20L, 5L, commandsByType, commandsByOperator)).thenReturn(expectedStats);

        // When
        CommandStatsDTO result = dashboardController.getCommandStats(operatorId);

        // Then
        assertNotNull(result);
        assertEquals(expectedStats, result);
    }

    @Test
    void getTelemetrySummary_ShouldReturnTelemetrySummary() {
        // Given
        UUID enterpriseId = UUID.randomUUID();
        TelemetrySummaryDTO expectedSummary = new TelemetrySummaryDTO();

        when(telemetryClient.getTelemetrySummary(enterpriseId)).thenReturn(expectedSummary);

        // When
        TelemetrySummaryDTO result = dashboardController.getTelemetrySummary(enterpriseId);

        // Then
        assertNotNull(result);
        assertEquals(expectedSummary, result);
    }
}