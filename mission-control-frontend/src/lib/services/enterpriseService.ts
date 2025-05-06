// src/api/enterpriseService.ts

import apiClient from "../api/apiClient";
import { API_CONFIG } from "../api/config";

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

export interface Enterprise {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  operators?: Operator[];
  spacecraft?: Spacecraft[];
  missions?: number[];
}

export interface EnterpriseCreateParams {
  name: string;
  description?: string;
}

export interface EnterpriseUpdateParams {
  id: number;
  name?: string;
  description?: string;
}

export const enterpriseService = {
  /**
   * List all enterprises
   */
  getEnterprises: async (): Promise<Enterprise[]> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ENTERPRISE.GET_ALL);
  },

  /**
   * Get a single enterprise by ID
   */
  getEnterprise: async (enterpriseId: number): Promise<Enterprise> => {
    return apiClient.get(
      API_CONFIG.ENDPOINTS.ENTERPRISE.GET_ONE.replace("{id}", enterpriseId.toString())
    );
  },

  /**
   * Create a new enterprise
   */
  createEnterprise: async (
    data: EnterpriseCreateParams
  ): Promise<Enterprise> => {
    return apiClient.post(API_CONFIG.ENDPOINTS.ENTERPRISE.CREATE, data);
  },

  /**
   * Update an existing enterprise
   */
  updateEnterprise: async (
    enterpriseId: number,
    data: EnterpriseUpdateParams
  ): Promise<Enterprise> => {
    return apiClient.put(
      API_CONFIG.ENDPOINTS.ENTERPRISE.UPDATE.replace("{id}", enterpriseId.toString()),
      data
    );
  },

  /**
   * Delete an enterprise
   */
  deleteEnterprise: async (enterpriseId: number): Promise<void> => {
    return apiClient.delete(
      API_CONFIG.ENDPOINTS.ENTERPRISE.DELETE.replace("{id}", enterpriseId.toString())
    );
  },

  /**
   * Get all operators under an enterprise
   */
  getEnterpriseOperators: async (
    enterpriseId: number
  ): Promise<Operator[]> => {
    return apiClient.get(
      API_CONFIG.ENDPOINTS.ENTERPRISE.OPERATORS.replace("{id}", enterpriseId.toString())
    );
  },

  /**
   * Get all spacecraft under an enterprise
   */
  getEnterpriseSpacecraft: async (
    enterpriseId: number
  ): Promise<Spacecraft[]> => {
    return apiClient.get(
      API_CONFIG.ENDPOINTS.ENTERPRISE.SPACECRAFT.replace("{id}", enterpriseId.toString())
    );
  },

  /**
   * Get all missions under an enterprise
   */
  getEnterpriseMissions: async (
    enterpriseId: number
  ): Promise<number[]> => {
    return apiClient.get(
      API_CONFIG.ENDPOINTS.ENTERPRISE.MISSIONS.replace("{id}", enterpriseId.toString())
    );
  },
};

export default enterpriseService;
