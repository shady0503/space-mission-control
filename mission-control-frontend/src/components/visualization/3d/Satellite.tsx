'use client';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import useTelemetry from '@/lib/hooks/useTelemetry';

const EARTH_RADIUS = 6371; // km
const SCENE_SCALE = 1 / 1000;

interface SatelliteProps {
  name: string;
  details: string;
  modelUrl: string;
  scale: number;
  satelliteId: string;
  showStatus?: boolean;
  onClick: (data: { name: string; details: string; object: THREE.Group }) => void;
}

const Satellite: React.FC<SatelliteProps> = ({
  name,
  details,
  modelUrl,
  scale,
  satelliteId,
  showStatus = false,
  onClick,
}) => {
  const { 
    satellites, 
    getSatelliteData, 
    getLatestPosition, 
    getLatestPrediction,
    isConnected,
    lastUpdated,
    updateCount
  } = useTelemetry();
  
  // Component state
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);
  const [velocity, setVelocity] = useState<THREE.Vector3 | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPositionUpdate, setLastPositionUpdate] = useState<number>(0);

  // Store the last valid position to prevent flickering
  const lastPositionRef = useRef<THREE.Vector3 | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Three.js component refs
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Debug counter to track position updates
  const updateCountRef = useRef<number>(0);

  // Set up a default position for initial rendering
  useEffect(() => {
    if (!isInitialized && !currentPosition && !lastPositionRef.current) {
      console.log(`[Satellite ${satelliteId}] Setting initial default position`);
      
      // Create a default initial position based on satellite ID
      // This is just to have something visible during loading
      const idNum = parseInt(satelliteId, 10);
      const angle = (idNum % 10) * (Math.PI * 2 / 10);
      const radius = (EARTH_RADIUS + 500) * SCENE_SCALE;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = radius * 0.3 * Math.sin(angle * 2); // Add some inclination

      const initialPos = new THREE.Vector3(x, y, z);
      lastPositionRef.current = initialPos;
    }
  }, [isInitialized, currentPosition, satelliteId]);

  // Converts lat, lon, alt (in km) to Cartesian coordinates (scene units)
  const latLongAltToCartesian = useMemo(() => (lat: number, lon: number, alt: number): THREE.Vector3 => {
    try {
      if (
        typeof lat !== 'number' || 
        typeof lon !== 'number' || 
        typeof alt !== 'number' ||
        isNaN(lat) || 
        isNaN(lon) || 
        isNaN(alt)
      ) {
        throw new Error(`Invalid coordinate values: lat=${lat}, lon=${lon}, alt=${alt}`);
      }
      
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + 180) * Math.PI / 180;
      const radius = EARTH_RADIUS + alt;
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z).multiplyScalar(SCENE_SCALE);
    } catch (err) {
      console.error(`Error converting coordinates for satellite ${satelliteId}:`, err);
      setError(`Coordinate conversion error: ${err}`);
      return new THREE.Vector3(0, 50 * SCENE_SCALE, 0); // Position slightly above Earth as fallback
    }
  }, [satelliteId]);

  // Update the satellite's position based on telemetry data
  useEffect(() => {
    try {
      if (lastUpdated <= lastUpdateTimeRef.current) {
        // Skip if we haven't received a newer update
        return;
      }
      
      console.log(`[Satellite ${satelliteId}] Processing new telemetry update (${new Date(lastUpdated).toLocaleTimeString()})`);
      lastUpdateTimeRef.current = lastUpdated;
      setError(null);
      
      // Only process data if this satellite is in the available list
      if (!satellites.includes(satelliteId)) {
        console.log(`[Satellite ${satelliteId}] Not in available satellites list yet`);
        setIsLoading(true);
        return;
      }
      
      // Get latest telemetry position
      const telemetryPos = getLatestPosition(satelliteId);
      if (telemetryPos) {
        console.log(`[Satellite ${satelliteId}] Using telemetry position:`, {
          lat: telemetryPos.satlatitude,
          lon: telemetryPos.satlongitude,
          alt: telemetryPos.sataltitude
        });
        
        const cartPos = latLongAltToCartesian(
          telemetryPos.satlatitude, 
          telemetryPos.satlongitude, 
          telemetryPos.sataltitude
        );
        
        updateCountRef.current++;
        console.log(`[Satellite ${satelliteId}] Position update #${updateCountRef.current} using telemetry`);
        
        setCurrentPosition(cartPos);
        lastPositionRef.current = cartPos.clone();
        setDataSource('telemetry');
        setIsInitialized(true);
        setIsLoading(false);
        setLastPositionUpdate(Date.now());
        
        // Calculate velocity if possible
        const satData = getSatelliteData(satelliteId);
        if (satData && satData.telemetry.length >= 2) {
          const sorted = [...satData.telemetry].sort((a, b) => a.timestamp - b.timestamp);
          const latest = sorted[sorted.length - 1];
          const prev = sorted[sorted.length - 2];
          const dt = Math.max(0.001, (latest.timestamp - prev.timestamp) / 1000);
          
          const curPos = latLongAltToCartesian(
            latest.satlatitude, 
            latest.satlongitude, 
            latest.sataltitude
          );
          const prevPos = latLongAltToCartesian(
            prev.satlatitude, 
            prev.satlongitude, 
            prev.sataltitude
          );
          
          const vel = curPos.clone().sub(prevPos).divideScalar(dt);
          setVelocity(vel);
        }
        return;
      }
      
      // Fallback to prediction if telemetry not available
      const predictionPos = getLatestPrediction(satelliteId);
      if (predictionPos) {
        console.log(`[Satellite ${satelliteId}] Using prediction position:`, {
          lat: predictionPos.latitude,
          lon: predictionPos.longitude,
          alt: predictionPos.altitude
        });
        
        const cartPos = latLongAltToCartesian(
          predictionPos.latitude, 
          predictionPos.longitude, 
          predictionPos.altitude
        );
        
        updateCountRef.current++;
        console.log(`[Satellite ${satelliteId}] Position update #${updateCountRef.current} using prediction`);
        
        setCurrentPosition(cartPos);
        lastPositionRef.current = cartPos.clone();
        setDataSource('prediction');
        setIsInitialized(true);
        setIsLoading(false);
        setLastPositionUpdate(Date.now());
        
        // Calculate velocity from predictions if available
        const satData = getSatelliteData(satelliteId);
        if (satData) {
          // Use short predictions or full orbit predictions, whichever has more points
          const predictions = satData.shortPredictions.length > 0 ? 
            satData.shortPredictions : satData.fullOrbitPredictions;
            
          if (predictions.length >= 2) {
            const sorted = [...predictions].sort((a, b) => a.timestamp - b.timestamp);
            const first = sorted[0];
            const second = sorted[1];
            const dt = Math.max(0.001, (second.timestamp - first.timestamp) / 1000);
            
            const firstPos = latLongAltToCartesian(
              first.latitude, 
              first.longitude, 
              first.altitude
            );
            const secondPos = latLongAltToCartesian(
              second.latitude, 
              second.longitude, 
              second.altitude
            );
            
            const vel = secondPos.clone().sub(firstPos).divideScalar(dt);
            setVelocity(vel);
          }
        }
        return;
      }
      
      // If no data is available but we're not loading anymore, keep the last position
      if (!isLoading && satellites.length > 0) {
        console.warn(`[Satellite ${satelliteId}] No valid position data available`);
      }
    } catch (err) {
      console.error(`Error processing satellite ${satelliteId} data:`, err);
      setError(`Processing error: ${err}`);
    }
  }, [
    satelliteId, 
    satellites, 
    getSatelliteData, 
    getLatestPosition, 
    getLatestPrediction, 
    latLongAltToCartesian,
    isLoading,
    lastUpdated,
    updateCount
  ]);

  // Once the GLTF model is loaded, attach it to our ref
  useEffect(() => {
    try {
      if (model && modelRef.current) {
        while (modelRef.current.children.length > 0) {
          modelRef.current.remove(modelRef.current.children[0]);
        }
        modelRef.current.add(model);
      }
    } catch (err) {
      console.error(`Error loading model for satellite ${satelliteId}:`, err);
      setError(`Model loading error: ${err}`);
    }
  }, [model, satelliteId]);

  // Update connection status effect
  useEffect(() => {
    if (!isConnected && !isLoading) {
      setError("Connection lost. Waiting for reconnection...");
    } else if (isConnected && error === "Connection lost. Waiting for reconnection...") {
      setError(null);
    }
  }, [isConnected, isLoading, error]);

  // Update satellite position and orientation each frame
  useFrame(() => {
    if (!groupRef.current) return;
    try {
      const position = currentPosition || lastPositionRef.current;
      
      if (position) {
        groupRef.current.visible = true;
        groupRef.current.position.copy(position);
        
        if (velocity && velocity.lengthSq() > 0.0001) {
          const forward = velocity.clone().normalize();
          const up = position.clone().normalize();
          
          // Only proceed if we have valid vectors
          if (forward.lengthSq() > 0 && up.lengthSq() > 0) {
            // Make sure up and forward aren't parallel
            const dot = Math.abs(forward.dot(up.clone().normalize()));
            if (dot < 0.99) {
              const right = new THREE.Vector3().crossVectors(forward, up).normalize();
              const correctedForward = new THREE.Vector3().crossVectors(up, right).normalize();
              const rotMatrix = new THREE.Matrix4().makeBasis(right, up, correctedForward);
              if (modelRef.current) {
                modelRef.current.quaternion.setFromRotationMatrix(rotMatrix);
              }
            } else {
              // Vectors too similar, use simpler orientation
              if (modelRef.current) {
                modelRef.current.lookAt(0, 0, 0);
              }
            }
          } else {
            // Invalid vectors, use simpler orientation
            if (modelRef.current) {
              modelRef.current.lookAt(0, 0, 0);
            }
          }
        } else {
          // No velocity data, just look at Earth center
          if (modelRef.current) {
            modelRef.current.lookAt(0, 0, 0);
          }
        }
      } else {
        groupRef.current.visible = false;
      }
    } catch (err) {
      console.error(`Error in frame update for satellite ${satelliteId}:`, err);
      if (groupRef.current) {
        groupRef.current.visible = false;
      }
    }
  });

  // Don't show any error messages during initial loading
  const showErrorMessage = !isLoading && showStatus && (!currentPosition && !lastPositionRef.current);

  return (
    <group 
      ref={groupRef} 
      onClick={() => groupRef.current && onClick({ name, details, object: groupRef.current })}
      visible={currentPosition !== null || lastPositionRef.current !== null}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <group ref={modelRef} scale={scale} />
      {/* A small sphere to help with click/visibility */}
      <mesh scale={0.15}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial 
          color="#66ffcc"
          transparent={true}
          opacity={0.6}
        />
      </mesh>
      {(currentPosition || lastPositionRef.current) && dataSource && (
        <Html
          position={[0, 0.3, 0]}
          distanceFactor={10} 
          style={{ pointerEvents: 'none' }}
          center
        >
          <div style={{ 
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '3px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            whiteSpace: 'nowrap'
          }}>
            {name} ({dataSource})
            <div style={{ fontSize: '8px' }}>
              Last update: {new Date(lastPositionUpdate).toLocaleTimeString()}
            </div>
          </div>
        </Html>
      )}
      {/* Only show error message after loading is complete */}
      {showErrorMessage && (
        <Html
          position={[0, 0, 0]}
          center
          distanceFactor={10}
          style={{ 
            pointerEvents: 'none',
            transform: `translate3d(${-10 + Math.random() * 20}px, ${60 + Math.random() * 20}px, 0)`
          }}
        >
          <div style={{ 
            background: 'rgba(0,0,0,0.7)',
            color: '#ff6666',
            padding: '4px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)'
          }}>
            No telemetry data available for satellite {satelliteId}
            {error && <div className="text-xs mt-1">{error}</div>}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Satellite;