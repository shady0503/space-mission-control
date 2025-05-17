/**
 * Mission Service
 * Functions for managing missions
 */

import { use } from "react";
import apiClient from "../api/apiClient";
import { API_CONFIG } from "../api/config";
import { useAuth } from "../hooks";

export interface Mission {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: boolean;
  createdAt: string;
  missionOperators: MissionOperator[];
  operators: Operator[];
  spacecrafts: Spacecraft[];
}

export interface MissionOperator {
  id: number;
  role: "ADMIN" | "VIEWER";
  assignedAt: string;
  operator?: Operator;
}

export interface Operator {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  missionOperators: number[];
  missions: number[];
}

export interface Spacecraft {
  id: number;
  spacecraftId: number;
  spacecraftName: string;
  spacecraftType: "SATELLITE" | "ROVER";
  name: string | null;
  orbitRadius: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  acceleration: number;
}

export interface MissionParams {
  status?: boolean;
  page?: number;
  size?: number;
}

export interface MissionCreateParams {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: boolean;
  enterpriseId?: string;
}

export const missionService = {
  /**
   * Get all missions with optional filtering
   * @param params Query parameters
   * @param operatorId Current operator ID
   * @returns List of missions
   */
  getMissions: async (params?: MissionParams, operatorId?: string): Promise<Mission[]> => {
    const url = operatorId 
      ? `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}?operatorId=${operatorId}`
      : API_CONFIG.ENDPOINTS.MISSIONS.BASE;
    
    return apiClient.get(url, { params });
  },

  /**
   * Get a specific mission by ID
   * @param missionId Mission ID
   * @param operatorId Current operator ID
   * @returns Mission details
   */
  getMission: async (missionId: number, operatorId?: string): Promise<Mission> => {
    const url = operatorId 
      ? `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}?operatorId=${operatorId}`
      : `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}`;
    
    return apiClient.get(url);
  },

  /**
   * Create a new mission
   * @param missionData Mission data
   * @param operatorId Current operator ID
   * @returns Created mission
   */
  createMission: async (missionData: MissionCreateParams, operatorId?: string): Promise<Mission> => {
    const url = operatorId 
      ? `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}?operatorId=${operatorId}`
      : API_CONFIG.ENDPOINTS.MISSIONS.BASE;
    
    return apiClient.post(url, missionData);
  },

  /**
   * Update an existing mission
   * @param missionData Updated mission data
   * @param operatorId Current operator ID
   * @returns Updated mission
   */
  updateMission: async (missionData: Mission, operatorId: string): Promise<Mission> => {
    return apiClient.put(
      `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionData.id}?operatorId=${operatorId}`,
      missionData
    );
  },

  /**
   * Delete a mission
   * @param missionId Mission ID to delete
   * @param operatorId Current operator ID
   * @returns Deletion result
   */
  deleteMission: async (missionId: number, operatorId: string): Promise<void> => {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}?operatorId=${operatorId}`
    );
  },

  /**
   * Get operators for a mission
   * @param missionId Mission ID
   * @param operatorId Current operator ID
   * @returns List of operators
   */
  getMissionOperators: async (missionId: number, operatorId?: string): Promise<Operator[]> => {
    const url = operatorId 
      ? `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}/operators?operatorId=${operatorId}`
      : `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}/operators`;
    
    return apiClient.get(url);
  },

  /**
   * Assign an operator to a mission
   * @param missionId Mission ID
   * @param operatorId Operator ID to assign
   * @param adminOperatorId Admin operator making the change
   * @param role Role (ADMIN or VIEWER)
   * @returns Assignment result
   */
  upsertOperator: async (missionId: string, operatorId: string, adminOperatorId: string, role?: "ADMIN" | "VIEWER"): Promise<void> => {
    const endpoint = `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}/operators?operatorId=${operatorId}&adminOperatorId=${adminOperatorId}`;
    const url = role ? `${endpoint}&role=${role}` : endpoint;
    await apiClient.put(url);
  },
  
};

export default missionService;