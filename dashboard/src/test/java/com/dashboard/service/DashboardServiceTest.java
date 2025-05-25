package com.dashboard.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import com.dashboard.dto.ActivityLogDTO;
import com.dashboard.dto.CommandStatsDTO;
import com.dashboard.dto.DashboardSummaryDTO;
import com.dashboard.dto.MissionDTO;
import com.dashboard.dto.MissionStatsDTO;
import com.dashboard.dto.RecentActivityDTO;
import com.dashboard.dto.SpacecraftStatsDTO;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService();
    }

    @Test
    void buildSummary_ShouldReturnCorrectSummary() {
        // Given
        long activeMissions = 5L;
        long totalSpacecraft = 15L;
        long activeOperators = 3L;
        long pendingCommands = 8L;

        // When
        DashboardSummaryDTO result = dashboardService.buildSummary(
                activeMissions, totalSpacecraft, activeOperators, pendingCommands);

        // Then
        assertNotNull(result);
        assertEquals(activeMissions, result.getActiveMissionCount());
        assertEquals(totalSpacecraft, result.getTotalSpacecraftCount());
        assertEquals(activeOperators, result.getActiveOperatorCount());
        assertEquals(pendingCommands, result.getPendingCommandCount());
    }

    @Test
    void buildMissionStats_ShouldReturnCorrectStats() {
        // Given
        long activeMissions = 3L;
        long inactiveMissions = 2L;
        List<MissionDTO> missions = Arrays.asList(new MissionDTO(), new MissionDTO());
        Map<String, Long> missionsByMonth = Map.of("2024-01", 2L, "2024-02", 1L);
        int distinctOperators = 4;
        List<UUID> spacecraftsCount = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());

        // When
        MissionStatsDTO result = dashboardService.buildMissionStats(
                activeMissions, inactiveMissions, missions, missionsByMonth, distinctOperators, spacecraftsCount);

        // Then
        assertNotNull(result);
        assertEquals(activeMissions, result.getActiveMissionCount());
        assertEquals(inactiveMissions, result.getInactiveMissionCount());
        assertEquals(missions, result.getMissions());
        assertEquals(missionsByMonth, result.getMissionsByMonth());
        assertEquals(distinctOperators, result.getDistinctOperators());
        assertEquals(spacecraftsCount, result.getSpacecraftsCount());
    }

    @Test
    void buildSpacecraftStats_ShouldReturnCorrectStats() {
        // Given
        Map<String, Long> countByType = Map.of("SATELLITE", 5L, "PROBE", 3L);
        long activeSpacecraftCount = 7L;
        double averageOrbitRadius = 6371.5;

        // When
        SpacecraftStatsDTO result = dashboardService.buildSpacecraftStats(
                countByType, activeSpacecraftCount, averageOrbitRadius);

        // Then
        assertNotNull(result);
        assertEquals(countByType, result.getCountByType());
        assertEquals(activeSpacecraftCount, result.getActiveSpacecraftCount());
        assertEquals(averageOrbitRadius, result.getAverageOrbitRadius());
    }

    @Test
    void buildCommandStats_ShouldReturnCorrectStats() {
        // Given
        long successfulCommands = 25L;
        long pendingCommands = 5L;
        Map<String, Long> commandsByType = Map.of("DEPLOY", 10L, "MANEUVER", 15L);
        Map<UUID, Long> commandsByOperator = Map.of(UUID.randomUUID(), 20L, UUID.randomUUID(), 10L);

        // When
        CommandStatsDTO result = dashboardService.buildCommandStats(
                successfulCommands, pendingCommands, commandsByType, commandsByOperator);

        // Then
        assertNotNull(result);
        assertEquals(successfulCommands, result.getSuccessfulCommandCount());
        assertEquals(pendingCommands, result.getPendingCommandCount());
        assertEquals(commandsByType, result.getCommandsByType());
        assertEquals(commandsByOperator, result.getCommandsByOperator());
    }

    @Test
    void buildRecentActivity_ShouldReturnCorrectActivity() {
        // Given
        List<ActivityLogDTO> activityLogs = Arrays.asList(
                new ActivityLogDTO(),
                new ActivityLogDTO());

        // When
        RecentActivityDTO result = dashboardService.buildRecentActivity(activityLogs);

        // Then
        assertNotNull(result);
        assertEquals(activityLogs, result.getRecentActivities());
    }

    @Test
    void buildSummary_WithZeroValues_ShouldReturnZeroSummary() {
        // Given
        long activeMissions = 0L;
        long totalSpacecraft = 0L;
        long activeOperators = 0L;
        long pendingCommands = 0L;

        // When
        DashboardSummaryDTO result = dashboardService.buildSummary(
                activeMissions, totalSpacecraft, activeOperators, pendingCommands);

        // Then
        assertNotNull(result);
        assertEquals(0L, result.getActiveMissionCount());
        assertEquals(0L, result.getTotalSpacecraftCount());
        assertEquals(0L, result.getActiveOperatorCount());
        assertEquals(0L, result.getPendingCommandCount());
    }

    @Test
    void buildSpacecraftStats_WithEmptyMap_ShouldReturnEmptyStats() {
        // Given
        Map<String, Long> countByType = Collections.emptyMap();
        long activeSpacecraftCount = 0L;
        double averageOrbitRadius = 0.0;

        // When
        SpacecraftStatsDTO result = dashboardService.buildSpacecraftStats(
                countByType, activeSpacecraftCount, averageOrbitRadius);

        // Then
        assertNotNull(result);
        assertTrue(result.getCountByType().isEmpty());
        assertEquals(0L, result.getActiveSpacecraftCount());
        assertEquals(0.0, result.getAverageOrbitRadius());
    }
}