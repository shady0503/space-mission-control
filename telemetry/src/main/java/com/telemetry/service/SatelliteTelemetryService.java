package com.telemetry.service;

import com.telemetry.dto.TelemetryDto;
import com.telemetry.dto.TelemetryPosition;
import com.telemetry.dto.TelemetryResponse;
import com.telemetry.model.TrajectoryData;
import com.telemetry.model.SatelliteReference;
import com.telemetry.repository.SatelliteReferenceRepository;
import com.telemetry.repository.TrajectoryDataRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.stream.Collectors;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SatelliteTelemetryService {

    private final SatelliteReferenceRepository referenceRepo;
    private final TrajectoryDataRepository     trajectoryRepo;
    private final TelemetryService             telemetryService;
    private final RestTemplate                 restTemplate = new RestTemplate();
    private final ExecutorService              executor     = Executors.newFixedThreadPool(10);

    @Value("${n2yo.api.base-url}")
    private String apiBaseUrl;

    @Value("${n2yo.api.key}")
    private String apiKey;

    public SatelliteTelemetryService(
            SatelliteReferenceRepository referenceRepo,
            TrajectoryDataRepository      trajectoryRepo,
            TelemetryService              telemetryService
    ) {
        this.referenceRepo    = referenceRepo;
        this.trajectoryRepo   = trajectoryRepo;
        this.telemetryService = telemetryService;
    }

    /**
     * Poll every ${telemetry.poll.rate:60000}ms:
     * for each SatelliteReference.externalId → fetch & persist.
     */
    @Scheduled(fixedRateString = "${telemetry.poll.rate:60000}")
    public void fetchAllSatelliteTelemetry() {
        List<CompletableFuture<Void>> jobs = referenceRepo.findAll()
                .stream()
                .map(ref -> CompletableFuture.runAsync(() -> {
                    try {
                        TelemetryResponse resp = fetchTelemetry(ref.getExternalId());
                        saveTrajectory(ref.getExternalId(), resp);
                    } catch (Exception e) {
                        // TODO: replace with your logger
                        System.err.println("Telemetry error for " + ref.getExternalId() + ": " + e);
                    }
                }, executor))
                .collect(Collectors.toList());

        CompletableFuture.allOf(jobs.toArray(new CompletableFuture[0])).join();
    }

    /**
     * Get recent positions for a spacecraft to use in predictions
     */
    /**
     * Get recent positions for a spacecraft to use in predictions
     */
    public List<TelemetryPosition> getRecentPositionsForSpacecraft(Long externalId, int count) {
        // Create a Pageable object to limit the number of results

        Pageable pageable = PageRequest.of(0, count);

        // Get the most recent trajectory data points
        // The repository returns them in descending order by timestamp
        List<TrajectoryData> recentData = trajectoryRepo
                .findByIdExternalIdOrderByIdTimestampDesc(externalId, pageable);

        // Reverse the list so it's in ascending timestamp order for prediction calculations
        Collections.reverse(recentData);

        // Convert to TelemetryPosition objects
        return recentData.stream()
                .map(td -> new TelemetryPosition(
                        td.getSatLatitude(),
                        td.getSatLongitude(),
                        td.getSatAltitude(),
                        td.getTimestamp()
                ))
                .collect(Collectors.toList());
    }

    private TelemetryResponse fetchTelemetry(long externalId) throws Exception {
        double obsLat   = 41.702;
        double obsLng   = -76.014;
        double obsAltKm = 0.0;
        int    duration = 2;

        // now insert the missing /satellite/positions
        String url = String.format(
                "%s/satellite/positions/%d/%.6f/%.6f/%.1f/%d?apiKey=%s",
                apiBaseUrl,
                externalId,
                obsLat,
                obsLng,
                obsAltKm,
                duration,
                apiKey
        );

        String json = restTemplate.getForObject(url, String.class);
        return telemetryService.parseTelemetryResponse(json);
    }



    /**
     * Save the batch of TrajectoryData built by your TelemetryService helper.
     */
    private void saveTrajectory(long externalId, TelemetryResponse resp) {
        List<TrajectoryData> batch = telemetryService.toTrajectoryEntities(externalId, resp);
        trajectoryRepo.saveAll(batch);
    }

    /**
     * Get the very latest point for every reference in your DB.
     */
    public List<TelemetryDto> getLatestForAll() {
        return referenceRepo.findAll()
                .stream()
                .map(ref ->
                        trajectoryRepo
                                .findFirstByIdExternalIdOrderByIdTimestampDesc(ref.getExternalId())
                                .map(telemetryService::toDto)
                                .orElse(null)
                )
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public Map<Long, TrajectoryData> getLatestForEnterprise(UUID enterpriseId) {
        return referenceRepo.findByEnterpriseId(enterpriseId).stream()
                .flatMap(ref ->
                        trajectoryRepo
                                .findFirstByIdExternalIdOrderByIdTimestampDesc(ref.getExternalId()).stream().map(dto -> new AbstractMap.SimpleEntry<>(ref.getExternalId(), dto))
                )
                .collect(Collectors.toMap(
                        AbstractMap.SimpleEntry::getKey,
                        AbstractMap.SimpleEntry::getValue
                ));

    }




}
