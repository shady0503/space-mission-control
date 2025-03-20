// Satellite.tsx
'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SatelliteProps {
  orbitRadius: number;
  speed: number;
  name: string;
  details: string;
  scale: number;
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
  // Clone the model so each satellite instance is independent.
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Refs to store the current orbit parameters used for animation.
  const currentOrbitRadius = useRef<number>(orbitRadius);
  const currentSpeed = useRef<number>(speed);
  // Theta holds the satellite's angular position.
  const theta = useRef<number>(initialTheta);

  // A transition object to smoothly interpolate orbitRadius changes.
  // When orbitRadius prop changes, this ref is set to an object containing the start time, duration, and the old and new orbit radii.
  const radiusTransition = useRef<{ start: number; duration: number; from: number; to: number } | null>(null);
  // Similarly, for speed if desired:
  const speedTransition = useRef<{ start: number; duration: number; from: number; to: number } | null>(null);

  // When the orbitRadius prop changes, initiate a transition.
  useEffect(() => {
    // If the new orbit radius is different from the current animated value, start a transition.
    if (orbitRadius !== currentOrbitRadius.current) {
      radiusTransition.current = {
        start: performance.now(),
        duration: 5000, // 5 seconds transition (adjust as needed)
        from: currentOrbitRadius.current,
        to: orbitRadius,
      };
    }
  }, [orbitRadius]);

  // (Optional) When the speed prop changes, start a speed transition.
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

  // In each frame, update the transition values.
  useFrame((_, delta) => {
    // Update orbit radius with transition if active.
    if (radiusTransition.current) {
      const now = performance.now();
      const t = Math.min((now - radiusTransition.current.start) / radiusTransition.current.duration, 1);
      // Ease-in-out using sine easing.
      const easedT = (1 - Math.cos(Math.PI * t)) / 2;
      currentOrbitRadius.current = THREE.MathUtils.lerp(radiusTransition.current.from, radiusTransition.current.to, easedT);
      if (t >= 1) {
        radiusTransition.current = null;
      }
    } else {
      currentOrbitRadius.current = orbitRadius;
    }

    // Update speed with transition if active.
    if (speedTransition.current) {
      const now = performance.now();
      const t = Math.min((now - speedTransition.current.start) / speedTransition.current.duration, 1);
      const easedT = (1 - Math.cos(Math.PI * t)) / 2;
      currentSpeed.current = THREE.MathUtils.lerp(speedTransition.current.from, speedTransition.current.to, easedT);
      if (t >= 1) {
        speedTransition.current = null;
      }
    } else {
      currentSpeed.current = speed;
    }

    // Update theta using the current speed.
    theta.current += currentSpeed.current * delta;

    // Compute new position using the current (transitioned) orbit radius.
    const x = currentOrbitRadius.current * Math.cos(theta.current);
    const z = currentOrbitRadius.current * Math.sin(theta.current);
    const y = 0; // Orbit on the xz plane.

    if (groupRef.current) {
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
