'use client';
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Earth from './Earth';
import Satellite from './Satellite';
import TelemetryPath from './TelemetryPath';
import * as THREE from 'three';

export interface SatelliteConfig {
  name: string;
  details: string;
  scale: number;
  modelUrl: string;
  satId: string;
}

interface FocusedSatellite {
  config: SatelliteConfig;
  object: THREE.Group;
}

interface SceneContentProps {
  satellites: SatelliteConfig[];
  focusedSatellite: FocusedSatellite | null;
  setFocusedSatellite: (sat: FocusedSatellite | null) => void;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
}

const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const SceneContent: React.FC<SceneContentProps> = ({
  satellites,
  focusedSatellite,
  setFocusedSatellite,
  isFocused,
  setIsFocused,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const animationRef = useRef({
    active: false,
    startTime: 0,
    duration: 5.0,
    fromPosition: new THREE.Vector3(),
    toPosition: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    fromZoom: 1,
    toZoom: 1,
    onComplete: () => {}
  });

  const satelliteRefs = useRef<Map<string, THREE.Group>>(new Map());
  const registerSatellite = (name: string, object: THREE.Group) => {
    satelliteRefs.current.set(name, object);
  };

  const calculateOptimalCameraPosition = (satPosition: THREE.Vector3): THREE.Vector3 => {
    const direction = satPosition.clone().normalize();
    const distanceToSat = satPosition.length();
    const offsetDistance = distanceToSat * 0.5;
    return direction.multiplyScalar(distanceToSat + offsetDistance);
  };

  const animateCameraToSatellite = (satellite: THREE.Group) => {
    if (!controlsRef.current) return;
    const satPosition = satellite.position.clone();
    const targetCameraPosition = calculateOptimalCameraPosition(satPosition);
    const currentPosition = camera.position.clone();
    const currentTarget = controlsRef.current.target.clone();
    animationRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 1.8,
      fromPosition: currentPosition,
      toPosition: targetCameraPosition,
      fromTarget: currentTarget,
      toTarget: satPosition,
      fromZoom: camera.zoom,
      toZoom: 1.0,
      onComplete: () => {
        animationRef.current.active = false;
        if (controlsRef.current) {
          controlsRef.current.target.copy(satPosition);
          controlsRef.current.update();
        }
      }
    };
  };

  const focusOnSatellite = (
    data: { name: string; details: string; object: THREE.Group },
    config: SatelliteConfig
  ) => {
    setFocusedSatellite({ config, object: data.object });
    setIsFocused(true);
    registerSatellite(config.name, data.object);
    animateCameraToSatellite(data.object);
  };

  const resetView = () => {
    if (!controlsRef.current) return;
    const currentPosition = camera.position.clone();
    const currentTarget = controlsRef.current.target.clone();
    const defaultPosition = new THREE.Vector3(0, 8, 25);
    const defaultTarget = new THREE.Vector3(0, 0, 0);
    animationRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 1.5,
      fromPosition: currentPosition,
      toPosition: defaultPosition,
      fromTarget: currentTarget,
      toTarget: defaultTarget,
      fromZoom: camera.zoom,
      toZoom: 1,
      onComplete: () => {
        animationRef.current.active = false;
        setFocusedSatellite(null);
        setIsFocused(false);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      }
    };
  };

  const handlePointerDown = (e: any) => {
    if (e.button === 2) {
      resetView();
    }
  };

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.15;
      controlsRef.current.enableZoom = true;
      controlsRef.current.zoomSpeed = 0.4;
      controlsRef.current.minDistance = 2;
      controlsRef.current.maxDistance = 1000;
      controlsRef.current.rotateSpeed = 0.3;
      controlsRef.current.minPolarAngle = 0;
      controlsRef.current.maxPolarAngle = Math.PI;
      controlsRef.current.autoRotate = false;
    }
  }, [isFocused]);

  const starsConfig = useMemo(() => ({
    radius: 200,
    depth: 60,
    count: 5000,
    factor: 4,
    saturation: 0,
    fade: true
  }), []);

  useFrame((_, delta) => {
    if (animationRef.current.active) {
      const anim = animationRef.current;
      const elapsedTime = (performance.now() - anim.startTime) / 1000;
      const progress = Math.min(elapsedTime / anim.duration, 1);
      const easedProgress = easeInOutQuad(progress);
      camera.position.lerpVectors(anim.fromPosition, anim.toPosition, easedProgress);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(anim.fromTarget, anim.toTarget, easedProgress);
      }
      camera.zoom = anim.fromZoom + (anim.toZoom - anim.fromZoom) * easedProgress;
      camera.updateProjectionMatrix();
      if (progress >= 1) {
        anim.onComplete();
      }
    }
    if (isFocused && focusedSatellite && !animationRef.current.active) {
      const satPosition = focusedSatellite.object.position;
      if (satPosition && controlsRef.current) {
        controlsRef.current.target.lerp(satPosition, 0.05);
      }
    }
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <group onPointerDown={handlePointerDown}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <Earth />
      {satellites.map((sat) => (
        <React.Fragment key={sat.satId}>
          {sat.satId && (
            <TelemetryPath
              satelliteId={sat.satId}
              showStatus={true}
            />
          )}
          <Satellite
            name={sat.name}
            details={sat.details}
            scale={sat.scale}
            modelUrl={sat.modelUrl}
            satelliteId={sat.satId}
            showStatus={true}
            onClick={(data) => focusOnSatellite(data, sat)}
          />
        </React.Fragment>
      ))}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0, 0]}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        screenSpacePanning={true}
      />
      <Stars {...starsConfig} />
    </group>
  );
};

export default SceneContent;