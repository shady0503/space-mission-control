// src/main/java/com/dashboard/service/DashboardService.java
package com.dashboard.service;

import com.dashboard.dto.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DashboardService {
    public DashboardSummaryDTO buildSummary(
            long activeMissions,
            long totalSpacecraft,
            long activeOperators,
            long pendingCommands
//            long recentAlerts
    ) {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();
        dto.setActiveMissionCount(activeMissions);
        dto.setTotalSpacecraftCount(totalSpacecraft);
        dto.setActiveOperatorCount(activeOperators);
        dto.setPendingCommandCount(pendingCommands);
//        dto.setRecentAlertCount(recentAlerts);
        return dto;
    }

    public MissionStatsDTO buildMissionStats(
            long activeMissions,
            long inactiveMissions,
            List<MissionDTO> missions,
            Map<String, Long> missionsByMonth,
            int distinctOperators,
            List<UUID> spacecraftsCount
    ) {
        MissionStatsDTO dto = new MissionStatsDTO();
        dto.setActiveMissionCount(activeMissions);
        dto.setInactiveMissionCount(inactiveMissions);
        dto.setMissions(missions);
        dto.setMissionsByMonth(missionsByMonth);
        dto.setDistinctOperators(distinctOperators);
        dto.setSpacecraftsCount(spacecraftsCount);
        return dto;
    }

    public SpacecraftStatsDTO buildSpacecraftStats(
            Map<String, Long> countByType,
            long activeSpacecraftCount,
            double averageOrbitRadius
    ) {
        SpacecraftStatsDTO dto = new SpacecraftStatsDTO();
        dto.setCountByType(countByType);
        dto.setActiveSpacecraftCount(activeSpacecraftCount);
        dto.setAverageOrbitRadius(averageOrbitRadius);
        return dto;
    }

    public CommandStatsDTO buildCommandStats(
            long successfulCommands,
            long pendingCommands,
            Map<String, Long> commandsByType,
            Map<UUID, Long> commandsByOperator
    ) {
        CommandStatsDTO dto = new CommandStatsDTO();
        dto.setSuccessfulCommandCount(successfulCommands);
        dto.setPendingCommandCount(pendingCommands);
        dto.setCommandsByType(commandsByType);
        dto.setCommandsByOperator(commandsByOperator);
        return dto;
    }

    public RecentActivityDTO buildRecentActivity(
            List<ActivityLogDTO> activityLogs
    ) {
        RecentActivityDTO dto = new RecentActivityDTO();
        dto.setRecentActivities(activityLogs);
        return dto;
    }

    private TelemetrySummaryDTO buildTelemetrySummary(
            List<TelemetrySummaryDTO.SpacecraftTelemetry> spacecrafts,
            long totalDataPointsLast24h,
            double averageSystemVelocity,
            int spacecraftWithTelemetryCount
    ) {
        TelemetrySummaryDTO dto = new TelemetrySummaryDTO();
        dto.setSpacecrafts(spacecrafts);

        TelemetrySummaryDTO.SystemMetrics system = new TelemetrySummaryDTO.SystemMetrics();
        system.setTotalDataPointsLast24h(totalDataPointsLast24h);
        system.setAverageSystemVelocity(averageSystemVelocity);
        system.setSpacecraftWithTelemetryCount(spacecraftWithTelemetryCount);
        dto.setSystem(system);

        return dto;
    }

}