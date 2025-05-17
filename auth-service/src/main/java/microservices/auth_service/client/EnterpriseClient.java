package microservices.auth_service.client;


import microservices.auth_service.config.FeignAuthInterceptor;
import microservices.auth_service.dto.EnterpriseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.Instant;
import java.util.UUID;

@FeignClient(
        name = "enterprise-service",
        url = "${enterprise.service.url}",
        configuration = FeignAuthInterceptor.class,
        fallbackFactory = MissionClientFallbackFactory.class
)
public interface EnterpriseClient {

    @PostMapping("/api/enterprise")
     EnterpriseDTO createEnterprise(@RequestBody EnterpriseDTO enterpriseDTO);
}




/**
 * Data Transfer Object for the Enterprise entity.
 */
