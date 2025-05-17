// src/main/java/com/telemetry/service/PredictionService.java
package com.telemetry.service;

import com.telemetry.dto.PredictiveOrbitPoint;
import com.telemetry.dto.TelemetryPosition;
import com.telemetry.model.SatelliteReference;
import com.telemetry.model.TrajectoryData;
import com.telemetry.repository.SatelliteReferenceRepository;
import com.telemetry.repository.TrajectoryDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private static final double EARTH_MU      = 398600.4418; // km³/s²
    private static final double EARTH_RADIUS  = 6371.0;      // km
    private static final double MIN_ALTITUDE  = 350.0;       // km

    @Autowired
    private SatelliteReferenceRepository satRefRepo;

    @Autowired
    private TrajectoryDataRepository    trajRepo;

    /**
     * Public API: fetch stored telemetry for this satellite (by its local UUID),
     * map to TelemetryPosition, then compute a full‐orbit prediction.
     */
    public List<PredictiveOrbitPoint> predictFullOrbit(UUID satelliteLocalId, int numPoints) {
        SatelliteReference ref = satRefRepo.findById(satelliteLocalId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown satellite: " + satelliteLocalId));

        List<TrajectoryData> traj = trajRepo
                .findByIdExternalIdOrderByIdTimestampAsc(ref.getExternalId());

        List<TelemetryPosition> positions = traj.stream()
                .map(td -> new TelemetryPosition(
                        td.getSatLatitude(),
                        td.getSatLongitude(),
                        td.getSatAltitude(),
                        td.getTimestamp()
                ))
                .collect(Collectors.toList());

        return predictFullOrbit(positions, numPoints);
    }

    /**
     * Public API: fetch stored telemetry for this satellite, map to TelemetryPosition,
     * then compute a short‐term linear prediction.
     */
    public List<PredictiveOrbitPoint> predictOrbit(UUID satelliteLocalId, int steps, int stepSeconds) {
        SatelliteReference ref = satRefRepo.findById(satelliteLocalId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown satellite: " + satelliteLocalId));

        List<TrajectoryData> traj = trajRepo
                .findByIdExternalIdOrderByIdTimestampAsc(ref.getExternalId());

        List<TelemetryPosition> positions = traj.stream()
                .map(td -> new TelemetryPosition(
                        td.getSatLatitude(),
                        td.getSatLongitude(),
                        td.getSatAltitude(),
                        td.getTimestamp()
                ))
                .collect(Collectors.toList());

        return predictOrbit(positions, steps, stepSeconds);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Internal overload: full‐orbit from raw positions
    public List<PredictiveOrbitPoint> predictFullOrbit(List<TelemetryPosition> positions,
                                                       int numPoints) {
        List<PredictiveOrbitPoint> predictions = new ArrayList<>();
        if (positions.size() < 2) return predictions;

        TelemetryPosition latest = positions.get(positions.size() - 1);
        double[] r = latLongAltToCartesian(
                latest.getLatitude(),
                latest.getLongitude(),
                latest.getAltitude()
        );
        double[] v = estimateVelocityVector(positions);
        double[] elements = calculateOrbitalElements(r, v);

        double a     = elements[0];
        double e     = elements[1];
        double inc   = elements[2];
        double Omega = elements[3];
        double omega = elements[4];
        double M0    = elements[5];

        double period = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / EARTH_MU);
        long baseTime = latest.getTimestamp().getTime();

        for (int j = 0; j <= numPoints; j++) {
            double frac = (double) j / numPoints;
            double M    = normalizeAngle(M0 + 2 * Math.PI * frac);
            double E    = solveKepler(M, e);
            double nu   = 2 * Math.atan2(
                    Math.sqrt(1 + e) * Math.sin(E / 2),
                    Math.sqrt(1 - e) * Math.cos(E / 2)
            );
            double rMag = a * (1 - e * Math.cos(E));
            double xOrb = rMag * Math.cos(nu);
            double yOrb = rMag * Math.sin(nu);

            double[] pos = rotateToECEF(xOrb, yOrb, 0, inc, Omega, omega);
            double[] lla = cartesianToLatLongAlt(pos[0], pos[1], pos[2]);

            double alt = Math.max(lla[2], MIN_ALTITUDE);
            long t    = baseTime + (long)(frac * period * 1000);

            predictions.add(new PredictiveOrbitPoint(
                    lla[0], lla[1], alt,
                    new Timestamp(t),
                    true
            ));
        }

        return predictions;
    }

    // Internal overload: linear‐step prediction
    public List<PredictiveOrbitPoint> predictOrbit(List<TelemetryPosition> positions,
                                                   int steps,
                                                   int stepSeconds) {
        List<PredictiveOrbitPoint> predictions = new ArrayList<>();
        if (positions.size() < 2) return predictions;

        TelemetryPosition prev = positions.get(positions.size() - 2);
        TelemetryPosition last = positions.get(positions.size() - 1);

        // current point
        predictions.add(new PredictiveOrbitPoint(
                last.getLatitude(),
                last.getLongitude(),
                last.getAltitude(),
                last.getTimestamp(),
                false
        ));

        long dtSec = (last.getTimestamp().getTime() - prev.getTimestamp().getTime()) / 1000;
        if (dtSec <= 0) return predictions;

        double dLat = (last.getLatitude()  - prev.getLatitude())  / dtSec;
        double dLon = (last.getLongitude() - prev.getLongitude()) / dtSec;
        double dAlt = (last.getAltitude()  - prev.getAltitude())  / dtSec;

        long base = last.getTimestamp().getTime();
        for (int i = 1; i <= steps; i++) {
            long t = base + (long)i * stepSeconds * 1000;
            predictions.add(new PredictiveOrbitPoint(
                    last.getLatitude()  + dLat * i * stepSeconds,
                    last.getLongitude() + dLon * i * stepSeconds,
                    last.getAltitude()  + dAlt * i * stepSeconds,
                    new Timestamp(t),
                    false
            ));
        }

        return predictions;
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Utility methods for coordinate transforms & Kepler’s equation:

    private double[] latLongAltToCartesian(double lat, double lon, double altKm) {
        double φ = Math.toRadians(lat), λ = Math.toRadians(lon), r = EARTH_RADIUS + altKm;
        return new double[]{
                r * Math.cos(φ) * Math.cos(λ),
                r * Math.cos(φ) * Math.sin(λ),
                r * Math.sin(φ)
        };
    }

    private double[] cartesianToLatLongAlt(double x, double y, double z) {
        double r = Math.hypot(x, Math.hypot(y, z));
        double φ = Math.asin(z / r), λ = Math.atan2(y, x);
        return new double[]{
                Math.toDegrees(φ),
                Math.toDegrees(λ),
                r - EARTH_RADIUS
        };
    }

    private double[] estimateVelocityVector(List<TelemetryPosition> pos) {
        if (pos.size() < 2) return new double[]{0,0,0};
        TelemetryPosition p1 = pos.get(pos.size() - 2);
        TelemetryPosition p2 = pos.get(pos.size() - 1);
        double[] r1 = latLongAltToCartesian(p1.getLatitude(), p1.getLongitude(), p1.getAltitude());
        double[] r2 = latLongAltToCartesian(p2.getLatitude(), p2.getLongitude(), p2.getAltitude());
        double dt   = (p2.getTimestamp().getTime() - p1.getTimestamp().getTime()) / 1000.0;
        return new double[]{
                (r2[0] - r1[0]) / dt,
                (r2[1] - r1[1]) / dt,
                (r2[2] - r1[2]) / dt
        };
    }

    private double[] calculateOrbitalElements(double[] r, double[] v) {
        double rMag = Math.hypot(r[0], Math.hypot(r[1], r[2]));
        double vMag = Math.hypot(v[0], Math.hypot(v[1], v[2]));

        // specific angular momentum
        double[] h = {
                r[1]*v[2] - r[2]*v[1],
                r[2]*v[0] - r[0]*v[2],
                r[0]*v[1] - r[1]*v[0]
        };
        double hMag = Math.hypot(h[0], Math.hypot(h[1], h[2]));

        // node vector
        double[] n = {-h[1], h[0], 0};
        double nMag = Math.hypot(n[0], n[1]);

        double rDotV = r[0]*v[0] + r[1]*v[1] + r[2]*v[2];

        // eccentricity vector
        double[] eVec = new double[3];
        for (int i = 0; i < 3; i++) {
            eVec[i] = ((vMag*vMag - EARTH_MU/rMag) * r[i] - rDotV*v[i]) / EARTH_MU;
        }
        double eMag = Math.hypot(eVec[0], Math.hypot(eVec[1], eVec[2]));

        // semi-major axis
        double energy = vMag*vMag/2 - EARTH_MU/rMag;
        double a      = -EARTH_MU / (2*energy);

        // inclination
        double inc = Math.acos(h[2] / hMag);

        // RA of ascending node
        double Omega = Math.acos(n[0]/nMag);
        if (n[1] < 0) Omega = 2*Math.PI - Omega;

        // argument of periapsis
        double omega = Math.acos((n[0]*eVec[0] + n[1]*eVec[1]) / (nMag*eMag));
        if (eVec[2] < 0) omega = 2*Math.PI - omega;

        // true anomaly
        double nu = Math.acos((eVec[0]*r[0] + eVec[1]*r[1] + eVec[2]*r[2]) / (eMag * rMag));
        if (rDotV < 0) nu = 2*Math.PI - nu;

        // eccentric anomaly
        double E = Math.atan2(Math.sqrt(1-eMag*eMag)*Math.sin(nu), eMag + Math.cos(nu));

        // mean anomaly at epoch
        double M = E - eMag * Math.sin(E);

        return new double[]{a, eMag, inc, Omega, omega, M};
    }

    private double solveKepler(double M, double e) {
        double E = M;
        for (int i = 0; i < 10; i++) {
            double f  = E - e*Math.sin(E) - M;
            double fp = 1 - e*Math.cos(E);
            E -= f/fp;
            if (Math.abs(f/fp) < 1e-8) break;
        }
        return E;
    }

    private double normalizeAngle(double θ) {
        θ %= 2*Math.PI;
        return θ < 0 ? θ + 2*Math.PI : θ;
    }

    private double[] rotateToECEF(double x, double y, double z,
                                  double inc, double Omega, double ω) {
        double cosO = Math.cos(Omega), sinO = Math.sin(Omega);
        double cosw = Math.cos(ω),    sinw = Math.sin(ω);
        double cosI = Math.cos(inc),  sinI = Math.sin(inc);

        // 3-1-3 rotation: Ω → i → ω
        double xx = cosO*cosw - sinO*sinw*cosI;
        double xy = -cosO*sinw - sinO*cosw*cosI;
        double xz = sinO*sinI;

        double yx = sinO*cosw + cosO*sinw*cosI;
        double yy = -sinO*sinw + cosO*cosw*cosI;
        double yz = -cosO*sinI;

        double zx = sinw*sinI;
        double zy = cosw*sinI;
        double zz = cosI;

        return new double[]{
                xx*x + xy*y + xz*z,
                yx*x + yy*y + yz*z,
                zx*x + zy*y + zz*z
        };
    }
}
