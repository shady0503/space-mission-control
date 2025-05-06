/**
 * Visualization Service
 * Functions for accessing telemetry visualization data
 */

import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

export interface VisualizationParams {
  startTime?: string;
  endTime?: string;
  maxPoints?: number;
  predictionPoints?: number;
  parameter?: string;
  parameters?: string[];
  interval?: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface TrajectoryPoint {
  timestamp: string;
  position: number[];
  geo?: number[];
  velocity: number;
}

export interface StatisticsData {
  timeRange: {
    first: string;
    last: string;
    durationHours: number;
  };
  dataPoints: number;
  velocity: {
    min: number;
    max: number;
    avg: number;
  };
  acceleration: {
    min: number;
    max: number;
    avg: number;
  };
  altitude?: {
    min: number;
    max: number;
    avg: number;
  };
  last24h?: {
    points: number;
    avgVelocity: number;
  };
}

export interface LatestTelemetryPoint {
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
    total: number;
  };
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  attitude: {
    azimuth: number;
    elevation: number;
    declination: number;
    rightAscension: number;
  };
  acceleration: number;
  orbitRadius: number;
  timestamp: string;
}

export interface TrajectoryWithPrediction {
  actual: Array<{
    timestamp: string;
    position: number[];
    geo?: number[];
  }>;
  shortTermPrediction: Array<{
    timestamp: string;
    latitude: number;
    longitude: number;
    altitude: number;
    isFullOrbit: boolean;
  }>;
  fullOrbitPrediction: Array<{
    timestamp: string;
    latitude: number;
    longitude: number;
    altitude: number;
    isFullOrbit: boolean;
  }>;
}

export interface SpacecraftInfo {
  id: string;
  externalId: number;
  externalName: string;
  missionId: string;
  enterpriseId: string;
  type: string;
  displayName: string;
  commands: any[];
}

export interface Mission {
  id: string;
  enterpriseId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export const visualizationService = {
  /**
   * Get latest telemetry point for a spacecraft
   * 
   * @param externalId Spacecraft external ID
   * @returns Latest telemetry data
   */
  getLatestTelemetry: async (externalId: number): Promise<LatestTelemetryPoint> => {
    const url = API_CONFIG.ENDPOINTS.VISUALIZATION.LATEST.replace('{externalId}', String(externalId));
    return apiClient.get(url);
  },

  /**
   * Get time series data for a specific parameter
   * 
   * @param externalId Spacecraft external ID
   * @param parameter Parameter name (e.g., 'velocity', 'acceleration')
   * @param params Optional parameters (start/end time)
   * @returns Time series data
   */
  getParameterTimeSeries: async (
    externalId: number,
    parameter: string,
    params?: Pick<VisualizationParams, 'startTime' | 'endTime'>
  ): Promise<TimeSeriesPoint[]> => {
    const url = API_CONFIG.ENDPOINTS.VISUALIZATION.TIMESERIES.replace('{externalId}', String(externalId));
    return apiClient.get(url, {
      params: {
        parameter,
        ...params
      }
    });
  },

  /**
   * Get multiple parameter time series for comparison charts
   * 
   * @param externalId Spacecraft external ID
   * @param parameters Array of parameter names
   * @param params Optional parameters (start/end time)
   * @returns Map of parameter names to time series data
   */
  getMultiParameterTimeSeries: async (
    externalId: number,
    parameters: string[],
    params?: Pick<VisualizationParams, 'startTime' | 'endTime'>
  ): Promise<Record<string, TimeSeriesPoint[]>> => {
    const url = API_CONFIG.ENDPOINTS.VISUALIZATION.MULTI_TIMESERIES.replace('{externalId}', String(externalId));
    return apiClient.get(url, {
      params: {
        parameters: parameters.join(','),
        ...params
      }
    });
  },

  /**
   * Get trajectory data for 3D visualization
   * 
   * @param externalId Spacecraft external ID
   * @param params Optional parameters (start/end time, max points)
   * @returns Trajectory points
   */
  getTrajectoryVisualizationData: async (
    externalId: number,
    params?: Pick<VisualizationParams, 'startTime' | 'endTime' | 'maxPoints'>
  ): Promise<TrajectoryPoint[]> => {
    const url = API_CONFIG.ENDPOINTS.VISUALIZATION.TRAJECTORY.replace('{externalId}', String(externalId));
    return apiClient.get(url, { params });
  },

  /**
   * Get trajectory with prediction data
   * 
   * @param externalId Spacecraft external ID
   * @param predictionPoints Number of points to use for prediction
   * @returns Trajectory and prediction data
   */
  getTrajectoryWithPrediction: async (
    externalId: number,
    predictionPoints?: number
  ): Promise<TrajectoryWithPrediction> => {
    const url = API_CONFIG.ENDPOINTS.VISUALIZATION.TRAJECTORY_PREDICTION.replace('{externalId}', String(externalId));
    return apiClient.get(url, {
      params: predictionPoints ? { predictionPoints } : undefined
    });
  },

  /**
   * Get statistical information for a spacecraft
   * 
   * @param externalId Spacecraft external ID
   * @returns Statistical data
   */
  getSpacecraftStatistics: async (externalId: number): Promise<StatisticsData> => {
    const url = API_CONFIG.ENDPOINTS.VISUALIZATION.STATISTICS.replace('{externalId}', String(externalId));
    return apiClient.get(url);
  }
};

export default visualizationService;