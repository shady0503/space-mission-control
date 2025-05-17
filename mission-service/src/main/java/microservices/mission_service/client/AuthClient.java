// src/main/java/microservices/mission_service/client/AuthClient.java
package microservices.mission_service.client;

import microservices.mission_service.config.FeignConfig;
import microservices.mission_service.dto.MissionOperatorDto;
import microservices.mission_service.dto.OperatorDto;
import microservices.mission_service.dto.OperatorRoleUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(name = "auth-service", url = "${auth-service.url}", configuration = FeignConfig.class
)
public interface AuthClient {

    /** Assign a new operator to a mission (or re-assign if already present) */
    /** Change an existing operator’s role on a mission */
    @PutMapping("/api/operator/update-role")
    MissionOperatorDto updateOperatorRole(@RequestBody OperatorRoleUpdateRequest req);

    /** Remove an operator from a mission */
    @DeleteMapping("/api/operator/remove/{missionId}/{operatorId}")
    void removeOperatorFromMission(
            @PathVariable UUID missionId,
            @PathVariable UUID operatorId
    );
    /** Fetch an operator’s details */
    @GetMapping("/api/operator/{id}")
    OperatorDto getOperator(@PathVariable UUID id);
}
