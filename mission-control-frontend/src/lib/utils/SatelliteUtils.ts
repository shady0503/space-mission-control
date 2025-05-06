// lib/utils/SatelliteUtils.ts
import * as THREE from 'three';

// Constants
export const EARTH_RADIUS = 6371; // km
export const SCENE_SCALE = 1 / 1000; // scaling factor for the scene

// Type definitions
export interface SatellitePosition {
  lat: number;
  lon: number;
  alt: number;
  timestamp: number;
}

/**
 * Convert latitude, longitude, altitude to Cartesian coordinates
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param alt Altitude in kilometers
 * @param scale Optional scaling factor (defaults to SCENE_SCALE)
 * @returns Vector3 representing the position in Cartesian coordinates
 */
export function latLongAltToCartesian(
  lat: number,
  lon: number,
  alt: number,
  scale: number = SCENE_SCALE
): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  const radius = EARTH_RADIUS + alt;

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z).multiplyScalar(scale);
}

/**
 * Calculate orbital parameters from position and velocity
 * @param position Position vector
 * @param velocity Velocity vector
 * @returns Object containing orbital parameters
 */
export function calculateOrbitalParameters(
  position: THREE.Vector3,
  velocity: THREE.Vector3
): {
  semimajorAxis: number;
  eccentricity: number;
  inclination: number;
  ascendingNode: number;
  orbitNormal: THREE.Vector3;
} {
  const mu = 398600.4418; // Earth's gravitational parameter (km³/s²)
  
  // Calculate specific angular momentum
  const h = new THREE.Vector3().crossVectors(position, velocity);
  
  // Calculate eccentricity vector
  const v2 = velocity.lengthSq();
  const r = position.length();
  const rv = position.dot(velocity);
  
  const eVec = new THREE.Vector3()
    .copy(position)
    .multiplyScalar(v2 - mu / r)
    .sub(velocity.clone().multiplyScalar(rv))
    .divideScalar(mu);
  
  const e = eVec.length(); // eccentricity
  
  // Calculate semi-major axis
  const a = h.lengthSq() / (mu * (1 - e * e));
  
  // Calculate inclination
  const i = Math.acos(h.y / h.length());
  
  // Calculate longitude of ascending node
  const n = new THREE.Vector3(
    -h.z,
    0,
    h.x
  );
  let omega = Math.acos(n.x / n.length());
  if (n.z < 0) {
    omega = 2 * Math.PI - omega;
  }
  
  return {
    semimajorAxis: a,
    eccentricity: e,
    inclination: i * 180 / Math.PI, // convert to degrees
    ascendingNode: omega * 180 / Math.PI, // convert to degrees
    orbitNormal: h.normalize()
  };
}

/**
 * Calculate velocity from two positions and time delta
 * @param pos1 First position
 * @param pos2 Second position
 * @param deltaT Time delta in seconds
 * @returns Velocity vector
 */
export function calculateVelocity(
  pos1: THREE.Vector3,
  pos2: THREE.Vector3,
  deltaT: number
): THREE.Vector3 {
  return new THREE.Vector3()
    .subVectors(pos2, pos1)
    .divideScalar(Math.max(0.001, deltaT));
}

/**
 * Generate smoothed orbit points from a sparse set of points
 * @param points Array of orbit points
 * @param numIntermediatePoints Number of intermediate points to generate between each pair
 * @returns Array of smoothed orbit points
 */
export function generateSmoothedOrbit(
  points: THREE.Vector3[],
  numIntermediatePoints: number = 5
): THREE.Vector3[] {
  if (points.length < 2) return points;
  
  const smoothedPoints: THREE.Vector3[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    
    smoothedPoints.push(start.clone());
    
    for (let j = 1; j <= numIntermediatePoints; j++) {
      const t = j / (numIntermediatePoints + 1);
      const intermediate = new THREE.Vector3().lerpVectors(start, end, t);
      smoothedPoints.push(intermediate);
    }
  }
  
  // Add the last point
  smoothedPoints.push(points[points.length - 1].clone());
  
  return smoothedPoints;
}

/**
 * Calculate the optimal camera position to view a satellite
 * @param satellitePosition Satellite position
 * @param offsetFactor Offset factor (1.0 = same distance as satellite from Earth center)
 * @returns Optimal camera position
 */
export function calculateOptimalCameraPosition(
  satellitePosition: THREE.Vector3,
  offsetFactor: number = 0.5
): THREE.Vector3 {
  // Direction from Earth center to satellite
  const direction = satellitePosition.clone().normalize();
  
  // Distance from Earth to satellite
  const distanceToSat = satellitePosition.length();
  
  // Add offset for better viewing
  const distanceFromEarth = distanceToSat + (distanceToSat * offsetFactor);
  
  // Calculate final camera position along the same direction vector
  return direction.multiplyScalar(distanceFromEarth);
}

/**
 * Create a rotation matrix for satellite orientation
 * @param position Satellite position
 * @param velocity Satellite velocity
 * @returns Rotation matrix
 */
export function createSatelliteRotationMatrix(
  position: THREE.Vector3,
  velocity: THREE.Vector3
): THREE.Matrix4 {
  try {
    const forward = velocity.clone().normalize(); // direction of travel
    const up = position.clone().normalize(); // direction from Earth center
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    const correctedForward = new THREE.Vector3().crossVectors(up, right).normalize();
    
    return new THREE.Matrix4().makeBasis(right, up, correctedForward);
  } catch (e) {
    // Return identity matrix if there's an error
    return new THREE.Matrix4();
  }
}