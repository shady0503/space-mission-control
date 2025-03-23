// Scene.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { SatelliteConfig } from '@/types/SatelliteConfig';
import * as THREE from 'three';
import SceneContent from './SceneContent';
import SatelliteInfo from '../../common/SatelliteInfo';
import SatelliteControls from '../../common/SatelliteControls';

interface FocusedSatellite {
  config: SatelliteConfig;
  object: THREE.Group;
}

interface SceneProps {
  satellites?: SatelliteConfig[];
}



const defaultSatellites: SatelliteConfig[] = [
  {
    orbitRadius: 6789.6, // 6371 km (Earth) + 418.6 km (ISS altitude)
    speed: 0.0005,       // fallback angular speed (radians per second)
    name: 'ISS',
    details: 'International Space Station',
    scale: 0.3,          // relatively small compared to Earth
    initialTheta: 0,
    modelUrl: '/assets/satellites/AcrimSAT.glb',
    trajectoryColor: 'lightblue',
  },
];


const Scene: React.FC<SceneProps> = ({ satellites = defaultSatellites }) => {
  // Store satellite configs in state so they can be updated.
  const [satelliteConfigs, setSatelliteConfigs] = useState<SatelliteConfig[]>(satellites);
  // Focused satellite state (config and object reference).
  const [focusedSatellite, setFocusedSatellite] = useState<FocusedSatellite | null>(null);
  // Live position of the focused satellite.
  const [focusedPosition, setFocusedPosition] = useState<THREE.Vector3 | null>(null);

  // Right-click on the container clears focus.
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFocusedSatellite(null);
    setFocusedPosition(null);
  };

  // Callback to update the focused satellite's config.
  const updateFocusedSatelliteConfig = (newConfig: Partial<SatelliteConfig>) => {
    if (!focusedSatellite) return;
    const updatedConfig = { ...focusedSatellite.config, ...newConfig };
    setFocusedSatellite({ ...focusedSatellite, config: updatedConfig });
    setSatelliteConfigs((prev) =>
      prev.map((cfg) => (cfg.name === focusedSatellite.config.name ? updatedConfig : cfg))
    );
  };

  return (
    <div className="relative w-full h-screen" onContextMenu={handleContextMenu}>
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <SceneContent
          satellites={satelliteConfigs}
          focusedSatellite={focusedSatellite}
          setFocusedSatellite={setFocusedSatellite}
          setFocusedPosition={setFocusedPosition}
        />
      </Canvas>
      {focusedSatellite && focusedPosition && (
        <>
          {/* Display satellite info in the top-right */}
          <SatelliteInfo config={focusedSatellite.config} position={focusedPosition} />
          {/* Display interactive controls in the top-left */}
          <SatelliteControls config={focusedSatellite.config} onChange={updateFocusedSatelliteConfig} />
        </>
      )}
    </div>
  );
};

export default Scene;
