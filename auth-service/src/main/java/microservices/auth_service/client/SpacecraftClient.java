package microservices.auth_service.client;

import microservices.auth_service.config.FeignAuthInterceptor;
import microservices.auth_service.dto.SpacecraftCreateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "spacecraft-service",
        url = "${spacecraft.service.url}",
        configuration = FeignAuthInterceptor.class,
        fallbackFactory = MissionClientFallbackFactory.class
)
public interface SpacecraftClient {


    @PostMapping("/api/spacecraft")
    ResponseEntity<?> create(@RequestBody SpacecraftCreateRequest request);}
