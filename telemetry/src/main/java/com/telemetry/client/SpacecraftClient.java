package com.telemetry.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "spacecraft-service", url = "${spacecraft.url}")
public interface SpacecraftClient {
    @GetMapping("/api/spacecraft/summary")
    List<SpacecraftSummary> findAllSummary();

    class SpacecraftSummary {
        private UUID id;
        private Long externalId;
        private UUID enterpriseId;
        private String spacecraftName;
        public SpacecraftSummary() { }

        public SpacecraftSummary(UUID id, Long externalId, UUID enterpriseId, String spacecraftName) {
            this.id = id;
            this.externalId = externalId;
            this.enterpriseId = enterpriseId;
            this.spacecraftName = spacecraftName;
        }

        public String getSpacecraftName() {
            return spacecraftName;
        }

        public void setSpacecraftName(String spacecraftName) {
            this.spacecraftName = spacecraftName;
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public Long getExternalId() {
            return externalId;
        }

        public void setExternalId(Long externalId) {
            this.externalId = externalId;
        }

        public UUID getEnterpriseId() {
            return enterpriseId;
        }

        public void setEnterpriseId(UUID enterpriseId) {
            this.enterpriseId = enterpriseId;
        }
    }
}