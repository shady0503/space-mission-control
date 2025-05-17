// src/main/java/com/telemetry/service/TelemetryService.java
package com.telemetry.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemetry.dto.*;
import com.telemetry.model.SatelliteReference;
import com.telemetry.model.TrajectoryData;
import com.telemetry.repository.SatelliteReferenceRepository;
import com.telemetry.repository.TrajectoryDataRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class TelemetryService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryService.class);
    private static final double EARTH_RADIUS_M = 6_378_137.0;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PredictionService predictionService;

    private final TrajectoryDataRepository trajectoryDataRepository;

    /** Now keyed by externalId (long) instead of UUID */
    private final Map<Long, double[]> previousVelocityECEF = new HashMap<>();
    private final SatelliteReferenceRepository satelliteReferenceRepository;

    public TelemetryService(PredictionService predictionService, TrajectoryDataRepository trajectoryDataRepository, SatelliteReferenceRepository satelliteReferenceRepository) {
        this.predictionService = predictionService;
        this.trajectoryDataRepository = trajectoryDataRepository;
        this.satelliteReferenceRepository = satelliteReferenceRepository;
    }

    public TelemetryResponse parseTelemetryResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        if (root.has("error")) {
            throw new Exception("API Error: " + root.get("error").asText());
        }

        TelemetryInfo info = objectMapper.treeToValue(root.get("info"), TelemetryInfo.class);

        JsonNode positionsNode = root.get("positions");
        if (positionsNode == null || !positionsNode.isArray() || positionsNode.size() < 2) {
            throw new Exception("Not enough positions in response");
        }

        List<TelemetryPosition> positions = new ArrayList<>();
        for (JsonNode n : positionsNode) {
            TelemetryPosition pos = objectMapper.treeToValue(n, TelemetryPosition.class);
            long unixSec = n.get("timestamp").asLong();
            pos.setTimestamp(new Timestamp(unixSec * 1000L));
            positions.add(pos);
        }

        return new TelemetryResponse(positions, info);
    }

    /**
     * Converts one TelemetryResponse into one or more TrajectoryData entities
     * keyed by the numeric externalId.
     */
    public List<TrajectoryData> toTrajectoryEntities(long externalId,
                                                     TelemetryResponse resp) {
        List<TelemetryPosition> pos = resp.getPositions();
        if (pos.size() < 2) {
            log.warn("Skipping telemetry for {}: only {} positions", externalId, pos.size());
            return Collections.emptyList();
        }

        TelemetryPosition p1 = pos.get(0);
        TelemetryPosition p2 = pos.get(1);

        // ECEF for the first point
        double[] e1 = toECEF(p1.getSatlatitude(),
                p1.getSatlongitude(),
                p1.getSataltitude() * 1000.0);

        // Δt
        long dtMs = p2.getTimestamp().getTime() - p1.getTimestamp().getTime();
        if (dtMs <= 0) {
            log.warn("Non-positive Δt for {}", externalId);
            return Collections.emptyList();
        }
        double dt = dtMs / 1_000.0;

        // ECEF for the second point
        double[] e2 = toECEF(p2.getSatlatitude(),
                p2.getSatlongitude(),
                p2.getSataltitude() * 1000.0);

        // Velocity vector
        double vx = (e2[0] - e1[0]) / dt;
        double vy = (e2[1] - e1[1]) / dt;
        double vz = (e2[2] - e1[2]) / dt;
        float vX = (float) vx, vY = (float) vy, vZ = (float) vz;
        float speed = (float) Math.sqrt(vx*vx + vy*vy + vz*vz);

        // Acceleration
        float accel = 0f;
        if (previousVelocityECEF.containsKey(externalId)) {
            double[] prev = previousVelocityECEF.get(externalId);
            double ax = (vx - prev[0]) / dt;
            double ay = (vy - prev[1]) / dt;
            double az = (vz - prev[2]) / dt;
            accel = (float) Math.sqrt(ax*ax + ay*ay + az*az);
        }
        previousVelocityECEF.put(externalId, new double[]{vx, vy, vz});

        // Orbit radius
        float orbitRadius = (float) Math.sqrt(e1[0]*e1[0]
                + e1[1]*e1[1]
                + e1[2]*e1[2]);

        // Build the embedded key
        TrajectoryDataKey key = new TrajectoryDataKey(externalId, p1.getTimestamp());

        // Build one TrajectoryData record
        TrajectoryData traj = new TrajectoryData(
                key,
                (float)e1[0], (float)e1[1], (float)e1[2],
                vX, vY, vZ, speed,
                accel, orbitRadius,
                p1.getSatlatitude(),
                p1.getSatlongitude(),
                p1.getSataltitude(),
                p1.getAzimuth(),
                p1.getElevation(),
                p1.getRightAscension(),
                p1.getDeclination()
        );

        return List.of(traj);
    }

    /** Delegate to PredictionService for short‐term extrapolation */
    public List<PredictiveOrbitPoint> predictOrbit(List<TelemetryPosition> positions,
                                                   int steps, int stepSeconds) {
        return predictionService.predictOrbit(positions, steps, stepSeconds);
    }

    /** Delegate to PredictionService for a full 360° orbit */
    public List<PredictiveOrbitPoint> predictFullOrbit(List<TelemetryPosition> positions,
                                                       int numPoints) {
        return predictionService.predictFullOrbit(positions, numPoints);
    }

    /** Simple lat/lon/alt → ECEF (meters) */
    private double[] toECEF(double latDeg, double lonDeg, double altM) {
        double φ = Math.toRadians(latDeg);
        double λ = Math.toRadians(lonDeg);
        double r = EARTH_RADIUS_M + altM;
        return new double[]{
                r * Math.cos(φ) * Math.cos(λ),
                r * Math.cos(φ) * Math.sin(λ),
                r * Math.sin(φ)
        };
    }

    public TelemetryDto toDto(TrajectoryData d) {
        return null;
    }

    public void upsertSpacecraftForTelemetry(UUID enterpriseId, Long externalId) {
    }

    @Transactional
    public void addReference(SatelliteReference ref) {
        // only insert the first time
        if (!satelliteReferenceRepository.existsByExternalId(ref.getExternalId())) {
            satelliteReferenceRepository.save(ref);
        }
        // otherwise: do nothing (or, if you really need to update enterpriseId/displayName, fetch and map)
    }

    public long countActiveTelemetry(UUID enterpriseId) {
        return satelliteReferenceRepository.countByEnterpriseId(enterpriseId);
    }

    @Transactional
    public double averageOrbit(UUID enterpriseId) {
        List<SatelliteReference> refs =
                satelliteReferenceRepository.findByEnterpriseId(enterpriseId);

        if (refs.isEmpty()) {
            return 0.0;
        }

        double sum = 0.0;
        int    count = 0;

        for (SatelliteReference ref : refs) {
            Long externalId = ref.getExternalId();
            TrajectoryData latest =
                    trajectoryDataRepository
                            .findTopByIdExternalIdOrderByIdTimestampDesc(externalId)
                            .orElse(null);

            if (latest != null) {
                sum   += latest.getOrbitRadius();
                count++;
            }
        }

        return count > 0
                ? sum / count
                : 0.0;
    }

    public TelemetrySummaryDTO getTelemetrySummary(UUID enterpriseId) {
        // 1. fetch all spacecraft references for this enterprise
        List<SatelliteReference> refs = satelliteReferenceRepository.findByEnterpriseId(enterpriseId);

        // prepare DTO and accumulators
        TelemetrySummaryDTO dto = new TelemetrySummaryDTO();
        List<TelemetrySummaryDTO.SpacecraftTelemetry> entries = new ArrayList<>();
        long totalDataPoints = 0;
        double sumVelocities = 0;
        int trackedCount    = 0;

        // 2. iterate each spacecraft
        for (SatelliteReference ref : refs) {
            long externalId = ref.getExternalId();
            TelemetrySummaryDTO.SpacecraftTelemetry entry = new TelemetrySummaryDTO.SpacecraftTelemetry();
            entry.setExternalId(externalId);
            entry.setSpacecraftName(null); // set if you have a name

            // fetch latest trajectory data
            Optional<TrajectoryData> latestOpt =
                    trajectoryDataRepository.findTopByIdExternalIdOrderByIdTimestampDesc(externalId);

            if (latestOpt.isPresent()) {
                TrajectoryData latest = latestOpt.get();

                // position vector
                entry.setCurrentPosition(Map.of(
                        "x", latest.getPositionX(),
                        "y", latest.getPositionY(),
                        "z", latest.getPositionZ()
                ));

                // velocity & orbit
                float vel = latest.getVelocity();
                entry.setCurrentVelocity(vel);
                entry.setCurrentOrbitRadius(latest.getOrbitRadius());

                // timestamp
                entry.setTimestamp(latest.getTimestamp().toString());

                // data points in last 24h
                Timestamp since = Timestamp.from(Instant.now().minus(1, ChronoUnit.DAYS));
                long dp24h = trajectoryDataRepository
                        .countByIdTimestampAfterAndIdExternalId(since, externalId);
                entry.setDataPointsLast24h(dp24h);
                entry.setCurrentlyTracked(true);

                // accumulate for system metrics
                totalDataPoints += dp24h;
                sumVelocities   += vel;
                trackedCount++;
            } else {
                // defaults if no data
                entry.setCurrentPosition(Map.of());
                entry.setCurrentVelocity(0f);
                entry.setCurrentOrbitRadius(0f);
                entry.setTimestamp(null);
                entry.setDataPointsLast24h(0L);
                entry.setCurrentlyTracked(false);
            }

            entries.add(entry);
        }

        // 3. assign per-spacecraft list
        dto.setSpacecrafts(entries);

        // 4. compute overall system metrics
        TelemetrySummaryDTO.SystemMetrics system = new TelemetrySummaryDTO.SystemMetrics();
        system.setTotalDataPointsLast24h(totalDataPoints);
        system.setAverageSystemVelocity(
                trackedCount > 0
                        ? sumVelocities / trackedCount
                        : 0.0
        );
        system.setSpacecraftWithTelemetryCount(trackedCount);
        dto.setSystem(system);

        return dto;
    }

    public List<SatelliteReference> getRefs(UUID enterpriseId) {
        return satelliteReferenceRepository.findByEnterpriseId(enterpriseId);
    }
}
