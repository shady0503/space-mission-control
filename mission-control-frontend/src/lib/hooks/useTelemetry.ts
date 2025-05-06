'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '../api/config';
import { useWebSocket } from './useWebsocket';

// Types for the new telemetry API format
export interface GeoPosition {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface CartesianPosition {
  x: number;
  y: number;
  z: number;
}

export interface VelocityVector {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

export interface CurrentTelemetry {
  geo: GeoPosition;
  position: CartesianPosition;
  velocity: VelocityVector;
  acceleration: number;
  orbitRadius: number;
  timestamp: number;
}

export interface PredictivePosition {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: number;
  isFullOrbit?: boolean;
}

export interface SatelliteData {
  telemetry: CurrentTelemetry;
  fullOrbitPredictions: PredictivePosition[];
  shortPredictions: PredictivePosition[];
}

export interface TelemetryResponse {
  telemetry: {
    [satId: string]: SatelliteData;
  };
  operatorId: string;
}

// For compatibility with existing components
export interface LegacyTelemetryPosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  rightAscension: number;
  declination: number;
  timestamp: number;
}

/**
 * Custom hook for efficiently handling satellite telemetry data
 */
function useTelemetry() {
  // State
  const [satellites, setSatellites] = useState<string[]>([]);
  const [satelliteData, setSatelliteData] = useState<Map<string, SatelliteData>>(new Map());
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  
  // Debug state to help diagnose update issues
  const [updateCounter, setUpdateCounter] = useState<number>(0);
  
  // Refs to prevent dependency cycles
  const satellitesRef = useRef<string[]>([]);
  const satelliteDataRef = useRef<Map<string, SatelliteData>>(new Map());
  const lastDataHashRef = useRef<string>('');
  
  // Use our WebSocket hook
  const { 
    data: wsData, 
    isConnected,
    connectionStatus,
    error: wsError, 
    lastUpdated: wsLastUpdated,
    reconnect 
  } = useWebSocket<TelemetryResponse>(
    API_CONFIG.ENDPOINTS.TELEMETRY.LIVE,
    // Parse the WebSocket message into the expected format
    (message) => {
      try {
        if (typeof message === 'string') {
          return JSON.parse(message);
        }
        return message;
      } catch (e) {
        console.error('Error parsing telemetry message:', e);
        return null;
      }
    }
  );
  
  // Calculate a simple hash of the telemetry data to detect real changes
  const calculateDataHash = useCallback((data: TelemetryResponse): string => {
    if (!data || !data.telemetry) return '';
    
    try {
      // Get all satellite IDs
      const satIds = Object.keys(data.telemetry).sort();
      
      // For each satellite, get the timestamp
      const timestamps = satIds.map(satId => {
        const satData = data.telemetry[satId];
        if (!satData || !satData.telemetry) return `${satId}:0`;
        return `${satId}:${satData.telemetry.timestamp}`;
      });
      
      return timestamps.join(',');
    } catch (e) {
      console.error('Error calculating data hash:', e);
      return '';
    }
  }, []);
  
  // Convert new API format to legacy format for compatibility
  const convertToLegacyPosition = useCallback((telemetry: CurrentTelemetry): LegacyTelemetryPosition => {
    // Calculate azimuth and elevation if they don't exist
    // These are typically calculated based on observer position,
    // but we'll use 0,0,0 as the observer position for simplicity
    
    // Default values
    let azimuth = 0;
    let elevation = 0;
    
    // Position vector
    const position = new Array(telemetry.position.x, telemetry.position.y, telemetry.position.z);
    
    // Calculate elevation (angle above horizon)
    const radius = Math.sqrt(position[0]**2 + position[1]**2 + position[2]**2);
    elevation = 90 - Math.acos(position[2] / radius) * 180 / Math.PI;
    
    // Calculate azimuth (compass direction)
    azimuth = Math.atan2(position[1], position[0]) * 180 / Math.PI;
    if (azimuth < 0) azimuth += 360;
    
    return {
      satlatitude: telemetry.geo.latitude,
      satlongitude: telemetry.geo.longitude,
      sataltitude: telemetry.geo.altitude,
      azimuth: azimuth,
      elevation: elevation,
      rightAscension: 0,  // Not provided in new API
      declination: 0,     // Not provided in new API
      timestamp: telemetry.timestamp
    };
  }, []);
  
  // Process WebSocket data when it arrives
  useEffect(() => {
    if (!wsData || !wsData.telemetry) return;
    
    // Check if there's actual new data
    const dataHash = calculateDataHash(wsData);
    if (dataHash === lastDataHashRef.current) {
      console.log('[useTelemetry] No new telemetry data detected, skipping update');
      return;
    }
    
    console.log('[useTelemetry] Processing new telemetry data with hash', dataHash);
    lastDataHashRef.current = dataHash;
    
    // Update operator ID
    if (wsData.operatorId) {
      setOperatorId(wsData.operatorId);
    }
    
    // Process satellite data
    const newSatelliteData = new Map<string, SatelliteData>();
    const satIds = new Set<string>();
    
    Object.entries(wsData.telemetry).forEach(([satId, data]) => {
      // Skip empty or invalid data
      if (!data || !data.telemetry) {
        console.warn(`[useTelemetry] No telemetry data for satellite ${satId}`);
        return;
      }
      
      console.log(`[useTelemetry] Processing satellite ${satId} data`);
      
      // Validate the telemetry data
      if (
        !data.telemetry.geo ||
        !data.telemetry.position ||
        !data.telemetry.velocity ||
        typeof data.telemetry.timestamp !== 'number'
      ) {
        console.warn(`[useTelemetry] Invalid telemetry data for satellite ${satId}`);
        return;
      }
      
      // Store the satellite data
      newSatelliteData.set(satId, {
        telemetry: data.telemetry,
        fullOrbitPredictions: Array.isArray(data.fullOrbitPredictions) ? data.fullOrbitPredictions : [],
        shortPredictions: Array.isArray(data.shortPredictions) ? data.shortPredictions : []
      });
      
      satIds.add(satId);
      
      console.log(`[useTelemetry] Updated satellite ${satId} data:`, {
        fullOrbit: data.fullOrbitPredictions?.length || 0,
        shortPredictions: data.shortPredictions?.length || 0
      });
    });
    
    // Update state
    const newSatellitesArray = Array.from(satIds);
    
    console.log(`[useTelemetry] Updating state with ${newSatellitesArray.length} satellites and ${newSatelliteData.size} data entries`);
    
    // Update refs first
    satelliteDataRef.current = newSatelliteData;
    satellitesRef.current = newSatellitesArray;
    
    // Then update state
    setSatelliteData(newSatelliteData);
    setSatellites(newSatellitesArray);
    setLastUpdateTime(Date.now());
    setUpdateCounter(prev => prev + 1);
    
    console.log('[useTelemetry] State update complete');
  }, [wsData, calculateDataHash, convertToLegacyPosition]); 

  // Sync state to refs to maintain consistent access to latest values
  useEffect(() => {
    satellitesRef.current = satellites;
  }, [satellites]);
  
  useEffect(() => {
    satelliteDataRef.current = satelliteData;
  }, [satelliteData]);
  
  // Debug logging for updates
  useEffect(() => {
    if (updateCounter > 0) {
      console.log(`[useTelemetry] Update #${updateCounter} completed at ${new Date(lastUpdateTime).toISOString()}`);
      console.log(`[useTelemetry] Available satellites:`, satellitesRef.current);
    }
  }, [updateCounter, lastUpdateTime]);
  
  /**
   * Get data for a specific satellite
   */
  const getSatelliteData = useCallback((satId: string): SatelliteData | null => {
    const data = satelliteDataRef.current.get(satId);
    if (!data) {
      return null;
    }
    
    // Log when data is accessed for debugging
    console.log(`[useTelemetry] Retrieving data for satellite ${satId}`);
    
    return data;
  }, []);
  
  /**
   * Force a refresh of the telemetry data
   */
  const refreshTelemetry = useCallback(() => {
    console.log('[useTelemetry] Manually refreshing telemetry data');
    reconnect();
  }, [reconnect]);
  
  /**
   * Get the latest position for a satellite in legacy format
   */
  const getLatestPosition = useCallback((satId: string): LegacyTelemetryPosition | null => {
    const data = satelliteDataRef.current.get(satId);
    if (!data || !data.telemetry || !data.telemetry.geo) {
      return null;
    }
    
    const legacyPosition = convertToLegacyPosition(data.telemetry);
    
    console.log(`[useTelemetry] Latest position for satellite ${satId}:`, {
      lat: legacyPosition.satlatitude,
      lon: legacyPosition.satlongitude,
      alt: legacyPosition.sataltitude,
      time: new Date(legacyPosition.timestamp).toISOString()
    });
    
    return legacyPosition;
  }, [convertToLegacyPosition]);
  
  /**
   * Get the latest prediction for a satellite
   */
  const getLatestPrediction = useCallback((satId: string): PredictivePosition | null => {
    const data = satelliteDataRef.current.get(satId);
    if (!data) {
      return null;
    }
    
    // Check short predictions first
    if (data.shortPredictions && data.shortPredictions.length > 0) {
      const latest = data.shortPredictions.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      );
      
      console.log(`[useTelemetry] Latest short prediction for satellite ${satId}:`, {
        lat: latest.latitude,
        lon: latest.longitude,
        alt: latest.altitude,
        time: new Date(latest.timestamp).toISOString()
      });
      
      return latest;
    }
    
    // Fall back to full orbit predictions
    if (data.fullOrbitPredictions && data.fullOrbitPredictions.length > 0) {
      const latest = data.fullOrbitPredictions.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      );
      
      console.log(`[useTelemetry] Latest orbit prediction for satellite ${satId}:`, {
        lat: latest.latitude,
        lon: latest.longitude,
        alt: latest.altitude,
        time: new Date(latest.timestamp).toISOString()
      });
      
      return latest;
    }
    
    return null;
  }, []);
  
  /**
   * Get the raw telemetry data
   */
  const getCurrentTelemetry = useCallback((satId: string): CurrentTelemetry | null => {
    const data = satelliteDataRef.current.get(satId);
    if (!data || !data.telemetry) {
      return null;
    }
    
    return data.telemetry;
  }, []);
  
  // Return the hook API
  return {
    satellites,
    isConnected,
    connectionStatus,
    error: wsError,
    lastUpdated: lastUpdateTime,
    updateCount: updateCounter,
    operatorId,
    getSatelliteData,
    getLatestPosition,
    getLatestPrediction,
    getCurrentTelemetry,
    refreshTelemetry
  };
}

export default useTelemetry;