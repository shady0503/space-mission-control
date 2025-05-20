/**
 * Spacecraft Service
 * Functions for managing spacecraft
 */

import { detach } from "@react-three/fiber/dist/declarations/src/core/utils";
import apiClient from "../api/apiClient";
import { API_CONFIG } from "../api/config";
import { Mission, Spacecraft } from "./missionService";

export interface SpacecraftParams {
  missionId?: number;
  spacecraftType?: "SATELLITE" | "ROVER";
  page?: number;
  size?: number;
}

export const spacecraftService = {
  /**
   * Get all spacecraft with optional filtering
   * @param params Query parameters
   * @returns List of spacecraft
   */
  getAllSpacecraft: async (enterpriseId: String): Promise<Spacecraft[]> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SPACECRAFT.BY_ENTERPRISE}/${enterpriseId}`);
  },

  getAvailableMissions: async (id: string): Promise<Mission[]> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.SPACECRAFT.MISSION + "/" + id);
  },

  checkSatelliteExists: async (satelliteId: number): Promise<boolean> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.SPACECRAFT.BASE + "/" + satelliteId + "/exists");
  },
  
  

  getSpacecraftByMission: async (id: string): Promise<Spacecraft[]> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.SPACECRAFT.MISSION + "/"  + id);
  },
  
  /**
   * Get a specific spacecraft by ID
   * @param id Spacecraft ID
   * @returns Spacecraft details
   */
  getSpacecraft: async (id: string): Promise<Spacecraft> => {
    return apiClient.get(`/api/spacecraft/${id}`);
  },
  
  /**
   * Create a new spacecraft
   * @param spacecraft Spacecraft data
   * @returns Created spacecraft
   */
  createSpacecraft: async (spacecraft: Partial<Spacecraft>): Promise<Spacecraft> => {
    alert(JSON.stringify(spacecraft))
    return apiClient.post(`/api/spacecraft`, spacecraft);
  },
  
  /**
   * Update an existing spacecraft
   * @param spacecraft Updated spacecraft data
   * @returns Updated spacecraft
   */
  updateSpacecraft: async (spacecraft: Spacecraft): Promise<Spacecraft> => {
    return apiClient.put(`/api/spacecraft/${spacecraft.id}`, spacecraft);
  },

  getSpacecraftByExternalId: async (externalId: number, enterpriseId: string): Promise<Spacecraft> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.SPACECRAFT.BY_EXTERNAL_ID + externalId+ "?enterpriseId="+enterpriseId);
  },

  detachSpacecraft: async (id: number, missionId: number): Promise<Spacecraft> => {
    console.log("detaching spacecraft", id, missionId);
    alert("detaching spacecraft" + id + missionId)
    return apiClient.put(API_CONFIG.ENDPOINTS.SPACECRAFT.DETACH, { id, missionId });
  },
  
  /**
   * Delete a spacecraft
   * @param spacecraft Spacecraft to delete
   * @returns Deletion result
   */
  deleteSpacecraft: async (spacecraft: Spacecraft): Promise<void> => {
    return apiClient.delete(`/api/spacecraft`, { data: spacecraft });
  }
};

export default spacecraftService;