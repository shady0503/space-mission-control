/**
 * Operator Service
 * Functions for managing operators
 */

import apiClient from "../api/apiClient";
import { API_CONFIG } from "../api/config";
import { Operator } from "./missionService";

export const operatorService = {
  /**
   * Get the current operator
   * @returns Current operator
   */
  getCurrentOperator: async (): Promise<Operator> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/operator/current`);
  },

  /**
   * Get all missions for the current operator
   * @returns List of missions
   */
  getOperatorMissions: async (): Promise<any[]> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/operator/missions`);
  },

  /**
   * Get a specific operator by ID
   * @param id Operator ID
   * @returns Operator details
   */
  getOperator: async (id: number): Promise<Operator> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.MISSIONS.BASE}/operator/${id}`);
  },

  /**
   * Get all operators (admin only)
   * @returns List of all operators
   */
  getAllOperators: async (enterpriseId: string): Promise<Operator[]> => {
    return apiClient.get(`http://localhost:8080/api/operator/enterprise/${enterpriseId}`);
  },

  getTeamMembers: async (operatorId: number): Promise<any[]> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.OPERATOR.TEAM_MEMBERS}`);
  },

  getOperatorById: async (id: number): Promise<Operator> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.OPERATOR.ID}/${id}`);
  },

    updateOperatorRole: async (missionId: number ,operatorId: number, role: string): Promise<Operator> => {
      console.log("payload: " +
JSON.stringify(        {
  missionId,
  operatorId,
  role,
})
      )
      return apiClient.put(`${API_CONFIG.ENDPOINTS.OPERATOR.OPERATOR_ROLE}`, {
        missionId ,
        operatorId,
        role,
      });
  },

  /**
   * search for operators by username or email
   * @param query Search query
   * @returns List of matching operators
   */
  searchOperators: async (query: string): Promise<Operator[]> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.OPERATOR.SEARCH}?searchQuery=${query}`);
  },

  /**
   * Add an operator to an enterprise
   * @param operatorId Operator ID
   * @param enterpriseId Enterprise ID
   * @returns Updated operator details
   */
  addOperatorToEnterprise: async (operatorId: string, enterpriseId: string): Promise<Operator> => {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.OPERATOR.ADD_TO_ENTERPRISE}?enterpriseId=${enterpriseId}&operatorId=${operatorId}`);
  }

};

export default operatorService;