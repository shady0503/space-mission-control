'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, ArrowUp, ArrowDown, ArrowRight, Globe, Rocket, Clock, Satellite, RotateCw, Calendar, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { visualizationService, LatestTelemetryPoint, TimeSeriesPoint, TrajectoryPoint, StatisticsData } from '@/lib/services/visualizationService';

interface SatelliteDataDisplayProps {
  spacecraftId: number;
  refreshInterval?: number; // in milliseconds
}

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds

// Helper function to format dates
const formatDate = (date: string | number | Date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format large numbers with SI prefixes
const formatValue = (value: number, unit: string = '') => {
  if (value === undefined || value === null) return 'N/A';
  
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)} G${unit}`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)} M${unit}`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)} k${unit}`;
  return `${value.toFixed(2)} ${unit}`;
};

// Calculate altitude in km
const calculateAltitude = (orbitRadius: number) => {
  const EARTH_RADIUS = 6371000; // meters
  return (orbitRadius - EARTH_RADIUS) / 1000; // km
};

// Parameter color scheme
const PARAMETER_COLORS = {
  velocity: '#3B82F6',
  acceleration: '#EF4444',
  altitude: '#10B981',
  orbitRadius: '#8B5CF6',
  latitude: '#F97316',
  longitude: '#EC4899',
  velocityX: '#4F46E5',
  velocityY: '#7C3AED',
  velocityZ: '#2563EB',
  positionX: '#059669',
  positionY: '#0D9488',
  positionZ: '#0891B2'
};

const SatelliteDataDisplay: React.FC<SatelliteDataDisplayProps> = ({ 
  spacecraftId, 
  refreshInterval = DEFAULT_REFRESH_INTERVAL 
}) => {
  // State for data
  const [latestTelemetry, setLatestTelemetry] = useState<LatestTelemetryPoint | null>(null);
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<Record<string, TimeSeriesPoint[]>>({});
  
  // State for UI
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    latest: false,
    trajectory: false,
    statistics: false,
    timeSeries: false
  });
  const [error, setError] = useState<{[key: string]: string | null}>({
    latest: null,
    trajectory: null,
    statistics: null,
    timeSeries: null
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshEnabled, setRefreshEnabled] = useState(true);
  
  // State for filters
  const [selectedParameters, setSelectedParameters] = useState<string[]>([
    'velocity', 
    'acceleration', 
    'altitude'
  ]);
  
  // Telemetry parameters available for selection
  const availableParameters = useMemo(() => [
    { value: 'velocity', label: 'Velocity' },
    { value: 'acceleration', label: 'Acceleration' },
    { value: 'altitude', label: 'Altitude' },
    { value: 'orbitRadius', label: 'Orbit Radius' },
    { value: 'positionX', label: 'Position X' },
    { value: 'positionY', label: 'Position Y' },
    { value: 'positionZ', label: 'Position Z' },
    { value: 'velocityX', label: 'Velocity X' },
    { value: 'velocityY', label: 'Velocity Y' },
    { value: 'velocityZ', label: 'Velocity Z' },
  ], []);

  // Toggle parameter selection
  const toggleParameter = useCallback((param: string) => {
    setSelectedParameters(prev => {
      if (prev.includes(param)) {
        return prev.filter(p => p !== param);
      } else {
        return [...prev, param];
      }
    });
  }, []);

  // Fetch latest telemetry
  const fetchLatestTelemetry = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, latest: true }));
      setError(prev => ({ ...prev, latest: null }));
      const data = await visualizationService.getLatestTelemetry(spacecraftId);
      setLatestTelemetry(data);
    } catch (err) {
      console.error('Error fetching latest telemetry:', err);
      setError(prev => ({ ...prev, latest: 'Failed to fetch latest telemetry' }));
    } finally {
      setLoading(prev => ({ ...prev, latest: false }));
    }
  }, [spacecraftId]);

  // Fetch trajectory data
  const fetchTrajectoryData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, trajectory: true }));
      setError(prev => ({ ...prev, trajectory: null }));
      const data = await visualizationService.getTrajectoryVisualizationData(
        spacecraftId, 
        { maxPoints: 100 }
      );
      setTrajectoryData(data);
    } catch (err) {
      console.error('Error fetching trajectory data:', err);
      setError(prev => ({ ...prev, trajectory: 'Failed to fetch trajectory data' }));
    } finally {
      setLoading(prev => ({ ...prev, trajectory: false }));
    }
  }, [spacecraftId]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, statistics: true }));
      setError(prev => ({ ...prev, statistics: null }));
      const data = await visualizationService.getSpacecraftStatistics(spacecraftId);
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(prev => ({ ...prev, statistics: 'Failed to fetch statistics' }));
    } finally {
      setLoading(prev => ({ ...prev, statistics: false }));
    }
  }, [spacecraftId]);

  // Fetch time series data
  const fetchTimeSeriesData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, timeSeries: true }));
      setError(prev => ({ ...prev, timeSeries: null }));
      
      // Get multiple parameters for comparison
      const parameters = selectedParameters.length > 0 ? selectedParameters : ['velocity', 'acceleration', 'altitude'];
      const data = await visualizationService.getMultiParameterTimeSeries(
        spacecraftId,
        parameters
      );
      setTimeSeriesData(data);
    } catch (err) {
      console.error('Error fetching time series data:', err);
      setError(prev => ({ ...prev, timeSeries: 'Failed to fetch time series data' }));
    } finally {
      setLoading(prev => ({ ...prev, timeSeries: false }));
    }
  }, [spacecraftId, selectedParameters]);

  // Fetch all data
  const fetchAllData = useCallback(() => {
    fetchLatestTelemetry();
    fetchStatistics();
    
    // Fetch data based on active tab to reduce unnecessary requests
    if (activeTab === 'trajectory' || activeTab === 'overview') {
      fetchTrajectoryData();
    }
    
    if (activeTab === 'parameters' || activeTab === 'overview') {
      fetchTimeSeriesData();
    }
  }, [fetchLatestTelemetry, fetchStatistics, fetchTrajectoryData, fetchTimeSeriesData, activeTab]);

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Refresh data at interval
  useEffect(() => {
    if (!refreshEnabled) return;
    
    const intervalId = setInterval(() => {
      fetchLatestTelemetry();
      
      // Only refresh other data if on relevant tabs
      if (activeTab === 'overview') {
        fetchStatistics();
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, refreshEnabled, activeTab, fetchLatestTelemetry, fetchStatistics]);

  // Effect to refresh timeseries when parameters change
  useEffect(() => {
    if (activeTab === 'parameters') {
      fetchTimeSeriesData();
    }
  }, [selectedParameters, activeTab, fetchTimeSeriesData]);

  // Calculate additional values from latest telemetry
  const telemetryMetrics = useMemo(() => {
    if (!latestTelemetry) return null;
    
    const altitude = latestTelemetry.location?.altitude || 
                    (latestTelemetry.orbitRadius ? 
                      calculateAltitude(latestTelemetry.orbitRadius) : null);
    
    const velocity = latestTelemetry.velocity?.total || 
                    (latestTelemetry.velocity?.x && latestTelemetry.velocity?.y && latestTelemetry.velocity?.z ? 
                      Math.sqrt(
                        Math.pow(latestTelemetry.velocity.x, 2) +
                        Math.pow(latestTelemetry.velocity.y, 2) +
                        Math.pow(latestTelemetry.velocity.z, 2)
                      ) / 1000 : null);
    
    return {
      altitude,
      velocity,
      timestamp: latestTelemetry.timestamp ? formatDate(latestTelemetry.timestamp) : 'N/A',
    };
  }, [latestTelemetry]);

  // Format trajectory data for display
  const formattedTrajectoryData = useMemo(() => {
    return trajectoryData.map(point => ({
      timestamp: point.timestamp,
      position: point.position,
      geo: point.geo,
      velocity: point.velocity
    }));
  }, [trajectoryData]);

  // Format time series data for charts
  const formattedChartData = useMemo(() => {
    if (!Object.keys(timeSeriesData).length) return [];

    // Get all unique timestamps
    const allTimestamps = new Set<string>();
    Object.values(timeSeriesData).forEach(points => {
      points.forEach(point => allTimestamps.add(point.timestamp));
    });

    // Sort timestamps chronologically
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Create data points
    return sortedTimestamps.map(timestamp => {
      const dataPoint: any = {
        timestamp,
        time: new Date(timestamp).getTime(),
        formattedTime: formatDate(timestamp)
      };

      // Add values for each parameter
      Object.entries(timeSeriesData).forEach(([param, points]) => {
        const matchingPoint = points.find(p => p.timestamp === timestamp);
        dataPoint[param] = matchingPoint ? matchingPoint.value : null;
      });

      return dataPoint;
    });
  }, [timeSeriesData]);

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    
    // Fetch data for the new tab if not already loaded
    if (value === 'trajectory' && !trajectoryData.length) {
      fetchTrajectoryData();
    } else if (value === 'parameters' && Object.keys(timeSeriesData).length === 0) {
      fetchTimeSeriesData();
    }
  }, [fetchTrajectoryData, fetchTimeSeriesData, trajectoryData.length, timeSeriesData]);

  // Toggle auto-refresh
  const toggleRefresh = useCallback(() => {
    setRefreshEnabled(prev => !prev);
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Overview Tab
  const renderOverview = useCallback(() => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Telemetry */}
        <Card className="bg-[#1a2236] border-[#2a3750]">
          <CardHeader>
            <CardTitle className="text-white">Current Position</CardTitle>
            <CardDescription className="text-gray-400">
              Last updated: {latestTelemetry?.timestamp ? formatDate(latestTelemetry.timestamp) : 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestTelemetry ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                    <p className="text-gray-400 text-xs">Latitude</p>
                    <p className="text-white font-mono">
                      {latestTelemetry.location?.latitude.toFixed(4)}°
                    </p>
                  </div>
                  <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                    <p className="text-gray-400 text-xs">Longitude</p>
                    <p className="text-white font-mono">
                      {latestTelemetry.location?.longitude.toFixed(4)}°
                    </p>
                  </div>
                  <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                    <p className="text-gray-400 text-xs">Altitude</p>
                    <p className="text-white font-mono">
                      {latestTelemetry.location?.altitude.toFixed(2)} km
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                    <p className="text-gray-400 text-xs">Velocity</p>
                    <p className="text-white font-mono">
                      {latestTelemetry.velocity?.total ? (latestTelemetry.velocity.total / 1000).toFixed(2) : "N/A"} km/s
                    </p>
                  </div>
                  <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                    <p className="text-gray-400 text-xs">Acceleration</p>
                    <p className="text-white font-mono">
                      {latestTelemetry.acceleration?.toFixed(2) || "N/A"} m/s²
                    </p>
                  </div>
                  <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                    <p className="text-gray-400 text-xs">Orbit Radius</p>
                    <p className="text-white font-mono">
                      {latestTelemetry.orbitRadius ? (latestTelemetry.orbitRadius / 1000).toFixed(0) : "N/A"} km
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="small" message="Loading position data..." />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Statistics Summary */}
        <Card className="bg-[#1a2236] border-[#2a3750]">
          <CardHeader>
            <CardTitle className="text-white">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400 mb-2 text-sm">Time Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">First Data</p>
                      <p className="text-white">
                        {formatDate(statistics.timeRange.first)}
                      </p>
                    </div>
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Last Data</p>
                      <p className="text-white">
                        {formatDate(statistics.timeRange.last)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-400 mb-2 text-sm">Velocity (m/s)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Min</p>
                      <p className="text-white font-mono">
                        {statistics.velocity.min.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Avg</p>
                      <p className="text-white font-mono">
                        {statistics.velocity.avg.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Max</p>
                      <p className="text-white font-mono">
                        {statistics.velocity.max.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-400 mb-2 text-sm">Data Collection</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Duration</p>
                      <p className="text-white font-mono">
                        {statistics.timeRange.durationHours.toFixed(1)} hours
                      </p>
                    </div>
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Data Points</p>
                      <p className="text-white font-mono">
                        {statistics.dataPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="small" message="Loading statistics..." />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Overview Chart */}
        <Card className="bg-[#1a2236] border-[#2a3750] md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Parameter Overview</CardTitle>
            <Button 
              variant="outline" 
              className="bg-[#2a3750] text-white border-[#3a4760] hover:bg-[#3a4760]"
              onClick={() => setActiveTab('parameters')}
            >
              <ArrowRight className="h-4 w-4 mr-2" /> View Details
            </Button>
          </CardHeader>
          <CardContent>
            {Object.keys(timeSeriesData).length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formattedChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3750" />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#64748b" 
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #1e293b' 
                      }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#f8fafc' }}
                    />
                    <Legend />
                    
                    {Object.keys(timeSeriesData)
                      .filter(param => selectedParameters.includes(param))
                      .map(param => (
                        <Line
                          key={param}
                          type="monotone"
                          dataKey={param}
                          name={param.charAt(0).toUpperCase() + param.slice(1)}
                          stroke={PARAMETER_COLORS[param as keyof typeof PARAMETER_COLORS] || '#3B82F6'}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="medium" message="Loading data..." />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }, [latestTelemetry, statistics, timeSeriesData, formattedChartData, selectedParameters]);

  // Parameters Tab
  const renderParameters = useCallback(() => {
    return (
      <>
        <Card className="bg-[#1a2236] border-[#2a3750] mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Telemetry Parameters</CardTitle>
            <Button 
              variant="outline" 
              className="bg-[#2a3750] text-white border-[#3a4760] hover:bg-[#3a4760]"
              onClick={() => setSelectedParameters(['velocity', 'acceleration', 'altitude'])}
            >
              Reset Selection
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableParameters.map(param => (
                <Badge
                  key={param.value}
                  className={`cursor-pointer transition-all px-3 py-1 ${
                    selectedParameters.includes(param.value)
                      ? 'bg-opacity-100 text-white'
                      : 'bg-opacity-20 text-gray-400'
                  }`}
                  style={{
                    backgroundColor: selectedParameters.includes(param.value)
                      ? PARAMETER_COLORS[param.value as keyof typeof PARAMETER_COLORS]
                      : `${PARAMETER_COLORS[param.value as keyof typeof PARAMETER_COLORS]}20`
                  }}
                  onClick={() => toggleParameter(param.value)}
                >
                  {param.label}
                </Badge>
              ))}
            </div>
            
            {Object.keys(timeSeriesData).length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formattedChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3750" />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#64748b" 
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #1e293b' 
                      }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#f8fafc' }}
                    />
                    <Legend />
                    
                    {Object.keys(timeSeriesData)
                      .filter(param => selectedParameters.includes(param))
                      .map(param => (
                        <Line
                          key={param}
                          type="monotone"
                          dataKey={param}
                          name={param.charAt(0).toUpperCase() + param.slice(1)}
                          stroke={PARAMETER_COLORS[param as keyof typeof PARAMETER_COLORS]}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="medium" message="Loading parameter data..." />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Individual Parameter Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedParameters.map(param => timeSeriesData[param] && (
            <Card key={param} className="bg-[#1a2236] border-[#2a3750]">
              <CardHeader>
                <CardTitle className="text-white">
                  {param.charAt(0).toUpperCase() + param.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timeSeriesData[param].map(point => ({
                        timestamp: point.timestamp,
                        formattedTime: formatDate(point.timestamp),
                        value: point.value
                      }))}
                      margin={{ top: 5, right: 20, left: 5, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3750" />
                      <XAxis 
                        dataKey="formattedTime" 
                        stroke="#64748b" 
                        tick={{ fill: '#94a3b8' }}
                      />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid #1e293b' 
                        }}
                        itemStyle={{ color: '#e2e8f0' }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name={param.charAt(0).toUpperCase() + param.slice(1)}
                        stroke={PARAMETER_COLORS[param as keyof typeof PARAMETER_COLORS]}
                        fill={PARAMETER_COLORS[param as keyof typeof PARAMETER_COLORS]}
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Statistics for this parameter if available */}
                {statistics && (statistics as any)[param] && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Min</p>
                      <p className="text-white font-mono">
                        {(statistics as any)[param].min.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Avg</p>
                      <p className="text-white font-mono">
                        {(statistics as any)[param].avg.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#0f1628] p-3 rounded-lg border border-[#2a3750]">
                      <p className="text-gray-400 text-xs">Max</p>
                      <p className="text-white font-mono">
                        {(statistics as any)[param].max.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }, [timeSeriesData, formattedChartData, selectedParameters, statistics, toggleParameter, availableParameters]);

  // Trajectory Tab
  const renderTrajectory = useCallback(() => {
    return (
      <Card className="bg-[#1a2236] border-[#2a3750]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Trajectory Data Points</CardTitle>
          <Button 
            variant="outline" 
            className="bg-[#2a3750] text-white border-[#3a4760] hover:bg-[#3a4760]"
          >
            <Download className="h-4 w-4 mr-2" /> Export Data
          </Button>
        </CardHeader>
        <CardContent>
          {formattedTrajectoryData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a3750] hover:bg-[#121930]">
                    <TableHead className="text-gray-300">Timestamp</TableHead>
                    <TableHead className="text-gray-300">Position (X, Y, Z)</TableHead>
                    <TableHead className="text-gray-300">Geo (Lat, Long, Alt)</TableHead>
                    <TableHead className="text-gray-300">Velocity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedTrajectoryData.slice(0, 10).map((point, index) => (
                    <TableRow key={index} className="border-[#2a3750] hover:bg-[#121930]">
                      <TableCell className="font-medium text-white">
                        {formatDate(point.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-gray-300">
                        [{point.position.map(p => p.toFixed(0)).join(', ')}]
                      </TableCell>
                      <TableCell className="font-mono text-gray-300">
                        {point.geo 
                          ? `[${point.geo[0].toFixed(2)}°, ${point.geo[1].toFixed(2)}°, ${point.geo[2].toFixed(1)} km]` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {(point.velocity / 1000).toFixed(2)} km/s
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {formattedTrajectoryData.length > 10 && (
                <div className="text-center text-gray-400 mt-4">
                  Showing 10 of {formattedTrajectoryData.length} data points
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" message="Loading trajectory data..." />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [formattedTrajectoryData]);

  // Main component render
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Satellite Telemetry Data</h2>
          <p className="text-gray-400 text-sm">
            NORAD ID: {spacecraftId}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRefresh}
              className={`flex items-center px-3 py-1 text-sm rounded-md ${
                refreshEnabled 
                  ? 'bg-green-700/20 text-green-400 border border-green-800/30' 
                  : 'bg-amber-700/20 text-amber-400 border border-amber-800/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${refreshEnabled ? 'bg-green-400' : 'bg-amber-400'}`}></span>
              {refreshEnabled ? 'Auto-refresh on' : 'Auto-refresh off'}
            </button>
          </div>
          
          <Button
            onClick={handleRefresh}
            className="bg-[#1e293b] hover:bg-[#2d3748]"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>
      
      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-3 bg-[#1a2236]">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="parameters" 
            className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
          >
            Parameters
          </TabsTrigger>
          <TabsTrigger 
            value="trajectory" 
            className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
          >
            Trajectory
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          {renderOverview()}
        </TabsContent>
        
        {/* Parameters Tab */}
        <TabsContent value="parameters" className="mt-4">
          {renderParameters()}
        </TabsContent>
        
        {/* Trajectory Tab */}
        <TabsContent value="trajectory" className="mt-4">
          {renderTrajectory()}
        </TabsContent>
      </Tabs>
      
      {/* Error notification if partial data failed but we have some data */}
      {Object.values(error).some(e => e !== null) && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-400">Partial Data Load Error</h4>
            <p className="text-sm text-gray-400">
              {Object.values(error).filter(e => e !== null).join('. ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatelliteDataDisplay;