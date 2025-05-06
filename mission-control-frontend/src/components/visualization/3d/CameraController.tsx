import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';

interface CameraControllerProps {
  targetPosition: THREE.Vector3;
  isFocused: boolean;
  defaultPosition: THREE.Vector3;
  defaultLookAt: THREE.Vector3;
  offset: THREE.Vector3;
}

const CameraController: React.FC<CameraControllerProps> = ({
  targetPosition,
  isFocused,
  defaultPosition,
  defaultLookAt,
  offset,
}) => {
  const { camera } = useThree();
  const [spring, api] = useSpring(() => ({
    pos: [camera.position.x, camera.position.y, camera.position.z],
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  useEffect(() => {
    if (isFocused && targetPosition) {
      const newPos = new THREE.Vector3().copy(targetPosition).add(offset);
      api.start({ pos: newPos.toArray() });
    } else {
      api.start({ pos: defaultPosition.toArray() });
    }
  }, [isFocused, targetPosition, api, defaultPosition, offset]);

  useFrame(() => {
    const pos = spring.pos.get();
    camera.position.set(pos[0], pos[1], pos[2]);
    if (isFocused && targetPosition) {
      camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
    } else {
      camera.lookAt(defaultLookAt.x, defaultLookAt.y, defaultLookAt.z);
    }
  });

  return null;
};

export default CameraController;
