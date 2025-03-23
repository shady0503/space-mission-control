// OrbitTrajectory.tsx
'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitTrajectoryProps {
  orbitRadius: number; // in km
  segments?: number;
  color?: string;
}

const OrbitTrajectory: React.FC<OrbitTrajectoryProps> = ({
  orbitRadius,
  segments = 128,
  color = 'white',
}) => {
  const scaleFactor = 1 / 1000; // convert km to scene units
  const sceneOrbitRadius = orbitRadius * scaleFactor; // e.g., 6789.6 km becomes ~6.79

  const points = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(sceneOrbitRadius * Math.cos(angle), 0, sceneOrbitRadius * Math.sin(angle));
    }
    return new Float32Array(pts);
  }, [sceneOrbitRadius, segments]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} args={[points, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={1} />
    </line>
  );
};

export default OrbitTrajectory;
