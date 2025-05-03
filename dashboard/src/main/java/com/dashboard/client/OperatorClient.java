package com.dashboard.client;


import com.dashboard.config.FeignClientConfig;
import com.dashboard.dto.OperatorDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(
        name = "operator-service",
        url = "${OPERATOR_SERVICE_URL}",
        configuration = FeignClientConfig.class
)public interface OperatorClient {




    @GetMapping("/api/operator/{id}")
    OperatorDTO getOperator(@PathVariable("id") UUID id);
}
