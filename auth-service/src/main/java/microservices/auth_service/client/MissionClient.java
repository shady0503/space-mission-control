// src/main/java/com/yourorg/auth/client/MissionClient.java
package microservices.auth_service.client;

import microservices.auth_service.config.FeignAuthInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@FeignClient(
        name = "mission-service",
        url = "${mission.service.url}",
        configuration = FeignAuthInterceptor.class,
        fallbackFactory = MissionClientFallbackFactory.class
)
public interface MissionClient {

    /** Fetch all missions. */
    @GetMapping("/api/missions")
    List<MissionDto> getAllMissions();

    /** Fetch one mission by its ID. */
    @GetMapping("/api/missions/{id}")
    MissionDto getMissionById(@PathVariable("id") UUID id);

    /** Create a new mission. */
    @PostMapping("/api/missions")
    MissionDto createMission(@RequestBody CreateMissionRequest req);

    /** Update an existing mission. */
    @PutMapping("/api/missions/{id}")
    MissionDto updateMission(
            @PathVariable("id") UUID id,
            @RequestBody UpdateMissionRequest req
    );

    /** Delete a mission. */
    @DeleteMapping("/api/missions/{id}")
    void deleteMission(@PathVariable("id") UUID id);

    /** List missions for a given operator ID. */
    @GetMapping("/api/missions/operator/{operatorId}")
    List<MissionDto> getMissionsForOperator(@PathVariable("operatorId") UUID operatorId);


    /** A simple DTO matching the mission-service’s output */
    record MissionDto(
            UUID id,
            String name,
            String description,
            Boolean status,
            String startDate,
            String endDate
    ) {}

    /** Payload for creating a mission */
    record CreateMissionRequest(
            String name,
            String description,
            String startDate,
            String endDate
    ) {}

    /** Payload for updating a mission */
    record UpdateMissionRequest(
            String name,
            String description,
            Boolean status,
            String startDate,
            String endDate
    ) {}


    @PutMapping("/api/missions/{missionId}/operators/{operatorId}/role")
    MissionOperatorDto updateOperatorRole(
            @PathVariable("missionId") UUID missionId,
            @PathVariable("operatorId") UUID operatorId,
            @RequestBody UpdateOperatorRoleRequest request
    );

    /**
     * Payload for the role‐update call.
     */
    record UpdateOperatorRoleRequest(String role) {}

    /**
     * Mirrors mission‐service’s response for a MissionOperator.
     */
    record MissionOperatorDto(
            UUID id,
            UUID missionId,
            UUID operatorId,
            String role,
            String assignedAt
    ) {}
}
