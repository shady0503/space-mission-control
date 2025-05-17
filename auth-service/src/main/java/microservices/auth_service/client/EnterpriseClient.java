package microservices.auth_service.client;


import microservices.auth_service.config.FeignAuthInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(
        name = "mission-service",
        url = "${mission.service.url}",
        configuration = FeignAuthInterceptor.class,
        fallbackFactory = MissionClientFallbackFactory.class
)
public interface EnterpriseClient {

    @PostMapping("/api/enterprise")
    private enterprise
}



class enterprise {
    
}