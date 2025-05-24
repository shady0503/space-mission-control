// src/main/java/com/telemetry/service/TelemetryVisualizationService.java
package com.telemetry.service;

import com.telemetry.dto.PredictiveOrbitPoint;
import com.telemetry.dto.TelemetryPosition;
import com.telemetry.model.SatelliteReference;
import com.telemetry.model.TrajectoryData;
import com.telemetry.repository.SatelliteReferenceRepository;
import com.telemetry.repository.TrajectoryDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.temporal.Temporal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TelemetryVisualizationService {

    private static final Logger logger = LoggerFactory.getLogger(TelemetryVisualizationService.class);

    private final TrajectoryDataRepository trajectoryRepo;
    private final PredictionService        predictionService;
    private final SatelliteReferenceRepository satRefRepo;

    public TelemetryVisualizationService(
            TrajectoryDataRepository trajectoryRepo,
            PredictionService predictionService,
            SatelliteReferenceRepository satRefRepo
    ) {
        this.trajectoryRepo     = trajectoryRepo;
        this.predictionService  = predictionService;
        this.satRefRepo         = satRefRepo;
    }

    /**
     * Latest telemetry point for a given externalId.
     */
    public Map<String, Object> getLatestTelemetryPoint(long externalId) {
        return trajectoryRepo
                .findFirstByIdExternalIdOrderByIdTimestampDesc(externalId)
                .map(this::formatLatest)
                .orElse(null);
    }

    private Map<String, Object> formatLatest(TrajectoryData d) {
        Map<String, Object> out = new HashMap<>();
        out.put("timestamp",    d.getTimestamp());
        out.put("orbitRadius",  d.getOrbitRadius());
        out.put("acceleration", d.getAcceleration());

        out.put("position", Map.of(
                "x", d.getPositionX(),
                "y", d.getPositionY(),
                "z", d.getPositionZ()
        ));

        out.put("velocity", Map.of(
                "x",     d.getVelocityX(),
                "y",     d.getVelocityY(),
                "z",     d.getVelocityZ(),
                "total", d.getVelocity()
        ));

        out.put("location", Map.of(
                "latitude",  d.getSatLatitude(),
                "longitude", d.getSatLongitude(),
                "altitude",  d.getSatAltitude()
        ));

        out.put("attitude", Map.of(
                "azimuth",        d.getAzimuth(),
                "elevation",      d.getElevation(),
                "rightAscension", d.getRightAscension(),
                "declination",    d.getDeclination()
        ));

        return out;
    }

    /**
     * Time-series of one parameter over [start…end], default last 24h.
     */
    public List<Map<String, Object>> getParameterTimeSeries(
            long externalId, String parameter, Instant start, Instant end
    ) {
        Instant defaultEnd   = end != null ? end : Instant.now();
        Instant defaultStart = start != null ? start : defaultEnd.minus(24, ChronoUnit.HOURS);

        Timestamp from = Timestamp.from(defaultStart);
        Timestamp to   = Timestamp.from(defaultEnd);

        return trajectoryRepo
                .findByExternalIdAndTimeRange(externalId, from, to)
                .stream()
                .map(d -> Map.<String, Object>of(
                        "timestamp", d.getTimestamp(),
                        "value",     extractParam(d, parameter)
                ))
                .collect(Collectors.toList());
    }


    private double extractParam(TrajectoryData d, String p) {
        return switch(p) {
            case "velocity"     -> d.getVelocity();
            case "velocityX"    -> d.getVelocityX();
            case "velocityY"    -> d.getVelocityY();
            case "velocityZ"    -> d.getVelocityZ();
            case "acceleration" -> d.getAcceleration();
            case "altitude"     -> d.getSatAltitude() != null ? d.getSatAltitude() : 0.0;
            case "latitude"     -> d.getSatLatitude() != null ? d.getSatLatitude() : 0.0;
            case "longitude"    -> d.getSatLongitude() != null ? d.getSatLongitude() : 0.0;
            case "azimuth"      -> d.getAzimuth() != null ? d.getAzimuth() : 0.0;
            case "elevation"    -> d.getElevation() != null ? d.getElevation() : 0.0;
            default             -> 0.0;
        };
    }

    /**
     * Multi-parameter time-series.
     */
    public Map<String, List<Map<String, Object>>> getMultiParameterTimeSeries(
            long externalId,
            List<String> parameters,
            Instant start,
            Instant end
    ) {
        return parameters.stream()
                .collect(Collectors.toMap(
                        p -> p,
                        p -> getParameterTimeSeries(externalId, p, start, end)
                ));
    }


    /**
     * Raw trajectory points for 3D viz (with optional down-sampling).
     */
    public List<Map<String, Object>> getTrajectoryVisualizationData(
            long externalId,
            Instant start,
            Instant end,
            Integer maxPoints
    ) {
        Instant defaultEnd   = end != null ? end : Instant.now();
        Instant defaultStart = start != null ? start : defaultEnd.minus(24, ChronoUnit.HOURS);

        Timestamp from = Timestamp.from(defaultStart);
        Timestamp to   = Timestamp.from(defaultEnd);

        List<TrajectoryData> data = trajectoryRepo
                .findByExternalIdAndTimeRange(externalId, from, to);

        if (maxPoints != null && data.size() > maxPoints) {
            data = downsample(data, maxPoints);
        }

        return data.stream()
                .map(d -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("timestamp", d.getTimestamp());
                    m.put("position",  new double[]{d.getPositionX(), d.getPositionY(), d.getPositionZ()});
                    if (d.getSatLatitude() != null) {
                        m.put("geo", new double[]{d.getSatLatitude(), d.getSatLongitude(), d.getSatAltitude()});
                    }
                    m.put("velocity", d.getVelocity());
                    return m;
                })
                .collect(Collectors.toList());
    }


    /**
     * Combine recent trajectory + predictions.
     */
    public Map<String, Object> getTrajectoryWithPrediction(
            long externalId,
            Integer predictionPoints
    ) {
        Instant now   = Instant.now();
        Instant since = now.minus(3, ChronoUnit.HOURS);

        Timestamp from = Timestamp.from(since);
        Timestamp to   = Timestamp.from(now);

        List<TrajectoryData> recent = trajectoryRepo
                .findByExternalIdAndTimeRange(externalId, from, to);

        List<Map<String, Object>> actual = recent.stream()
                .map(d -> Map.<String, Object>of(
                        "timestamp", d.getTimestamp(),
                        "position",  new double[]{d.getPositionX(), d.getPositionY(), d.getPositionZ()},
                        "geo",       new double[]{d.getSatLatitude(), d.getSatLongitude(), d.getSatAltitude()}
                ))
                .collect(Collectors.toList());

        List<TelemetryPosition> posList = recent.stream()
                .map(d -> new TelemetryPosition(
                        d.getSatLatitude(),
                        d.getSatLongitude(),
                        d.getSatAltitude(),
                        d.getTimestamp()
                ))
                .collect(Collectors.toList());

        // Get satellite reference to retrieve enterpriseId for command integration
        Optional<SatelliteReference> satRef = satRefRepo.findByExternalId(externalId);
        UUID enterpriseId = satRef.map(SatelliteReference::getEnterpriseId).orElse(null);

        int nPred = (predictionPoints != null ? predictionPoints : 120);
        List<PredictiveOrbitPoint> shortPred = predictionService.predictOrbit(posList, 60, 60, externalId, enterpriseId);
        List<PredictiveOrbitPoint> fullPred  = predictionService.predictFullOrbit(posList, nPred, externalId, enterpriseId);

        List<Map<String, Object>> shortData = shortPred.stream()
                .map(this::formatPred)
                .collect(Collectors.toList());

        List<Map<String, Object>> fullData = fullPred.stream()
                .map(this::formatPred)
                .collect(Collectors.toList());

        return Map.of(
                "actual",              actual,
                "shortTermPrediction", shortData,
                "fullOrbitPrediction", fullData
        );
    }


    private Map<String, Object> formatPred(PredictiveOrbitPoint p) {
        return Map.<String, Object>of(
                "timestamp",   p.getTimestamp(),
                "latitude",    p.getLatitude(),
                "longitude",   p.getLongitude(),
                "altitude",    p.getAltitude(),
                "isFullOrbit", p.isFullOrbit()
        );
    }

    /**
     * Full statistics for a given externalId.
     */
    public Map<String, Object> getSpacecraftStatistics(long externalId) {
        List<TrajectoryData> all = trajectoryRepo
                .findByIdExternalIdOrderByIdTimestampAsc(externalId);

        if (all.isEmpty()) {
            return Collections.emptyMap();
        }

        TrajectoryData first = all.get(0);
        TrajectoryData last  = all.get(all.size() - 1);

        Map<String, Object> stats = new HashMap<>();
        // compute duration via Instant (or via getTime())
        double durationHours = (last.getTimestamp().toInstant().toEpochMilli()
                - first.getTimestamp().toInstant().toEpochMilli())
                / 3_600_000.0;

        stats.put("timeRange", Map.of(
                "first",         first.getTimestamp(),
                "last",          last.getTimestamp(),
                "durationHours", durationHours
        ));
        stats.put("dataPoints", all.size());

        var velStats = all.stream().mapToDouble(TrajectoryData::getVelocity).summaryStatistics();
        var accStats = all.stream().mapToDouble(TrajectoryData::getAcceleration).summaryStatistics();
        var altStats = all.stream()
                .filter(d -> d.getSatAltitude() != null)
                .mapToDouble(TrajectoryData::getSatAltitude)
                .summaryStatistics();

        stats.put("velocity", Map.of(
                "min", velStats.getMin(),
                "max", velStats.getMax(),
                "avg", velStats.getAverage()
        ));
        stats.put("acceleration", Map.of(
                "min", accStats.getMin(),
                "max", accStats.getMax(),
                "avg", accStats.getAverage()
        ));
        if (altStats.getCount() > 0) {
            stats.put("altitude", Map.of(
                    "min", altStats.getMin(),
                    "max", altStats.getMax(),
                    "avg", altStats.getAverage()
            ));
        }

        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
        var recent = all.stream()
                .filter(d -> d.getTimestamp().toInstant().isAfter(cutoff))
                .collect(Collectors.toList());

        if (!recent.isEmpty()) {
            var rv = recent.stream().mapToDouble(TrajectoryData::getVelocity).summaryStatistics();
            stats.put("last24h", Map.of(
                    "points",      recent.size(),
                    "avgVelocity", rv.getAverage()
            ));
        }

        return stats;
    }

    /**
     * Keep first & last, plus evenly-spaced picks.
     */
    private List<TrajectoryData> downsample(List<TrajectoryData> list, int max) {
        if (list.size() <= max) {
            return list;
        }
        List<TrajectoryData> out = new ArrayList<>(max);
        double step = (double)(list.size() - 1) / (max - 1);
        for (int i = 0; i < max; i++) {
            out.add(list.get((int)Math.round(i * step)));
        }
        return out;
    }

}