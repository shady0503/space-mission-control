/**
 * Command Service
 * Functions for managing spacecraft commands
 */

import apiClient from "../api/apiClient";
import { Mission, Spacecraft } from "./missionService";
import { API_CONFIG } from "../api/config";

export interface Command {
  id: number;
  spacecraft: Spacecraft;
  operator: any;
  commandType: "LAUNCH" | "ADJUST_TRAJECTORY" | "SHUTDOWN" | "EMERGENCY_STOP";
  payload: Record<string, any>;
  status: boolean;
  createdAt: string;
  executedAt: string | null;
}

export const commandService = {
  /**
   * Get all commands for the current operator
   * @returns List of commands
   */
  getOperatorCommands: async (): Promise<Command[]> => {
    return apiClient.get(`/api/commands`);
  },
  
  /**
   * Get a specific command by ID
   * @param id Command ID
   * @returns Command details
   */
  getCommand: async (id: number): Promise<Command> => {
    return apiClient.get(`/api/commands/${id}`);
  },
  
  /**
   * Issue a new command
   * @param command Command data
   * @returns Created command
   */
  issueCommand: async (command: Partial<Command>): Promise<Command> => {
    return apiClient.post(API_CONFIG.ENDPOINTS.COMMANDS.BASE, command);
  },
  
  /**
   * Execute a pending command
   * @param command Command to execute
   * @returns Executed command
   */
  executeCommand: async (command: Command): Promise<Command> => {
    return apiClient.put(`/api/commands/execute`, command);
  },
  
  /**
   * Get commands for a specific spacecraft
   * @param spacecraft Spacecraft
   * @returns List of commands
   */
  getSpacecraftCommands: async (spacecraftId: string): Promise<Command[]> => {
    return apiClient.get(`/api/commands/spacecraft/${spacecraftId}`, );
  },
  
  /**
   * Get commands for a specific mission
   * @param mission Mission
   * @returns List of commands
   */
  getMissionCommands: async (missionId: string): Promise<Command[]> => {
    return apiClient.get(`/api/commands/mission/`+missionId, )}
  
};

export default commandService;