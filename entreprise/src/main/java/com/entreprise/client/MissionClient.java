package com.entreprise.client;

import com.entreprise.dto.MissionDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID; /**
 * Feign client for Mission-Service to fetch missions by enterprise.
 */
@FeignClient(
        name = "mission-service",
        url  = "${spring.cloud.openfeign.clients.mission-service.url}"      // pulls from application.yml
)public interface MissionClient {

    /**
     * List all missions belonging to a given enterprise.
     *
     * @param enterpriseId UUID of the enterprise
     * @return list of MissionDto
     */
    @GetMapping("/api/missions/enterprise/{enterpriseId}")
    List<MissionDto> getByEnterprise(@PathVariable("enterpriseId") UUID enterpriseId);
}
