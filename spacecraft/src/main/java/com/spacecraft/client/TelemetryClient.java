// src/main/java/com/spacecraft/client/TelemetryClient.java
package com.spacecraft.client;

import com.spacecraft.config.FeignConfig;
import com.spacecraft.dto.SpacecraftSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@FeignClient(
        name = "telemetry-client",
        url = "${telemetry.client.url}",
        configuration = FeignConfig.class
)
public interface TelemetryClient {

    /**
     * POST /api/telemetry/references
     * Returns 201 Created or 204 No Content
     */
    @PostMapping("/references")
    ResponseEntity<Void> addReference(@RequestBody SpacecraftSummary summary);
}
