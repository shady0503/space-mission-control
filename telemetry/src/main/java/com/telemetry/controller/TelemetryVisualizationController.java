// src/main/java/com/telemetry/controller/TelemetryVisualizationController.java
package com.telemetry.controller;

import com.telemetry.service.TelemetryVisualizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/visualization")
public class TelemetryVisualizationController {

    @Autowired
    private TelemetryVisualizationService visualizationService;



    /**
     * Get the latest telemetry point for an externalId.
     */
    @GetMapping("/{externalId}/latest")
    public ResponseEntity<Map<String, Object>> getLatestTelemetry(
            @PathVariable long externalId
    ) {
        Map<String, Object> latest = visualizationService.getLatestTelemetryPoint(externalId);
        if (latest == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(latest);
    }

    /**
     * Single-parameter time series (default last 24h).
     */
    @GetMapping("/{externalId}/timeseries")
    public ResponseEntity<List<Map<String, Object>>> getParameterTimeSeries(
            @PathVariable long externalId,
            @RequestParam String parameter,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date startTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date endTime
    ) {
        Instant start = startTime  != null ? startTime.toInstant()  : null;
        Instant end   = endTime    != null ? endTime.toInstant()    : null;

        List<Map<String, Object>> ts =
                visualizationService.getParameterTimeSeries(externalId, parameter, start, end);

        return ResponseEntity.ok(ts);
    }

    /**
     * Multi-parameter time series.
     */
    @GetMapping("/{externalId}/multi-timeseries")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getMultiParameterTimeSeries(
            @PathVariable long externalId,
            @RequestParam List<String> parameters,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date startTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date endTime
    ) {
        Instant start = startTime  != null ? startTime.toInstant()  : null;
        Instant end   = endTime    != null ? endTime.toInstant()    : null;

        var result = visualizationService.getMultiParameterTimeSeries(
                externalId, parameters, start, end);

        return ResponseEntity.ok(result);
    }

    /**
     * Raw trajectory for 3D viz (with optional downsampling).
     */
    @GetMapping("/{externalId}/trajectory")
    public ResponseEntity<List<Map<String, Object>>> getTrajectoryData(
            @PathVariable long externalId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date startTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date endTime,
            @RequestParam(required = false) Integer maxPoints
    ) {
        Instant start = startTime  != null ? startTime.toInstant()  : null;
        Instant end   = endTime    != null ? endTime.toInstant()    : null;

        var data = visualizationService.getTrajectoryVisualizationData(
                externalId, start, end, maxPoints);

        return ResponseEntity.ok(data);
    }

    /**
     * Combined actual + prediction.
     */
    @GetMapping("/{externalId}/trajectory-with-prediction")
    public ResponseEntity<Map<String, Object>> getTrajectoryWithPrediction(
            @PathVariable long externalId,
            @RequestParam(required = false) Integer predictionPoints
    ) {
        var result = visualizationService.getTrajectoryWithPrediction(
                externalId, predictionPoints);

        return ResponseEntity.ok(result);
    }

    /**
     * Spacecraft statistics.
     */
    @GetMapping("/{externalId}/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(
            @PathVariable long externalId
    ) {
        var stats = visualizationService.getSpacecraftStatistics(externalId);
        return ResponseEntity.ok(stats);
    }
}
