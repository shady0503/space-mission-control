/**
 * Telemetry Service
 * Functions for accessing telemetry data
 */

import { Inter_Tight } from 'next/font/google';
import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';
import { Interface } from 'readline';
import { Telemetry } from 'next/dist/telemetry/storage';

export interface TelemetryParams {
  satelliteId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface TelemetrySummaryDTO {
  spacecraftId: number;
  spacecraftName: string;
  currentPosition: {
    x: number;
    y: number;
    z: number;
  };
  currentVelocity: number;
  currentOrbitRadius: number;
  totalDataPointsLast24h: number;
  averageSystemVelocity: number;
  spacecraftWithTelemetryCount: number;
}

export interface TelemetrySummaryProps {
  data?: TelemetrySummaryDTO;
  spacecraftId?: number;
}

export const telemetryService = {
  /**
   * Get current telemetry for a satellite
   * @param satelliteId Satellite ID
   * @returns Current telemetry data
   */
  getCurrentTelemetry: async (satelliteId: string): Promise<any> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.TELEMETRY.VISUALITION.BASE}/${satelliteId}/latest`);
  },
  
  /**
   * Get historical telemetry data
   * @param params Query parameters
   * @returns Historical telemetry data
   */
  getHistoricalTelemetry: async (params: TelemetryParams): Promise<any> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.TELEMETRY.HISTORICAL, { params });
  },
  
  /**
   * Get telemetry statistics
   * @param satelliteId Satellite ID
   * @returns Telemetry statistics
   */
  getTelemetryStats: async (satelliteId: number): Promise<any> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.TELEMETRY.BASE}/${satelliteId}/stats`);
  },
  
  /**
   * Get anomalies detected in telemetry
   * @param params Query parameters
   * @returns Anomaly data
   */
  getAnomalies: async (params: TelemetryParams): Promise<any> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.TELEMETRY.BASE}/anomalies`, { params });
  },
};