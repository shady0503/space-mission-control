// Earth.tsx
'use client';

import React, { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Earth: React.FC = () => {
  const [colorMap, normalMap, specularMap, cloudMap] = useTexture([
    '/textures/earth_daymap.jpg',
    '/textures/earth_normal_map.jpg',
    '/textures/earth_specular_map.jpg',
    '/textures/earth_clouds.jpg',
  ]);

  const groupRef = useRef<THREE.Group>(null);
  const rotationSpeed = (2 * Math.PI) / 86164;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial map={colorMap} specularMap={specularMap} normalMap={normalMap} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.03, 64, 64]} />
        <meshLambertMaterial map={cloudMap} transparent opacity={0.4} depthWrite={true} />
      </mesh>
    </group>
  );
};

export default Earth;
