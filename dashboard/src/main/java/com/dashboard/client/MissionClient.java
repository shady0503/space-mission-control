// com/dashboard/client/MissionClient.java
package com.dashboard.client;

import com.dashboard.config.FeignClientConfig;
import com.dashboard.dto.MissionDTO;
import com.dashboard.dto.MissionMonthlyCountDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@FeignClient(
        name = "mission-service",
        url = "${MISSION_SERVICE_URL}",
        configuration = FeignClientConfig.class
)
public interface MissionClient {

    @GetMapping("/api/missions/operator/{operatorId}/count/active")
    long countActiveMissions(@PathVariable UUID operatorId);

    @GetMapping("/api/missions/operator/{operatorId}/count/inactive")
    long countInactiveMissions(@PathVariable UUID operatorId);

    @GetMapping("/api/missions/operator/{operatorId}/ids")
    List<UUID> getMissionIdsByOperator(@PathVariable UUID operatorId);

    @PostMapping("/api/missions/count/operators/distinct")
    int countDistinctOperatorsByMissionIds(@RequestBody List<UUID> missionIds);

    @GetMapping("/api/missions/operator/{operatorId}")
    List<MissionDTO> getMissionsByOperator(@PathVariable UUID operatorId);

    /** ←– Updated path to match your mission-service controller */
    @GetMapping("/api/missions/statistics/monthly")
    List<MissionMonthlyCountDTO> getMissionsByMonth();

    @PostMapping("/api/missions/operator/counts")
    List<UUID> getOperatorCounts(@RequestBody List<UUID> missionIds);
}
