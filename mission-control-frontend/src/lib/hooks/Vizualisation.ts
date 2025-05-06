/**
 * Visualization React Hooks
 * Custom hooks for working with spacecraft telemetry visualization
 */

import { useState, useEffect, useCallback } from 'react';
import { visualizationService } from '../services/visualizationService';
import type {
  SpacecraftInfo,
  LatestTelemetryPoint,
  TimeSeriesPoint,
  TrajectoryPoint,
  StatisticsData,
  HourlyAverage,
  TrajectoryWithPrediction,
  DashboardDataViz,
  AggregatedTimeSeriesPoint,
  VisualizationParams
} from '../services/visualizationService';

// Hook for available spacecraft
export const useAvailableSpacecraft = () => {
  const [spacecraft, setSpacecraft] = useState<SpacecraftInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSpacecraft = async () => {
      try {
        setLoading(true);
        const data = await visualizationService.getAvailableSpacecraft();
        setSpacecraft(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchSpacecraft();
  }, []);

  return { spacecraft, loading, error };
};

// Hook for latest telemetry
export const useLatestTelemetry = (spacecraftId: number, refreshInterval = 5000) => {
  const [telemetry, setTelemetry] = useState<LatestTelemetryPoint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLatestTelemetry = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getLatestTelemetry(spacecraftId);
      setTelemetry(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId]);

  useEffect(() => {
    fetchLatestTelemetry();
    
    // Set up periodic refresh
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchLatestTelemetry, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchLatestTelemetry, refreshInterval]);

  return { telemetry, loading, error, refetch: fetchLatestTelemetry };
};

// Hook for parameter time series
export const useParameterTimeSeries = (
  spacecraftId: number, 
  parameter: string,
  params?: Pick<VisualizationParams, 'startTime' | 'endTime'>,
  refreshInterval = 0  // 0 means no auto-refresh
) => {
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeSeries = useCallback(async () => {
    if (!spacecraftId || !parameter) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getParameterTimeSeries(spacecraftId, parameter, params);
      setTimeSeries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, parameter, params]);

  useEffect(() => {
    fetchTimeSeries();
    
    // Set up periodic refresh if requested
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchTimeSeries, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchTimeSeries, refreshInterval]);

  return { timeSeries, loading, error, refetch: fetchTimeSeries };
};

// Hook for multi-parameter time series
export const useMultiParameterTimeSeries = (
  spacecraftId: number, 
  parameters: string[],
  params?: Pick<VisualizationParams, 'startTime' | 'endTime'>,
  refreshInterval = 0
) => {
  const [timeSeriesData, setTimeSeriesData] = useState<Record<string, TimeSeriesPoint[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMultiTimeSeries = useCallback(async () => {
    if (!spacecraftId || !parameters.length) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getMultiParameterTimeSeries(spacecraftId, parameters, params);
      setTimeSeriesData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, parameters, params]);

  useEffect(() => {
    fetchMultiTimeSeries();
    
    // Set up periodic refresh if requested
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchMultiTimeSeries, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchMultiTimeSeries, refreshInterval]);

  return { timeSeriesData, loading, error, refetch: fetchMultiTimeSeries };
};

// Hook for aggregated time series
export const useAggregatedTimeSeries = (
  spacecraftId: number,
  parameter: string,
  interval: VisualizationParams['interval'] = 'hour',
  params?: Pick<VisualizationParams, 'startTime' | 'endTime'>
) => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedTimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAggregatedData = useCallback(async () => {
    if (!spacecraftId || !parameter) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getAggregatedTimeSeries(spacecraftId, parameter, interval, params);
      setAggregatedData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, parameter, interval, params]);

  useEffect(() => {
    fetchAggregatedData();
  }, [fetchAggregatedData]);

  return { aggregatedData, loading, error, refetch: fetchAggregatedData };
};

// Hook for trajectory visualization data
export const useTrajectoryVisualization = (
  spacecraftId: number,
  params?: Pick<VisualizationParams, 'startTime' | 'endTime' | 'maxPoints'>,
  refreshInterval = 0
) => {
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrajectoryData = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getTrajectoryVisualizationData(spacecraftId, params);
      setTrajectoryData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, params]);

  useEffect(() => {
    fetchTrajectoryData();
    
    // Set up periodic refresh if requested
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchTrajectoryData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchTrajectoryData, refreshInterval]);

  return { trajectoryData, loading, error, refetch: fetchTrajectoryData };
};

// Hook for trajectory with prediction
export const useTrajectoryWithPrediction = (
  spacecraftId: number,
  predictionPoints?: number
) => {
  const [trajectoryPrediction, setTrajectoryPrediction] = useState<TrajectoryWithPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrajectoryPrediction = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getTrajectoryWithPrediction(spacecraftId, predictionPoints);
      setTrajectoryPrediction(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, predictionPoints]);

  useEffect(() => {
    fetchTrajectoryPrediction();
  }, [fetchTrajectoryPrediction]);

  return { trajectoryPrediction, loading, error, refetch: fetchTrajectoryPrediction };
};

// Hook for spacecraft statistics
export const useSpacecraftStatistics = (spacecraftId: number) => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getSpacecraftStatistics(spacecraftId);
      setStatistics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
};

// Hook for hourly averages
export const useHourlyAverages = (
  spacecraftId: number,
  startTime?: string
) => {
  const [hourlyData, setHourlyData] = useState<HourlyAverage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHourlyAverages = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getHourlyAverages(spacecraftId, startTime);
      setHourlyData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, startTime]);

  useEffect(() => {
    fetchHourlyAverages();
  }, [fetchHourlyAverages]);

  return { hourlyData, loading, error, refetch: fetchHourlyAverages };
};

// Hook for dashboard data
export const useDashboardData = (
  spacecraftId: number,
  refreshInterval = 10000 // 10 seconds refresh by default
) => {
  const [dashboardData, setDashboardData] = useState<DashboardDataViz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getDashboardDataViz(spacecraftId);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchDashboardData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchDashboardData, refreshInterval]);

  return { dashboardData, loading, error, refetch: fetchDashboardData };
};