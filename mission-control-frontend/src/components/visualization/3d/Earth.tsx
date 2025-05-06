'use client';
import React, { useRef, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;

const Earth: React.FC = () => {
  const [colorMap, normalMap, specularMap, cloudMap] = useTexture([
    '/textures/earth_daymap.jpg',
    '/textures/earth_normal_map.jpg',
    '/textures/earth_specular_map.jpg',
    '/textures/earth_clouds.jpg',
  ]);

  const rotationGroupRef = useRef<THREE.Group>(null);
  const rotationSpeed = (2 * Math.PI) / 86164; // one sidereal day

  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: colorMap,
      normalMap: normalMap,
      specularMap: specularMap,
      specular: new THREE.Color(0x333333),
      shininess: 25,
      reflectivity: 0.1,
    });
  }, [colorMap, normalMap, specularMap]);

  const cloudMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
  }, [cloudMap]);

  useFrame((_, delta) => {
    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  return (
    <group>
      <group ref={rotationGroupRef}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[EARTH_RADIUS_KM * SCALE, 64, 64]} />
          <primitive object={earthMaterial} attach="material" />
        </mesh>
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.01, 64, 64]} />
          <primitive object={cloudMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
};

export default React.memo(Earth);
