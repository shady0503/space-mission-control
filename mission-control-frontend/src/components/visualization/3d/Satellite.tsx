// Satellite.tsx
'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import useTelemetry, { TelemetryData } from '../../../api/hooks/useTelemtry';

interface SatelliteProps {
  orbitRadius: number; // fallback orbit radius in km
  speed: number;       // fallback angular speed in rad/s
  name: string;
  details: string;
  scale: number;       // scale for the model (e.g., 0.3)
  initialTheta: number;
  modelUrl: string;
  onClick: (data: { name: string; details: string; object: THREE.Group }) => void;
}

const Satellite: React.FC<SatelliteProps> = ({
  orbitRadius,
  speed,
  name,
  details,
  scale,
  initialTheta,
  modelUrl,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl);
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Fallback simulation state (orbitRadius in km)
  const currentOrbitRadius = useRef<number>(orbitRadius);
  const currentSpeed = useRef<number>(speed);
  const theta = useRef<number>(initialTheta);
  const radiusTransition = useRef<{ start: number; duration: number; from: number; to: number } | null>(null);
  const speedTransition = useRef<{ start: number; duration: number; from: number; to: number } | null>(null);

  // Use telemetry from the backend.
  const telemetry: TelemetryData | null = useTelemetry();

  // Time scale multiplier to speed up simulation if needed.
  const timeScale = 100;

  useEffect(() => {
    if (orbitRadius !== currentOrbitRadius.current) {
      radiusTransition.current = {
        start: performance.now(),
        duration: 5000,
        from: currentOrbitRadius.current,
        to: orbitRadius,
      };
    }
  }, [orbitRadius]);

  useEffect(() => {
    if (speed !== currentSpeed.current) {
      speedTransition.current = {
        start: performance.now(),
        duration: 5000,
        from: currentSpeed.current,
        to: speed,
      };
    }
  }, [speed]);

  useFrame((_, delta) => {
    const scaledDelta = delta * timeScale;
    if (telemetry && groupRef.current) {
      // Use telemetry: telemetry.positionX is longitude (deg), positionY is latitude (deg),
      // telemetry.orbitRadius is in km.
      const latRad = (telemetry.positionY * Math.PI) / 180;
      const lonRad = (telemetry.positionX * Math.PI) / 180;
      const scaleFactor = 1 / 1000; // convert km to scene units
      const sceneOrbit = telemetry.orbitRadius * scaleFactor;
      const x = sceneOrbit * Math.cos(latRad) * Math.cos(lonRad);
      const y = sceneOrbit * Math.sin(latRad);
      const z = sceneOrbit * Math.cos(latRad) * Math.sin(lonRad);
      groupRef.current.position.set(x, y, z);
    } else if (groupRef.current) {
      // Fallback simulation: update position using internal state.
      if (radiusTransition.current) {
        const now = performance.now();
        const t = Math.min((now - radiusTransition.current.start) / radiusTransition.current.duration, 1);
        const easedT = (1 - Math.cos(Math.PI * t)) / 2;
        currentOrbitRadius.current = THREE.MathUtils.lerp(radiusTransition.current.from, radiusTransition.current.to, easedT);
        if (t >= 1) radiusTransition.current = null;
      }
      if (speedTransition.current) {
        const now = performance.now();
        const t = Math.min((now - speedTransition.current.start) / speedTransition.current.duration, 1);
        const easedT = (1 - Math.cos(Math.PI * t)) / 2;
        currentSpeed.current = THREE.MathUtils.lerp(speedTransition.current.from, speedTransition.current.to, easedT);
        if (t >= 1) speedTransition.current = null;
      }
      theta.current += currentSpeed.current * scaledDelta;
      // Convert fallback orbitRadius from km to scene units.
      const sceneOrbit = currentOrbitRadius.current / 1000;
      const x = sceneOrbit * Math.cos(theta.current);
      const z = sceneOrbit * Math.sin(theta.current);
      const y = 0;
      groupRef.current.position.set(x, y, z);
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={() => {
        if (groupRef.current) {
          onClick({
            name,
            details,
            object: groupRef.current,
          });
        }
      }}
    >
      <primitive object={clonedScene} scale={scale} />
    </group>
  );
};

export default Satellite;
