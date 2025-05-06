'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import useTelemetry from '@/lib/hooks/useTelemetry';

const EARTH_RADIUS = 6371; // km
const SCENE_SCALE = 1 / 1000;
const MAX_PATH_POINTS = 200; // Limit number of points to prevent performance issues

interface TelemetryPathProps {
  satelliteId: string;
  showStatus?: boolean;
}

const TelemetryPath: React.FC<TelemetryPathProps> = ({
  satelliteId,
  showStatus = false
}) => {
  const { 
    satellites, 
    getSatelliteData, 
    connectionStatus 
  } = useTelemetry();

  // State for path visualization
  const [orbitPoints, setOrbitPoints] = useState<THREE.Vector3[]>([]);
  const [shortTermPoints, setShortTermPoints] = useState<THREE.Vector3[]>([]);
  const [historyPoints, setHistoryPoints] = useState<THREE.Vector3[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Cache to preserve points between updates
  const orbitPointsRef = useRef<THREE.Vector3[]>([]);
  const shortTermPointsRef = useRef<THREE.Vector3[]>([]);
  const historyPointsRef = useRef<THREE.Vector3[]>([]);

  // Set up initial fake orbit for visibility during loading
  useEffect(() => {
    // Only create placeholder orbit if we don't have real data yet
    if (!isInitialized && orbitPoints.length === 0) {
      const fakeOrbitPoints: THREE.Vector3[] = [];
      for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const radius = (EARTH_RADIUS + 500) * SCENE_SCALE;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        fakeOrbitPoints.push(new THREE.Vector3(x, 0, z));
      }
      orbitPointsRef.current = fakeOrbitPoints;
      setOrbitPoints(fakeOrbitPoints);
    }
  }, [orbitPoints.length, isInitialized]);

  // Converts lat, lon, alt (in km) to Cartesian coordinates (scene units)
  const latLongAltToCartesian = (lat: number, lon: number, alt: number, scale: number = SCENE_SCALE): THREE.Vector3 => {
    try {
      // Handle string conversions
      const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
      const longitude = typeof lon === 'string' ? parseFloat(lon) : lon;
      const altitude = typeof alt === 'string' ? parseFloat(alt) : alt;
      
      // Ensure values are within valid ranges
      if (isNaN(latitude) || isNaN(longitude) || isNaN(altitude) || 
          latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || altitude < 0) {
        console.warn(`Invalid coordinate values for satellite ${satelliteId}: lat=${lat}, lon=${lon}, alt=${alt}`);
        return new THREE.Vector3(0, 0, 0);
      }

      const phi = (90 - latitude) * Math.PI / 180;
      const theta = (longitude + 180) * Math.PI / 180;
      const radius = EARTH_RADIUS + altitude;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      
      return new THREE.Vector3(x, y, z).multiplyScalar(scale);
    } catch (err) {
      console.error(`Error converting coordinates for satellite ${satelliteId}:`, err);
      setError(`Coordinate conversion error: ${err}`);
      return new THREE.Vector3(0, 0, 0);
    }
  };

  // Process full orbit data specifically - ensuring points create a proper orbit
  const processFullOrbitData = (orbitData: any[]): THREE.Vector3[] => {
    if (!orbitData || !Array.isArray(orbitData) || orbitData.length < 5) {
      console.warn(`Not enough orbit data points for satellite ${satelliteId}`);
      return orbitPointsRef.current;  // Return cached points
    }

    try {
      // First, convert all points to cartesian coordinates
      const cartesianPoints = orbitData.map(p => {
        if (!p) return null;
        
        // Handle string conversions
        const lat = typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude;
        const lon = typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude;
        const alt = typeof p.altitude === 'string' ? parseFloat(p.altitude) : p.altitude;
        
        if (isNaN(lat) || isNaN(lon) || isNaN(alt)) {
          console.warn(`Invalid orbit data point for satellite ${satelliteId}:`, p);
          return null;
        }
        return latLongAltToCartesian(lat, lon, alt);
      }).filter(p => p !== null && p.lengthSq() > 0) as THREE.Vector3[];
      
      if (cartesianPoints.length < 5) {
        console.warn(`Not enough valid orbit points for satellite ${satelliteId}`);
        return orbitPointsRef.current;  // Return cached points
      }
      
      // For full orbit, order by angle from Earth center for more consistent display
      const earthCenter = new THREE.Vector3(0, 0, 0);
      
      // Sort points by angle around an approximate orbital plane
      const sortedPoints = [...cartesianPoints].sort((a, b) => {
        const aVec = a.clone().sub(earthCenter);
        const bVec = b.clone().sub(earthCenter);
        
        const aAngle = Math.atan2(aVec.z, aVec.x);
        const bAngle = Math.atan2(bVec.z, bVec.x);
        
        return aAngle - bAngle;
      });
      
      // Ensure orbit is closed by adding the first point at the end if needed
      if (sortedPoints.length > 0 && 
          sortedPoints[0].distanceToSquared(sortedPoints[sortedPoints.length - 1]) > 0.01) {
        sortedPoints.push(sortedPoints[0].clone());
      }
      
      // Update cache
      orbitPointsRef.current = sortedPoints;
      return sortedPoints;
    } catch (error) {
      console.error(`Error processing full orbit for satellite ${satelliteId}:`, error);
      return orbitPointsRef.current;  // Return cached points
    }
  };

  // Sample points from an array to reduce point count for performance
  const samplePoints = <T extends { timestamp: number }>(
    arr: T[], 
    maxPoints: number,
    extractCoordinates: (point: T) => THREE.Vector3
  ): THREE.Vector3[] => {
    if (!arr || arr.length === 0) return [];
    
    if (arr.length <= maxPoints) {
      return arr.map(extractCoordinates);
    }
    
    const step = Math.ceil(arr.length / maxPoints);
    const result: THREE.Vector3[] = [];
    
    for (let i = 0; i < arr.length; i += step) {
      result.push(extractCoordinates(arr[i]));
    }
    
    // Always include the last point
    if (result.length > 0 && arr.length > 0 && 
        result[result.length - 1] !== extractCoordinates(arr[arr.length - 1])) {
      result.push(extractCoordinates(arr[arr.length - 1]));
    }
    
    return result;
  };

  // Process telemetry data to generate path points
  useEffect(() => {
    let isMounted = true;
    
    const processData = async () => {
      try {
        setError(null);
        
        // Don't attempt to process data until satellite is in the list
        if (!satellites.includes(satelliteId)) {
          setDataStatus("Waiting for satellite data...");
          return;
        }
        
        const satData = getSatelliteData(satelliteId);
        
        if (!satData) {
          console.warn(`TelemetryPath: No data found for satellite ${satelliteId}`);
          setDataStatus(`No telemetry data for satellite ${satelliteId}`);
          return;
        }
        
        // Process full orbit predictions
        if (satData.fullOrbitPredictions && satData.fullOrbitPredictions.length > 0) {
          try {
            const orbitPositions = processFullOrbitData(satData.fullOrbitPredictions);
            if (isMounted) {
              setOrbitPoints(orbitPositions);
              orbitPointsRef.current = orbitPositions;
            }
          } catch (error) {
            console.error(`Error processing fullOrbitPredictions for satellite ${satelliteId}:`, error);
            setError(`Orbit error: ${error}`);
          }
        }
        
        // Process short predictions
        if (satData.shortPredictions && satData.shortPredictions.length > 0) {
          try {
            const sorted = [...satData.shortPredictions].sort((a, b) => a.timestamp - b.timestamp);
            
            const points = samplePoints(
              sorted,
              MAX_PATH_POINTS,
              (p) => {
                const lat = typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude;
                const lon = typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude;
                const alt = typeof p.altitude === 'string' ? parseFloat(p.altitude) : p.altitude;
                return latLongAltToCartesian(lat, lon, alt);
              }
            );
            
            if (isMounted) {
              setShortTermPoints(points);
              shortTermPointsRef.current = points;
            }
          } catch (error) {
            console.error(`Error processing shortPredictions for satellite ${satelliteId}:`, error);
            setError(`Short predictions error: ${error}`);
          }
        }
        
        // Process telemetry history
        if (satData.telemetry && satData.telemetry.length > 0) {
          try {
            const sorted = [...satData.telemetry].sort((a, b) => a.timestamp - b.timestamp);
            
            const points = samplePoints(
              sorted,
              MAX_PATH_POINTS,
              (p) => {
                const lat = typeof p.satlatitude === 'string' ? parseFloat(p.satlatitude) : p.satlatitude;
                const lon = typeof p.satlongitude === 'string' ? parseFloat(p.satlongitude) : p.satlongitude;
                const alt = typeof p.sataltitude === 'string' ? parseFloat(p.sataltitude) : p.sataltitude;
                return latLongAltToCartesian(lat, lon, alt);
              }
            );
            
            if (isMounted) {
              setHistoryPoints(points);
              historyPointsRef.current = points;
            }
            
            // Clear status once we have actual points
            setDataStatus(null);
            setIsInitialized(true);
          } catch (error) {
            console.error(`Error processing telemetry for satellite ${satelliteId}:`, error);
            setError(`Telemetry error: ${error}`);
          }
        }
        
        // Update data status based on what we processed
        if (!satData.telemetry?.length && !satData.fullOrbitPredictions?.length && !satData.shortPredictions?.length) {
          setDataStatus(`No orbital data for satellite ${satelliteId}`);
        } else if (orbitPoints.length || shortTermPoints.length || historyPoints.length) {
          setDataStatus(null); // We have some data
          setIsInitialized(true);
        }
      } catch (err) {
        console.error(`Error in TelemetryPath for satellite ${satelliteId}:`, err);
        setError(`Error processing path data: ${err}`);
      }
    };

    processData();
    
    return () => {
      isMounted = false;
    };
  }, [satelliteId, satellites, getSatelliteData]);

  // Convert arrays of Vector3 to Float32Array for buffer geometry.
  const orbitArray = useMemo(() => {
    if (orbitPoints.length === 0) return new Float32Array(0);
    const array = new Float32Array(orbitPoints.length * 3);
    orbitPoints.forEach((point, i) => {
      array[i * 3] = point.x;
      array[i * 3 + 1] = point.y;
      array[i * 3 + 2] = point.z;
    });
    return array;
  }, [orbitPoints]);

  const shortTermArray = useMemo(() => {
    if (shortTermPoints.length === 0) return new Float32Array(0);
    const array = new Float32Array(shortTermPoints.length * 3);
    shortTermPoints.forEach((point, i) => {
      array[i * 3] = point.x;
      array[i * 3 + 1] = point.y;
      array[i * 3 + 2] = point.z;
    });
    return array;
  }, [shortTermPoints]);

  const historyArray = useMemo(() => {
    if (historyPoints.length === 0) return new Float32Array(0);
    const array = new Float32Array(historyPoints.length * 3);
    historyPoints.forEach((point, i) => {
      array[i * 3] = point.x;
      array[i * 3 + 1] = point.y;
      array[i * 3 + 2] = point.z;
    });
    return array;
  }, [historyPoints]);

  // Determine if we have any data to show
  const hasRealData = isInitialized && (shortTermPoints.length > 0 || historyPoints.length > 0);

  // Colors for the different line types
  const orbitColor = '#ffb400';
  const shortTermColor = '#33ccff';
  const historyColor = '#33ff33';

  // Loading placeholder message
  if (!hasRealData && !isInitialized && dataStatus && showStatus) {
    return (
      <group>
        <Html position={[0, -1, 0]}>
          <div style={{
            color: 'white',
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}>
            {dataStatus}
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group>
      {/* Always render orbit if we have any points */}
      {orbitArray.length > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              args={[orbitArray, 3]}
              attach="attributes-position"
              count={orbitPoints.length}
              array={orbitArray}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={orbitColor}
            linewidth={1.5}
            opacity={0.8}
            transparent={true}
          />
        </line>
      )}
      
      {shortTermArray.length > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              args={[shortTermArray, 3]}
              attach="attributes-position"
              count={shortTermPoints.length}
              array={shortTermArray}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={shortTermColor}
            linewidth={1.5}
            opacity={0.8}
            transparent={true}
          />
        </line>
      )}
      
      {historyArray.length > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              args={[historyArray, 3]}
              attach="attributes-position"
              count={historyPoints.length}
              array={historyArray}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color={historyColor}
            linewidth={1.5}
            opacity={0.8}
            transparent={true}
          />
        </line>
      )}
    </group>
  );
};

export default TelemetryPath;