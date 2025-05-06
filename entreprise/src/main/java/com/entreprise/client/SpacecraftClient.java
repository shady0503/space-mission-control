// src/main/java/com/entreprise/client/OperatorClient.java
package com.entreprise.client;
import com.entreprise.dto.SpacecraftDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(
        name = "spacecraft-service",
        url  = "${spring.cloud.openfeign.clients.spacecraft-service.url}"      // pulls from application.yml
)public interface SpacecraftClient {

    /**
     * List all spacecraft belonging to a given enterprise.
     *
     * @param enterpriseId UUID of the enterprise
     * @return list of SpacecraftDto
     */
    @GetMapping("/api/spacecraft/enterprise/{enterpriseId}")
    List<SpacecraftDto> getByEnterprise(@PathVariable("enterpriseId") UUID enterpriseId);
}
