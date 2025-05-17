/**
 * Visualization React Hooks
 * Custom hooks for working with spacecraft telemetry visualization
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { visualizationService } from '../services/visualizationService';
import { useWebSocket } from './useWebsocket';
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

// Hook for latest telemetry with WebSocket support
export const useLatestTelemetry = (
  spacecraftId: number, 
  useWebSocketUpdates = true, 
  refreshInterval = useWebSocketUpdates ? 0 : 5000
) => {
  const [telemetry, setTelemetry] = useState<LatestTelemetryPoint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Define WebSocket endpoint and parser
  const wsEndpoint = `/ws/telemetry`;
  
  // Initialize WebSocket connection if enabled
  const ws = useWebSocketUpdates 
    ? useWebSocket<LatestTelemetryPoint>(
        wsEndpoint,
        visualizationService.parseTelemetryWebsocketMessage,
        { spacecraftId: spacecraftId.toString() }
      )
    : null;

  // Effect to update state when WebSocket data is received
  useEffect(() => {
    if (ws?.data && useWebSocketUpdates) {
      setTelemetry(ws.data);
      setLastUpdated(Date.now());
      setLoading(false);
      setError(null);
      console.log('[useLatestTelemetry] Updated via WebSocket:', ws.data);
    }
  }, [ws?.data, useWebSocketUpdates]);

  // Effect to handle WebSocket errors
  useEffect(() => {
    if (ws?.error && useWebSocketUpdates) {
      console.error('[useLatestTelemetry] WebSocket error:', ws.error);
      setError(ws.error);
    }
  }, [ws?.error, useWebSocketUpdates]);

  // Function to fetch telemetry via REST API
  const fetchLatestTelemetry = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getLatestTelemetry(spacecraftId);
      console.log('[useLatestTelemetry] Fetched via REST API:', data);
      setTelemetry(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error('[useLatestTelemetry] REST API error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId]);

  // Initial fetch and polling setup (if WebSocket is not used)
  useEffect(() => {
    // Always fetch once initially, even if using WebSocket
    fetchLatestTelemetry();
    
    // Set up periodic refresh only if WebSocket is not used and refreshInterval > 0
    if (!useWebSocketUpdates && refreshInterval > 0) {
      const intervalId = setInterval(fetchLatestTelemetry, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchLatestTelemetry, useWebSocketUpdates, refreshInterval]);

  return { 
    telemetry, 
    loading, 
    error, 
    lastUpdated,
    refetch: fetchLatestTelemetry,
    wsStatus: useWebSocketUpdates ? ws?.connectionStatus : null
  };
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
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchTimeSeries = useCallback(async () => {
    if (!spacecraftId || !parameter) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getParameterTimeSeries(spacecraftId, parameter, params);
      console.log(`[useParameterTimeSeries] Fetched data for ${parameter}:`, data);
      setTimeSeries(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error(`[useParameterTimeSeries] Error fetching ${parameter}:`, err);
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

  return { timeSeries, loading, error, lastUpdated, refetch: fetchTimeSeries };
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
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchMultiTimeSeries = useCallback(async () => {
    if (!spacecraftId || !parameters.length) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getMultiParameterTimeSeries(spacecraftId, parameters, params);
      console.log(`[useMultiParameterTimeSeries] Fetched data for ${parameters.join(', ')}:`, data);
      setTimeSeriesData(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error(`[useMultiParameterTimeSeries] Error:`, err);
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

  return { timeSeriesData, loading, error, lastUpdated, refetch: fetchMultiTimeSeries };
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
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchAggregatedData = useCallback(async () => {
    if (!spacecraftId || !parameter) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getAggregatedTimeSeries(spacecraftId, parameter, interval, params);
      console.log(`[useAggregatedTimeSeries] Fetched aggregated data for ${parameter}:`, data);
      setAggregatedData(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error(`[useAggregatedTimeSeries] Error:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, parameter, interval, params]);

  useEffect(() => {
    fetchAggregatedData();
  }, [fetchAggregatedData]);

  return { aggregatedData, loading, error, lastUpdated, refetch: fetchAggregatedData };
};

// Hook for trajectory visualization data with optional WebSocket support
export const useTrajectoryVisualization = (
  spacecraftId: number,
  useWebSocketUpdates = false,
  params?: Pick<VisualizationParams, 'startTime' | 'endTime' | 'maxPoints'>,
  refreshInterval = useWebSocketUpdates ? 0 : 5000
) => {
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Initialize WebSocket connection if enabled
  const ws = useWebSocketUpdates 
    ? useWebSocket<TrajectoryPoint[]>(
        '/ws/trajectory',
        (data) => {
          console.log('[useTrajectoryVisualization] Parsing WebSocket data:', data);
          if (data.data) return data.data;
          if (data.payload) return data.payload;
          return data;
        },
        { spacecraftId: spacecraftId.toString() }
      )
    : null;

  // Effect to update state when WebSocket data is received
  useEffect(() => {
    if (ws?.data && useWebSocketUpdates) {
      setTrajectoryData(ws.data);
      setLastUpdated(Date.now());
      setLoading(false);
      setError(null);
      console.log('[useTrajectoryVisualization] Updated via WebSocket:', ws.data);
    }
  }, [ws?.data, useWebSocketUpdates]);

  // Effect to handle WebSocket errors
  useEffect(() => {
    if (ws?.error && useWebSocketUpdates) {
      console.error('[useTrajectoryVisualization] WebSocket error:', ws.error);
      setError(ws.error);
    }
  }, [ws?.error, useWebSocketUpdates]);

  const fetchTrajectoryData = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getTrajectoryVisualizationData(spacecraftId, params);
      console.log('[useTrajectoryVisualization] Fetched via REST API:', data);
      setTrajectoryData(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error('[useTrajectoryVisualization] REST API error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, params]);

  useEffect(() => {
    // Always fetch once initially, even if using WebSocket
    fetchTrajectoryData();
    
    // Set up periodic refresh only if WebSocket is not used and refreshInterval > 0
    if (!useWebSocketUpdates && refreshInterval > 0) {
      const intervalId = setInterval(fetchTrajectoryData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchTrajectoryData, useWebSocketUpdates, refreshInterval]);

  return { 
    trajectoryData, 
    loading, 
    error, 
    lastUpdated, 
    refetch: fetchTrajectoryData,
    wsStatus: useWebSocketUpdates ? ws?.connectionStatus : null
  };
};

// Hook for trajectory with prediction
export const useTrajectoryWithPrediction = (
  spacecraftId: number,
  predictionPoints?: number
) => {
  const [trajectoryPrediction, setTrajectoryPrediction] = useState<TrajectoryWithPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchTrajectoryPrediction = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getTrajectoryWithPrediction(spacecraftId, predictionPoints);
      console.log('[useTrajectoryWithPrediction] Fetched data:', data);
      setTrajectoryPrediction(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error('[useTrajectoryWithPrediction] Error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, predictionPoints]);

  useEffect(() => {
    fetchTrajectoryPrediction();
  }, [fetchTrajectoryPrediction]);

  return { trajectoryPrediction, loading, error, lastUpdated, refetch: fetchTrajectoryPrediction };
};

// Hook for spacecraft statistics
export const useSpacecraftStatistics = (spacecraftId: number) => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchStatistics = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getSpacecraftStatistics(spacecraftId);
      console.log('[useSpacecraftStatistics] Fetched data:', data);
      setStatistics(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error('[useSpacecraftStatistics] Error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, lastUpdated, refetch: fetchStatistics };
};

// Hook for hourly averages
export const useHourlyAverages = (
  spacecraftId: number,
  startTime?: string
) => {
  const [hourlyData, setHourlyData] = useState<HourlyAverage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchHourlyAverages = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getHourlyAverages(spacecraftId, startTime);
      console.log('[useHourlyAverages] Fetched data:', data);
      setHourlyData(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error('[useHourlyAverages] Error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId, startTime]);

  useEffect(() => {
    fetchHourlyAverages();
  }, [fetchHourlyAverages]);

  return { hourlyData, loading, error, lastUpdated, refetch: fetchHourlyAverages };
};

// Hook for dashboard data with WebSocket support
export const useDashboardData = (
  spacecraftId: number,
  useWebSocketUpdates = true,
  refreshInterval = useWebSocketUpdates ? 0 : 10000 // 10 seconds refresh by default if not using WebSocket
) => {
  const [dashboardData, setDashboardData] = useState<DashboardDataViz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Initialize WebSocket connection if enabled
  const ws = useWebSocketUpdates 
    ? useWebSocket<DashboardDataViz>(
        '/ws/dashboard',
        (data) => {
          console.log('[useDashboardData] Parsing WebSocket data:', data);
          if (data.data) return data.data;
          if (data.payload) return data.payload;
          return data;
        },
        { spacecraftId: spacecraftId.toString() }
      )
    : null;

  // Effect to update state when WebSocket data is received
  useEffect(() => {
    if (ws?.data && useWebSocketUpdates) {
      setDashboardData(ws.data);
      setLastUpdated(Date.now());
      setLoading(false);
      setError(null);
      console.log('[useDashboardData] Updated via WebSocket:', ws.data);
    }
  }, [ws?.data, useWebSocketUpdates]);

  // Effect to handle WebSocket errors
  useEffect(() => {
    if (ws?.error && useWebSocketUpdates) {
      console.error('[useDashboardData] WebSocket error:', ws.error);
      setError(ws.error);
    }
  }, [ws?.error, useWebSocketUpdates]);

  const fetchDashboardData = useCallback(async () => {
    if (!spacecraftId) return;
    
    try {
      setLoading(true);
      const data = await visualizationService.getDashboardDataViz(spacecraftId);
      console.log('[useDashboardData] Fetched via REST API:', data);
      setDashboardData(data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error('[useDashboardData] REST API error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [spacecraftId]);

  useEffect(() => {
    // Always fetch once initially, even if using WebSocket
    fetchDashboardData();
    
    // Set up periodic refresh only if WebSocket is not used and refreshInterval > 0
    if (!useWebSocketUpdates && refreshInterval > 0) {
      const intervalId = setInterval(fetchDashboardData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchDashboardData, useWebSocketUpdates, refreshInterval]);

  return { 
    dashboardData, 
    loading, 
    error, 
    lastUpdated, 
    refetch: fetchDashboardData,
    wsStatus: useWebSocketUpdates ? ws?.connectionStatus : null
  };
};