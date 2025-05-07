// src/main/java/com/dashboard/client/SpacecraftServiceClient.java
package com.dashboard.client;

import com.dashboard.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@FeignClient(
        name = "spacecraft-service",
        url = "${SPACECRAFT_SERVICE_URL}",
        configuration = FeignClientConfig.class
)
public interface SpacecraftServiceClient {

    //
    // --- spacecraft endpoints ---
    //

    @PostMapping("/api/spacecraft/count/ids")
    long countByMissionIds(@RequestBody List<UUID> missionIds);

    @GetMapping("/api/spacecraft/count/type")
    Map<String, Long> countSpacecraftByType(@RequestParam UUID enterpriseId);

    @GetMapping("/api/spacecraft/average-orbit-radius")
    double getAverageOrbitRadius(@RequestParam UUID enterpriseId);

    @PostMapping("/api/spacecraft/counts")
    List<UUID> getSpacecraftCounts(@RequestBody List<UUID> missionIds);

    //
    // --- command endpoints (now served by the same service) ---
    //

    @GetMapping("/api/commands/count/pending")
    long countPendingCommands(@RequestParam("operatorId") UUID operatorId);

    @GetMapping("/api/commands/count/successful")
    long countSuccessfulCommands(@RequestParam("operatorId") UUID operatorId);

    @GetMapping("/api/commands/count/type")
    Map<String, Long> countCommandsByType();

    @GetMapping("/api/commands/count/operator")
    Map<UUID, Long> countByOperator(@RequestParam("operatorId") UUID operatorId);

}
