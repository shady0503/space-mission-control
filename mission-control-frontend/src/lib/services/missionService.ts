/**
 * Mission Service
 * Functions for managing missions
 */

import apiClient from "../api/apiClient";
import { API_CONFIG } from "../api/config";

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
}

export const missionService = {
  /**
   * Get all missions with optional filtering
   * @param params Query parameters
   * @returns List of missions
   */
  getMissions: async (params?: MissionParams): Promise<Mission[]> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.MISSIONS.BASE, { params });
  },

  

  /**
   * Get a specific mission by ID
   * @param missionId Mission ID
   * @returns Mission details
   */
  getMission: async (missionId: number): Promise<Mission> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}`);
  },

  /**
   * Create a new mission
   * @param missionData Mission data
   * @returns Created mission
   */
  createMission: async (missionData: MissionCreateParams): Promise<Mission> => {
    return apiClient.post(API_CONFIG.ENDPOINTS.MISSIONS.BASE, missionData);
  },

  /**
   * Update an existing mission
   * @param missionData Updated mission data
   * @returns Updated mission
   */
  updateMission: async (missionData: Mission): Promise<Mission> => {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/update`,
      missionData
    );
  },

  /**
   * Delete a mission
   * @param mission Mission to delete
   * @returns Deletion result
   */
  deleteMission: async (mission: Mission): Promise<void> => {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/delete`,
      { id: mission.id }
    );
  },

  /**
   * Get operators for a mission
   * @param missionId Mission ID
   * @returns List of operators
   */
  getMissionOperators: async (missionId: number): Promise<Operator[]> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}/operators`);
  },

  /**
   * Assign an operator to a mission
   * @param missionId Mission ID
   * @param operatorId Operator ID
   * @param role Role (ADMIN or VIEWER)
   * @returns Assignment result
   */
  assignOperator: async (missionId: number, operatorId: number, role: "ADMIN" | "VIEWER"): Promise<void> => {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}/operators`, {
      operatorId,
      role
    });
  },

  /**
   * Remove an operator from a mission
   * @param missionId Mission ID
   * @param operatorId Operator ID
   * @returns Removal result
   */
  removeOperator: async (missionId: number, operatorId: number): Promise<void> => {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/${missionId}/operators/${operatorId}`);
  }
  
};

export default missionService;