/**
 * Satellite Service
 * Functions for managing satellites
 */

import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

export interface SatelliteParams {
  missionId?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'DECOMMISSIONED';
  type?: string;
  page?: number;
  size?: number;
}

export const satelliteService = {
  /**
   * Get all satellites with optional filtering
   * @param params Query parameters
   * @returns List of satellites
   */
  getSatellites: async (params?: SatelliteParams): Promise<any> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.SATELLITES.BASE, { params });
  },
  
  /**
   * Get a specific satellite by ID
   * @param satelliteId Satellite ID
   * @returns Satellite details
   */
  getSatellite: async (satelliteId: number): Promise<any> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SATELLITES.BASE}/${satelliteId}`);
  },
  
  /**
   * Get satellite status
   * @param satelliteId Satellite ID
   * @returns Satellite status
   */
  getSatelliteStatus: async (satelliteId: number): Promise<any> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SATELLITES.STATUS}/${satelliteId}`);
  },
  
  /**
   * Update satellite configuration
   * @param satelliteId Satellite ID
   * @param configData Configuration data
   * @returns Updated satellite configuration
   */
  updateSatelliteConfig: async (satelliteId: number, configData: any): Promise<any> => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.SATELLITES.BASE}/${satelliteId}/config`, configData);
  },
  
  /**
   * Send command to satellite
   * @param satelliteId Satellite ID
   * @param command Command data
   * @returns Command result
   */
  sendCommand: async (satelliteId: number, command: any): Promise<any> => {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.SATELLITES.BASE}/${satelliteId}/command`, command);
  },
  
  /**
   * Update satellite metadata
   * @param satelliteId Satellite ID
   * @param metadata Metadata
   * @returns Updated satellite
   */
  updateMetadata: async (satelliteId: number, metadata: any): Promise<any> => {
    return apiClient.patch(`${API_CONFIG.ENDPOINTS.SATELLITES.BASE}/${satelliteId}/metadata`, metadata);
  },
  
  /**
   * Get satellite telemetry history
   * @param satelliteId Satellite ID
   * @param params Query parameters
   * @returns Telemetry history
   */
  getTelemetryHistory: async (satelliteId: number, params?: { startDate?: string; endDate?: string; limit?: number }): Promise<any> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SATELLITES.BASE}/${satelliteId}/telemetry/history`, { params });
  },
  
  /**
   * Get satellite orbital parameters
   * @param satelliteId Satellite ID
   * @returns Orbital parameters
   */
  getOrbitalParameters: async (satelliteId: number): Promise<any> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SATELLITES.BASE}/${satelliteId}/orbit`);
  },
  
  /**
   * Update satellite orbital parameters
   * @param satelliteId Satellite ID
   * @param orbitalData Orbital data
   * @returns Updated orbital parameters
   */
  updateOrbitalParameters: async (satelliteId: number, orbitalData: any): Promise<any> => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.SATELLITES.BASE}/${satelliteId}/orbit`, orbitalData);
  }
};