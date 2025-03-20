// SceneContent.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Earth from './Earth';
import Satellite from './Satellite';
import OrbitTrajectory from './OrbitTrajectory';
import { SatelliteConfig } from '@/types/SatelliteConfig';
import * as THREE from 'three';

interface FocusedSatellite {
  config: SatelliteConfig;
  object: THREE.Group;
}

interface SceneContentProps {
  satellites: SatelliteConfig[];
  focusedSatellite: FocusedSatellite | null;
  setFocusedSatellite: (sat: FocusedSatellite | null) => void;
  // Callback to update live position for overlay.
  setFocusedPosition: (pos: THREE.Vector3 | null) => void;
}

const SceneContent: React.FC<SceneContentProps> = ({
  satellites,
  focusedSatellite,
  setFocusedSatellite,
  setFocusedPosition,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  // Refs for follow/zoom logic.
  const offsetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 20));
  const targetOffsetRef = useRef<THREE.Vector3 | null>(null);
  const defaultZoom = useRef<number>(camera.zoom);
  const targetZoomRef = useRef<number>(camera.zoom);
  const isZoomingRef = useRef<boolean>(false);
  // Cache satellite positions.
  const satellitePositionsRef = useRef<Map<THREE.Group, THREE.Vector3>>(new Map());

  useEffect(() => {
    defaultZoom.current = camera.zoom;
    targetZoomRef.current = camera.zoom;
  }, [camera]);

  const handleSatelliteClick = (
    data: { name: string; details: string; object: THREE.Group },
    config: SatelliteConfig
  ) => {
    if (!data || !data.object || !data.object.position) {
      console.error("Satellite object or its position is undefined", data);
      return;
    }
    setFocusedSatellite({ config, object: data.object });
    const satPos = data.object.position.clone();
    satellitePositionsRef.current.set(data.object, satPos);
    const currentOffset = new THREE.Vector3().copy(camera.position).sub(satPos);
    const closeUpOffset = currentOffset.clone().normalize().multiplyScalar(3);
    offsetRef.current.copy(currentOffset);
    targetOffsetRef.current = closeUpOffset;
    targetZoomRef.current = 1; // desired zoom level (adjust as needed)
    isZoomingRef.current = true;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
      setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }, 500);
    }
  };

  const handleControlsChange = () => {
    if (focusedSatellite && !isZoomingRef.current) {
      const satPos = focusedSatellite.object.position.clone();
      offsetRef.current.copy(camera.position).sub(satPos);
      targetOffsetRef.current = offsetRef.current.clone();
    }
  };

  useFrame(() => {
    if (focusedSatellite && targetOffsetRef.current) {
      let satPos = satellitePositionsRef.current.get(focusedSatellite.object);
      if (!satPos) {
        satPos = focusedSatellite.object.position.clone();
        satellitePositionsRef.current.set(focusedSatellite.object, satPos);
      } else {
        satPos.copy(focusedSatellite.object.position);
      }
      // Update live position for the overlay.
      setFocusedPosition(satPos.clone());
      const lerpFactor = isZoomingRef.current ? 0.1 : 0.05;
      offsetRef.current.lerp(targetOffsetRef.current, lerpFactor);
      const desiredPos = new THREE.Vector3().copy(satPos).add(offsetRef.current);
      camera.position.lerp(desiredPos, lerpFactor * 2);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(satPos, lerpFactor * 2);
      }
      camera.zoom += (targetZoomRef.current - camera.zoom) * lerpFactor * 2;
      camera.updateProjectionMatrix();
      if (
        isZoomingRef.current &&
        Math.abs(camera.zoom - targetZoomRef.current) < 0.05 &&
        offsetRef.current.distanceTo(targetOffsetRef.current) < 0.05
      ) {
        setTimeout(() => {
          isZoomingRef.current = false;
        }, 200);
      }
    } else if (!focusedSatellite) {
      camera.zoom += (defaultZoom.current - camera.zoom) * 0.1;
      camera.updateProjectionMatrix();
      if (satellitePositionsRef.current.size > 0) {
        satellitePositionsRef.current.clear();
      }
      setFocusedPosition(null);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <group>
        <Earth />
        {satellites.map((sat, index) => (
          <React.Fragment key={index}>
            <Satellite
              orbitRadius={sat.orbitRadius}
              speed={sat.speed}
              name={sat.name}
              details={sat.details}
              scale={sat.scale}
              initialTheta={sat.initialTheta}
              modelUrl={sat.modelUrl}
              onClick={(data) => handleSatelliteClick(data, sat)}
            />
            <OrbitTrajectory orbitRadius={sat.orbitRadius} color={sat.trajectoryColor || 'white'} />
          </React.Fragment>
        ))}
      </group>
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        onChange={handleControlsChange}
        enableDamping={true}
        dampingFactor={0.15}
        rotateSpeed={0.5}
      />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
    </>
  );
};

export default SceneContent;
