package com.dashboard.client;

import com.dashboard.config.FeignClientConfig;
import com.dashboard.dto.TelemetryCountRequest;
import com.dashboard.dto.TelemetrySummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(
        name = "telemetry-service",
        url = "${TELEMETRY_SERVICE_URL}",
        configuration = FeignClientConfig.class
)
public interface TelemetryClient {
    @PostMapping("/api/telemetry/active/count")
    long countActiveSpacecraft(@RequestParam UUID enterpriseId);

    @GetMapping("/api/telemetry/summary")
    TelemetrySummaryDTO getTelemetrySummary(
            @RequestParam(value = "enterpriseId") UUID  enterpriseId
    );

    @GetMapping("/api/telemetry/AverageOrbit")
    double getAverageOrbitRadius(@RequestParam UUID enterpriseId);
}
