// src/main/java/com/telemetry/kafka/TelemetryKafkaProducer.java
package com.telemetry.kafka;

import com.telemetry.config.KafkaConfig;
import com.telemetry.model.SatelliteReference;
import com.telemetry.dto.PredictiveOrbitPoint;
import com.telemetry.dto.TelemetryPosition;
import com.telemetry.model.TrajectoryData;
import com.telemetry.repository.SatelliteReferenceRepository;
import com.telemetry.service.PredictionService;
import com.telemetry.service.SatelliteTelemetryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class TelemetryKafkaProducer {

    private static final Logger log = LoggerFactory.getLogger(TelemetryKafkaProducer.class);
    private final ExecutorService predictionsExecutor = Executors.newFixedThreadPool(4);

    @Autowired private KafkaTemplate<String, Object> kafkaTemplate;
    @Autowired private SatelliteTelemetryService satelliteTelemetryService;
    @Autowired private SatelliteReferenceRepository referenceRepo;
    @Autowired private PredictionService predictionService;

    /** Every 5 seconds: publish telemetry for each operator (previously enterprise) */
    @Scheduled(fixedRate = 5000)
    public void publishTelemetryForAllOperators() {
        List<UUID> operatorIds = referenceRepo.findAll().stream()
                .map(SatelliteReference::getEnterpriseId)
                .distinct()
                .collect(Collectors.toList());

        log.debug("Publishing telemetry for {} operators", operatorIds.size());
        operatorIds.forEach(this::publishTelemetryForOperator);
    }

    /**
     * Publish telemetry data for a specific operator (previously enterprise).
     */
    public void publishTelemetryForOperator(UUID operatorId) {
        try {
            // Get latest telemetry data for all spacecraft belonging to this operator
            Map<Long, TrajectoryData> telemetryMap =
                    satelliteTelemetryService.getLatestForEnterprise(operatorId);

            if (telemetryMap.isEmpty()) {
                log.debug("No telemetry data for operator {}", operatorId);
                return;
            }

            // Create the new message structure
            Map<String, Object> message = new HashMap<>();
            message.put("operatorId", operatorId.toString());

            // Create telemetry object with nested structure for each spacecraft
            Map<String, Object> telemetryData = new HashMap<>();

            // Process each spacecraft's data with predictions in parallel
            List<CompletableFuture<Void>> futures = new ArrayList<>();

            for (Map.Entry<Long, TrajectoryData> entry : telemetryMap.entrySet()) {
                Long spacecraftId = entry.getKey();
                TrajectoryData trajectoryData = entry.getValue();

                futures.add(CompletableFuture.runAsync(() -> {
                    try {
                        // Convert trajectory data to the format needed for predictions
                        List<TelemetryPosition> positions = getRecentPositions(spacecraftId);

                        // Generate predictions only if we have enough data
                        if (positions.size() >= 2) {
                            Map<String, Object> spacecraftData = new HashMap<>();

                            // Add telemetry data
                            spacecraftData.put("telemetry", formatTrajectoryData(trajectoryData));

                            // Generate and add short-term predictions (60 steps, 60 seconds each)
                            // Pass the enterpriseId to enable command integration
                            List<PredictiveOrbitPoint> shortPredictions =
                                    predictionService.predictOrbit(positions, 60, 60, spacecraftId, operatorId);
                            spacecraftData.put("shortPredictions", formatPredictions(shortPredictions));

                            // Generate and add full orbit predictions (120 points)
                            // Pass the enterpriseId to enable command integration
                            List<PredictiveOrbitPoint> fullOrbitPredictions =
                                    predictionService.predictFullOrbit(positions, 120, spacecraftId, operatorId);
                            spacecraftData.put("fullOrbitPredictions", formatPredictions(fullOrbitPredictions));

                            // Add spacecraft data to telemetry map (synchronized to avoid concurrent modification)
                            synchronized (telemetryData) {
                                telemetryData.put(spacecraftId.toString(), spacecraftData);
                            }
                        }
                    } catch (Exception e) {
                        log.error("Error generating predictions for spacecraft {}: {}",
                                spacecraftId, e.getMessage(), e);
                    }
                }, predictionsExecutor));
            }

            // Wait for all prediction computations to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // Add telemetry data to message
            message.put("telemetry", telemetryData);

            // Send message to Kafka
            kafkaTemplate.send(
                    KafkaConfig.TOPIC_TELEMETRY,
                    operatorId.toString(),
                    message
            ).whenComplete((meta, ex) -> {
                if (ex != null) {
                    log.error("Failed to send telemetry for operator {}: {}",
                            operatorId, ex.getMessage(), ex);
                } else {
                    log.debug("Published telemetry for operator {} to partition {}",
                            operatorId, meta.getRecordMetadata().partition());
                }
            });

        } catch (Exception e) {
            log.error("Error publishing telemetry for operator {}: {}", operatorId, e.getMessage(), e);
        }
    }

    /**
     * Retrieve recent positions for a spacecraft to use in predictions
     */
    private List<TelemetryPosition> getRecentPositions(Long spacecraftId) {
        // This would typically come from your repository
        // For simplicity, we'll use a minimal implementation
        return satelliteTelemetryService.getRecentPositionsForSpacecraft(spacecraftId, 5);
    }

    /**
     * Format trajectory data for the telemetry message
     */
    private Map<String, Object> formatTrajectoryData(TrajectoryData data) {
        Map<String, Object> formatted = new HashMap<>();
        formatted.put("timestamp", data.getTimestamp());

        // Position data
        Map<String, Object> position = new HashMap<>();
        position.put("x", data.getPositionX());
        position.put("y", data.getPositionY());
        position.put("z", data.getPositionZ());
        formatted.put("position", position);

        // Velocity data
        Map<String, Object> velocity = new HashMap<>();
        velocity.put("x", data.getVelocityX());
        velocity.put("y", data.getVelocityY());
        velocity.put("z", data.getVelocityZ());
        velocity.put("magnitude", data.getVelocity());
        formatted.put("velocity", velocity);

        // Other metrics
        formatted.put("acceleration", data.getAcceleration());
        formatted.put("orbitRadius", data.getOrbitRadius());

        // Geo data if available
        if (data.getSatLatitude() != null) {
            Map<String, Object> geo = new HashMap<>();
            geo.put("latitude", data.getSatLatitude());
            geo.put("longitude", data.getSatLongitude());
            geo.put("altitude", data.getSatAltitude());
            formatted.put("geo", geo);
        }

        return formatted;
    }

    /**
     * Format prediction points for the telemetry message
     */
    private List<Map<String, Object>> formatPredictions(List<PredictiveOrbitPoint> predictions) {
        return predictions.stream().map(p -> {
            Map<String, Object> point = new HashMap<>();
            point.put("timestamp", p.getTimestamp());
            point.put("latitude", p.getLatitude());
            point.put("longitude", p.getLongitude());
            point.put("altitude", p.getAltitude());
            point.put("isFullOrbit", p.isFullOrbit());
            return point;
        }).collect(Collectors.toList());
    }
}