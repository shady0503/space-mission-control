import { useThree, useFrame } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';
import { useEffect } from 'react';
import * as THREE from 'three';

interface CameraControllerProps {
  targetPosition: THREE.Vector3 | null;
  isFocused: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({ targetPosition, isFocused }) => {
  const { camera } = useThree();

  const [spring, api] = useSpring(() => ({
    from: {
      posX: camera.position.x,
      posY: camera.position.y,
      posZ: camera.position.z,
    },
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  useEffect(() => {
    if (isFocused && targetPosition) {
      // Offset the camera a bit for a better view of the satellite
      const newPos = {
        posX: targetPosition.x + 2,
        posY: targetPosition.y + 2,
        posZ: targetPosition.z + 2,
      };
      api.start(newPos);
    }
  }, [targetPosition, isFocused, api]);

  useFrame(() => {
    camera.position.set(spring.posX.get(), spring.posY.get(), spring.posZ.get());
    if (targetPosition) {
      camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
    } else {
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

export default CameraController;
