package com.entreprise.client;

import java.util.List;
import java.util.UUID;

import com.entreprise.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.entreprise.dto.OperatorDto;
 /**
 * Feign client for Operator-Service to fetch operators by enterprise.
 */
@FeignClient(
        name = "operator-service",
        url  = "${spring.cloud.openfeign.clients.auth-service.url}",
        configuration = FeignConfig.class
// pulls from application.yml
)public interface OperatorClient {

    /**
     * List all operators belonging to a given enterprise.
     *
     * @param enterpriseId UUID of the enterprise
     * @return list of OperatorDto
     */
    @GetMapping("/api/operator/enterprise/{enterpriseId}")
    List<OperatorDto> getByEnterprise(@PathVariable("enterpriseId") UUID enterpriseId);
}
