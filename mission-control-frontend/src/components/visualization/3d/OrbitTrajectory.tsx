// OrbitTrajectory.tsx
'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitTrajectoryProps {
  orbitRadius: number;
  segments?: number;
  color?: string;
}

const OrbitTrajectory: React.FC<OrbitTrajectoryProps> = ({
  orbitRadius,
  segments = 64,
  color = 'white',
}) => {
  const points = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(orbitRadius * Math.cos(angle), 0, orbitRadius * Math.sin(angle));
    }
    return new Float32Array(pts);
  }, [orbitRadius, segments]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
          args={[points, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={1} />
    </line>
  );
};

export default OrbitTrajectory;
