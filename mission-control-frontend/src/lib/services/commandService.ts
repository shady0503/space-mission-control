/**
 * Command Service
 * Functions for managing spacecraft commands
 */

import apiClient from "../api/apiClient";
import { Spacecraft } from "./missionService";
import { API_CONFIG } from "../api/config";

export type CommandType = "LAUNCH" | "ADJUST_TRAJECTORY" | "SHUTDOWN" | "EMERGENCY_STOP";

export interface CommandRequest {
  spacecraftId: string;
  commandType: CommandType;
  operatorId: string;
  payload: Record<string, unknown>;  // Flexible payload structure
}

export interface CommandResponse {
  id: string;
  commandType: CommandType;
  operatorId: string;
  payload: string;  // JSON string
  status: boolean;
  createdAt: string;
  executedAt: string | null;
}

export const commandService = {
  /**
   * Get all commands for the current operator
   * @returns List of commands
   */
  getOperatorCommands: async (): Promise<CommandResponse[]> => {
    return apiClient.get(`/api/commands`);
  },
  
  /**
   * Get a specific command by ID
   * @param id Command ID
   * @returns Command details
   */
  getCommand: async (id: string): Promise<CommandResponse> => {
    return apiClient.get(`/api/commands/${id}`);
  },

  /**
   * Execute a command by ID
   * @param commandId Command ID to execute
   * @returns Executed command with updated status and executedAt
   */
  executeCommand: async (commandId: string): Promise<CommandResponse> => {
    return apiClient.put(`/api/commands/execute/${commandId}`);
  },
  
  /**
   * Issue a new command
   * @param command Command request data
   * @returns Created command
   */
  issueCommand: async (command: CommandRequest): Promise<CommandResponse> => {
    return apiClient.post(API_CONFIG.ENDPOINTS.COMMANDS.BASE, command);
  },
  
  /**
   * Get commands for a specific spacecraft
   * @param spacecraft Spacecraft
   * @returns List of commands
   */
  getSpacecraftCommands: async (spacecraftId: string): Promise<CommandResponse[]> => {
    return apiClient.get(`/api/commands/spacecraft/${spacecraftId}`);
  },
  
  /**
   * Get commands for a specific mission
   * @param mission Mission
   * @returns List of commands
   */
  getMissionCommands: async (missionId: string): Promise<CommandResponse[]> => {
    return apiClient.get(`/api/commands/mission/${missionId}`);
  }
};

export default commandService;