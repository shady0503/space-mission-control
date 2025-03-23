package com.backend.telemetry.service;

import com.backend.spacecraft.model.Spacecraft;
import com.backend.spacecraft.model.SpacecraftType;
import com.backend.spacecraft.repository.SpacecraftRepository;
import com.backend.telemetry.model.*;
import com.backend.telemetry.repository.TrajectoryDataRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;

@Service
public class TelemetryService {

    // Hard-coded or from config
    private static final String SATELLITE_ID = "25544";
    private static final float OBSERVER_LAT = 41.702f;     // degrees
    private static final float OBSERVER_LNG = -76.014f;    // degrees
    private static final float OBSERVER_ALT = 0f;          // in kilometers
    private static final int SECONDS = 2;                  // # positions
    private static final String BASE_API_URL = "https://api.n2yo.com/rest/v1/satellite/positions";

    // Approx Earth radius for simple spherical Earth (in meters)
    private static final double EARTH_RADIUS_M = 6378137.0;

    @Value("${n2yo.api.key}")
    private String n2yoApiKey;

    @Autowired
    private SpacecraftRepository spacecraftRepository;

    @Autowired
    private TrajectoryDataRepository trajectoryDataRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // We'll store the previous velocity (in ECEF, m/s) for acceleration calculations
    private double[] previousVelocityECEF = null;
    // And the most recent telemetry position from the previous API call (pos2)
    private TelemetryPosition previousPosition = null;

    /**
     * Convert lat/lon/alt to approximate ECEF coordinates (in meters),
     * using a simple spherical Earth model.
     */
    private double[] toECEF(double latDeg, double lonDeg, double altMeters) {
        double latRad = Math.toRadians(latDeg);
        double lonRad = Math.toRadians(lonDeg);
        double r = EARTH_RADIUS_M + altMeters;
        double x = r * Math.cos(latRad) * Math.cos(lonRad);
        double y = r * Math.cos(latRad) * Math.sin(lonRad);
        double z = r * Math.sin(latRad);
        return new double[]{ x, y, z };
    }

    private void upsertSpacecraft(TelemetryInfo info, double[] ecef, double orbitRadius,
                                  float velocityX, float velocityY, float velocityZ, float acceleration) {
        Long satIdLong = Long.valueOf(SATELLITE_ID);
        Spacecraft spacecraft = spacecraftRepository.findBySpacecraftId(satIdLong);
        if (spacecraft == null) {
            spacecraft = new Spacecraft();
            spacecraft.setSpacecraftId(satIdLong);
            spacecraft.setSpacecraftName(info.getSatName());
            spacecraft.setSpacecraftType(SpacecraftType.SATELLITE);
        }
        // Update fields with latest telemetry data
        spacecraft.setOrbitRadius(orbitRadius);
        spacecraft.setPositionX(ecef[0]);
        spacecraft.setPositionY(ecef[1]);
        spacecraft.setPositionZ(ecef[2]);
        spacecraft.setVelocityX((double) velocityX);
        spacecraft.setVelocityY((double) velocityY);
        spacecraft.setVelocityZ((double) velocityZ);
        spacecraft.setAcceleration((double) acceleration);

        spacecraftRepository.save(spacecraft);
    }


