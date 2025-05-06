'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneContent from './SceneContent';
import * as THREE from 'three';
import useTelemetry from '@/lib/hooks/useTelemetry';

export interface SatelliteConfig {
  name: string;
  details: string;
  scale: number;
  modelUrl: string;
  satId: string;
}

const Scene: React.FC = () => {
  const [focusedSatellite, setFocusedSatellite] = useState<null | { config: SatelliteConfig; object: THREE.Group }>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use telemetry hook
  const { 
    satellites, 
    error, 
    connectionStatus, 
    lastUpdated, 
    isConnected,
    updateCount
  } = useTelemetry();
  
  // Handle window resize to toggle sidebar and mobile state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsSidebarOpen(true);
        setIsMobile(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Utility functions to generate satellite configuration
  const getSatelliteName = (satId: string): string => `Satellite ${satId}`;
  const getSatelliteModel = (satId: string): string => '/assets/satellites/ISS.glb';
  const getSatelliteScale = (satId: string): number => 0.005;

  // Generate satellite configuration based on available telemetry
  const visibleSatellites: SatelliteConfig[] = satellites.map((satId) => ({
    name: getSatelliteName(satId),
    details: `Telemetry data for satellite ${satId}`,
    scale: getSatelliteScale(satId),
    modelUrl: getSatelliteModel(satId),
    satId: satId,
  }));

  console.log(`Rendering scene with ${visibleSatellites.length} visible satellites`, 
              { satellites, updateCount, connectionStatus });

  // Simple loading state when no satellites are available
  const isLoading = satellites.length === 0 && connectionStatus !== 'disconnected';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading Satellite Visualization</h2>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-400">Connecting to telemetry server...</p>
          {error && <p className="mt-2 text-red-400">Error: {error.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-screen transition-all duration-300 ${isSidebarOpen && !isMobile ? '' : 'lg:pl-20'}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded">
        <div>Satellites: {visibleSatellites.length}</div>
        <div>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>
        <div>Status: {connectionStatus}</div>
        {error && <div className="text-red-400">Error: {error.message}</div>}
      </div>
      
      <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
        <SceneContent 
          satellites={visibleSatellites}
          focusedSatellite={focusedSatellite} 
          setFocusedSatellite={setFocusedSatellite} 
          isFocused={isFocused} 
          setIsFocused={setIsFocused} 
        />
      </Canvas>
      
      {visibleSatellites.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
          <div className="text-center px-4 py-3 rounded bg-black bg-opacity-80">
            <h2 className="text-xl mb-2">No Satellite Data Available</h2>
            <p>Connection status: {connectionStatus}</p>
            {error && <p className="text-red-400 mt-2">{error.message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scene;