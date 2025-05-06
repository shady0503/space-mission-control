'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

export default function MarsTerrain() {
  const mountRef = useRef(null);

  useEffect(() => {
    let moveForward = false,
      moveBackward = false,
      moveLeft = false,
      moveRight = false;
    let yaw = 0,
      pitch = 0;
    const eyeHeight = 2;
    const speed = 50;
    let isLocked = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, eyeHeight, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: absolute;
      top: 50%;
      width: 100%;
      text-align: center;
      font-family: sans-serif;
      color: #fff;
      font-size: 24px;
      user-select: none;
      cursor: pointer;
      z-index: 100;
    `;
    instructions.innerHTML = 'Click to Play';
    document.body.appendChild(instructions);

    instructions.addEventListener('click', () => {
      document.body.requestPointerLock();
    });

    const pointerLockChange = () => {
      isLocked = document.pointerLockElement === document.body;
      instructions.style.display = isLocked ? 'none' : '';
    };
    document.addEventListener('pointerlockchange', pointerLockChange);

    document.addEventListener('mousemove', (event) => {
      if (!isLocked) return;
      yaw -= event.movementX * 0.002;
      pitch -= event.movementY * 0.002;
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
      camera.rotation.set(pitch, yaw, 0);
    });

    const onKeyDown = (event) => {
      if (event.code === 'KeyW') moveForward = true;
      if (event.code === 'KeyS') moveBackward = true;
      if (event.code === 'KeyA') moveLeft = true;
      if (event.code === 'KeyD') moveRight = true;
    };

    const onKeyUp = (event) => {
      if (event.code === 'KeyW') moveForward = false;
      if (event.code === 'KeyS') moveBackward = false;
      if (event.code === 'KeyA') moveLeft = false;
      if (event.code === 'KeyD') moveRight = false;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    const generateHeight = (width, height) => {
      const size = width * height;
      const data = new Float32Array(size);
      const perlin = new ImprovedNoise();
      let quality = 1;
      const z = Math.random() * 100;

      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < size; i++) {
          const x = i % width;
          const y = ~~(i / width);
          data[i] += perlin.noise(x / quality, y / quality, z) * quality;
        }
        quality *= 5;
      }

      return data;
    };

    const terrainWidth = 256;
    const terrainDepth = 256;
    const planeSize = 1000;
    const data = generateHeight(terrainWidth, terrainDepth);
    const geometry = new THREE.PlaneGeometry(
      planeSize,
      planeSize,
      terrainWidth - 1,
      terrainDepth - 1
    );
    geometry.rotateX(-Math.PI / 2);
    const vertices = geometry.attributes.position.array;

    for (let i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
      vertices[i + 1] = data[j] * 2.5;
    }

    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({ color: 0xcc5500 });
    const terrainMesh = new THREE.Mesh(geometry, material);
    scene.add(terrainMesh);

    const raycaster = new THREE.Raycaster();
    const clock = new THREE.Clock();

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isLocked) {
        const direction = new THREE.Vector3();
        if (moveForward) direction.z -= 1;
        if (moveBackward) direction.z += 1;
        if (moveLeft) direction.x -= 1;
        if (moveRight) direction.x += 1;

        if (direction.lengthSq() > 0) {
          direction.normalize();
          const sin = Math.sin(yaw);
          const cos = Math.cos(yaw);
          const dx = direction.x * cos - direction.z * sin;
          const dz = direction.x * sin + direction.z * cos;
          camera.position.x += dx * speed * delta;
          camera.position.z += dz * speed * delta;
        }

        raycaster.set(new THREE.Vector3(camera.position.x, 1000, camera.position.z), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(terrainMesh);
        if (intersects.length > 0) {
          camera.position.y = intersects[0].point.y + eyeHeight;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('pointerlockchange', pointerLockChange);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.body.removeChild(instructions);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
}