    /**
     * Fetch telemetry data from the N2YO API, parse the first two positions to compute orbit radius & velocity,
     * store the data, and return the TelemetryResponse.
     *
     * @return TelemetryResponse with the raw positions + info
     * @throws Exception if the API returns an error or the data is incomplete
     */
    public TelemetryResponse fetchAndProcessTelemetry() throws Exception {

        // 1) Build the correct URL
        String apiUrl = String.format(
                "%s/%s/%.3f/%.3f/%.3f/%d?apiKey=%s",
                BASE_API_URL,
                SATELLITE_ID,
                OBSERVER_LAT,
                OBSERVER_LNG,
                OBSERVER_ALT,
                SECONDS,
                n2yoApiKey
        );

        // 2) Fetch from N2YO
        String response = restTemplate.getForObject(apiUrl, String.class);

        // 3) Parse JSON
        JsonNode rootNode = objectMapper.readTree(response);

        // Check if "error" is present
        if (rootNode.has("error")) {
            String errorMsg = rootNode.get("error").asText();
            throw new Exception("API Error: " + errorMsg);
        }

        // The raw API response has "info" for the satellite info
        JsonNode infoNode = rootNode.get("info");
        if (infoNode == null) {
            throw new Exception("No 'info' field found in the response: " + response);
        }
        // Convert to TelemetryInfo
        TelemetryInfo info = objectMapper.treeToValue(infoNode, TelemetryInfo.class);

        // Extract positions
        JsonNode positionsNode = rootNode.get("positions");
        if (positionsNode == null || !positionsNode.isArray() || positionsNode.size() < 2) {
            throw new Exception("Not enough positions found in the response: " + response);
        }
        ArrayList<TelemetryPosition> positions = new ArrayList<>();
        for (JsonNode node : positionsNode) {
            TelemetryPosition pos = objectMapper.treeToValue(node, TelemetryPosition.class);
            // The API returns a 10-digit timestamp in seconds
            long rawTs = node.get("timestamp").asLong();  // e.g. 1521354418
            long millis = rawTs * 1000L;                  // e.g. 1521354418000
            pos.setTimestamp(new Timestamp(millis));
            positions.add(pos);
        }

        // Build TelemetryResponse for returning via WebSocket
        TelemetryResponse telemetryResponse = new TelemetryResponse(positions, info);

        // 4) We use the first two positions from THIS API call
        TelemetryPosition pos1 = positions.get(0);
        TelemetryPosition pos2 = positions.get(1);

        // Convert altitude from km to meters
        double altMeters1 = pos1.getSataltitude() * 1000.0;
        double altMeters2 = pos2.getSataltitude() * 1000.0;

        // ECEF for the first position
        double[] ecef1 = toECEF(pos1.getSatlatitude(), pos1.getSatlongitude(), altMeters1);
        // ECEF for the second position
        double[] ecef2 = toECEF(pos2.getSatlatitude(), pos2.getSatlongitude(), altMeters2);

        // Approx orbit radius from pos1
        double orbitRadius = Math.sqrt(ecef1[0]*ecef1[0] + ecef1[1]*ecef1[1] + ecef1[2]*ecef1[2]);

        // Time difference in seconds
        long dtMillis = pos2.getTimestamp().getTime() - pos1.getTimestamp().getTime();
        if (dtMillis <= 0) {
            throw new Exception("Non-positive time difference between positions.");
        }
        double dtSec = dtMillis / 1000.0;

        // Compute velocity vector (ECEF, m/s) from pos1 to pos2
        double vx = (ecef2[0] - ecef1[0]) / dtSec;
        double vy = (ecef2[1] - ecef1[1]) / dtSec;
        double vz = (ecef2[2] - ecef1[2]) / dtSec;

        float velocityX = (float) vx;
        float velocityY = (float) vy;
        float velocityZ = (float) vz;

        float speed = (float) Math.sqrt(vx*vx + vy*vy + vz*vz);

        // If we have a previous velocity, compute acceleration
        float acceleration = 0f;
        double[] currentVelocityECEF = new double[] { vx, vy, vz };
        if (previousVelocityECEF != null) {
            double ax = (currentVelocityECEF[0] - previousVelocityECEF[0]) / dtSec;
            double ay = (currentVelocityECEF[1] - previousVelocityECEF[1]) / dtSec;
            double az = (currentVelocityECEF[2] - previousVelocityECEF[2]) / dtSec;
            acceleration = (float) Math.sqrt(ax*ax + ay*ay + az*az);
        }

        // Update for next call
        previousVelocityECEF = currentVelocityECEF;
        previousPosition = pos2;

        // 5) Ensure the spacecraft record
        Long satIdLong = Long.valueOf(SATELLITE_ID);

        upsertSpacecraft(info, ecef1, orbitRadius, velocityX, velocityY, velocityZ, acceleration);

        Spacecraft spacecraft = spacecraftRepository.findBySpacecraftId(satIdLong);

        // 6) Save trajectory data from pos1
        Timestamp timestamp = pos1.getTimestamp();
        TrajectoryDataKey key = new TrajectoryDataKey(timestamp, spacecraft.getId());
        // If your TrajectoryData constructor expects (key, posX, posY, posZ, velocityX, velocityY, velocityZ, speed, acceleration, orbitRadius, source, traceContext):
        TrajectoryData trajectoryData = new TrajectoryData(
                key,
                (float) ecef1[0],
                (float) ecef1[1],
                (float) ecef1[2],
                velocityX,
                velocityY,
                velocityZ,
                speed,
                acceleration,
                (float) orbitRadius,
                "N2YO_API",
                new HashMap<>()
        );
        trajectoryDataRepository.save(trajectoryData);

        // 7) Return the TelemetryResponse
        return telemetryResponse;
    }

    public ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
