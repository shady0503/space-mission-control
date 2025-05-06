// com/dashboard/controller/DashboardController.java
package com.dashboard.controller;

import com.dashboard.client.MissionClient;
import com.dashboard.client.OperatorClient;
import com.dashboard.client.SpacecraftServiceClient;
import com.dashboard.client.TelemetryClient;
import com.dashboard.dto.*;
import com.dashboard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MissionClient missionClient;
    private final SpacecraftServiceClient spacecraftServiceClient;
    private final TelemetryClient telemetryClient;
    private final DashboardService dashboardService;
    private final OperatorClient operatorClient;

    public DashboardController(
            MissionClient missionClient,
            SpacecraftServiceClient spacecraftServiceClient,
            TelemetryClient telemetryClient,
            DashboardService dashboardService, OperatorClient operatorClient
    ) {
        this.missionClient = missionClient;
        this.spacecraftServiceClient = spacecraftServiceClient;
        this.telemetryClient = telemetryClient;
        this.dashboardService = dashboardService;
        this.operatorClient = operatorClient;
    }

    @GetMapping("/summary")
    public DashboardSummaryDTO getDashboardSummary(
            @RequestParam(required = false) UUID operatorId
    ) {
        UUID effectiveOperatorId = Optional.ofNullable(operatorId)
                .orElse(UUID.fromString("00000000-0000-0000-0000-000000000000"));

        long activeMissions    = missionClient.countActiveMissions(effectiveOperatorId);
        List<UUID> missionIds  = missionClient.getMissionIdsByOperator(effectiveOperatorId);
        long totalSpacecraft    = spacecraftServiceClient.countByMissionIds(missionIds);
        long activeOperators    = missionClient.countDistinctOperatorsByMissionIds(missionIds);
        long pendingCommands    = spacecraftServiceClient.countPendingCommands(effectiveOperatorId);

        return dashboardService.buildSummary(
                activeMissions,
                totalSpacecraft,
                activeOperators,
                pendingCommands
        );
    }

    // in com/dashboard/controller/DashboardController.java

    @GetMapping("/missions/stats")
    public MissionStatsDTO getMissionStats(
            @RequestParam(required = false) UUID operatorId
    ) {
        UUID effectiveOperatorId = Optional.ofNullable(operatorId)
                .orElse(UUID.fromString("00000000-0000-0000-0000-000000000000"));

        long active   = missionClient.countActiveMissions(effectiveOperatorId);
        long inactive = missionClient.countInactiveMissions(effectiveOperatorId);

        List<MissionDTO> missions = missionClient.getMissionsByOperator(effectiveOperatorId);
        List<MissionMonthlyCountDTO> raw = missionClient.getMissionsByMonth();

        Map<String,Long> byMonth = raw.stream()
                .collect(Collectors.toMap(
                        mmc -> mmc.getMonth().toString(),
                        MissionMonthlyCountDTO::getCount,
                        (a,b) -> a
                ));

        // collect the mission IDs for the spacecraft count
        List<UUID> missionIds = missions.stream()
                .map(MissionDTO::getId)
                .toList();

        // NEW: get one aggregated operator count instead of a per-mission list
        int distinctOperators = missionClient.countDistinctOperatorsByMissionIds(missionIds);

        List<UUID> scCounts = spacecraftServiceClient.getSpacecraftCounts(missionIds);

        return dashboardService.buildMissionStats(
                active,
                inactive,
                missions,
                byMonth,
                distinctOperators,   // ← changed type from List<UUID> to int
                scCounts
        );
    }


    // in DashboardController.java
    @GetMapping("/spacecraft/stats")
    public SpacecraftStatsDTO getSpacecraftStats(
            @RequestParam(required = false) UUID operatorId
    ) {
        UUID effectiveOperatorId = Optional.ofNullable(operatorId)
                .orElse(UUID.fromString("00000000-0000-0000-0000-000000000000"));

        // 1) get the mission IDs the same as before
        OperatorDTO op = operatorClient.getOperator(effectiveOperatorId);

        // 2) count by type
        Map<String, Long> countByType = spacecraftServiceClient.countSpacecraftByType(op.getEnterpriseId());

        // 3) POST telemetry count request
        long activeCount = telemetryClient.countActiveSpacecraft(op.getEnterpriseId());

        // 4) get orbit radius back from spacecraft-service (not telemetry!)
        double avgRadius = telemetryClient.getAverageOrbitRadius(op.getEnterpriseId());

        return dashboardService.buildSpacecraftStats(
                countByType,
                activeCount,
                avgRadius
        );
    }


    @GetMapping("/commands/stats")
    public CommandStatsDTO getCommandStats(
            @RequestParam(required = false) UUID operatorId
    ) {
        UUID effectiveOperatorId = Optional.ofNullable(operatorId)
                .orElse(UUID.fromString("00000000-0000-0000-0000-000000000000"));

        long success    = spacecraftServiceClient.countSuccessfulCommands(effectiveOperatorId);
        long pending    = spacecraftServiceClient.countPendingCommands(effectiveOperatorId);
        Map<String, Long> byType     = spacecraftServiceClient.countCommandsByType();
        Map<UUID, Long> byOperator   = spacecraftServiceClient.countByOperator(effectiveOperatorId);

        return dashboardService.buildCommandStats(
                success,
                pending,
                byType,
                byOperator
        );
    }

    @GetMapping("/telemetry/summary")
    public TelemetrySummaryDTO getTelemetrySummary(
            @RequestParam(value = "enterpriseId") UUID enterpriseId
    ) {
        return telemetryClient.getTelemetrySummary(enterpriseId);
    }
}
