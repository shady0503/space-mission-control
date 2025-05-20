import React, { useEffect, useState } from 'react';
import { SpacecraftInfo } from '@/lib/services/visualizationService';
import { Spacecraft } from '@/lib/services/missionService';
import spacecraftService from '@/lib/services/spacecraftService';
import visualizationService from '@/lib/services/visualizationService';
import { useAuth } from '@/lib/hooks';

interface SatelliteDetailsProps {
  externalId: number;
  onClose: () => void;
}

const SatelliteDetails: React.FC<SatelliteDetailsProps> = ({ externalId, onClose }) => {
  const [spacecraft, setSpacecraft] = useState<Spacecraft | null>(null);
  const [latestTelemetry, setLatestTelemetry] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch spacecraft details
        const spacecraftData = await spacecraftService.getSpacecraftByExternalId(externalId, user?.enterpriseId || "");
        setSpacecraft(spacecraftData);

        // Fetch latest telemetry
        const telemetryData = await visualizationService.getLatestTelemetry(externalId);
        setLatestTelemetry(telemetryData);

        // Fetch statistics
        const statsData = await visualizationService.getSpacecraftStatistics(externalId);
        setStatistics(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch satellite data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [externalId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Loading Satellite Data...</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              ×
            </button>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-500">Error</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              ×
            </button>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    return (
      <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{spacecraft?.name || `Satellite ${externalId}`}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        {latestTelemetry && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Latest Telemetry</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400">Position</p>
                <p>X: {latestTelemetry.position.x.toFixed(2)} km</p>
                <p>Y: {latestTelemetry.position.y.toFixed(2)} km</p>
                <p>Z: {latestTelemetry.position.z.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-gray-400">Velocity (m/s)</p>
                <p>Total: {latestTelemetry.velocity.total.toFixed(2)}</p>
                <p>X: {latestTelemetry.velocity.x.toFixed(2)}</p>
                <p>Y: {latestTelemetry.velocity.y.toFixed(2)}</p>
                <p>Z: {latestTelemetry.velocity.z.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Location</p>
                <p>Lat: {latestTelemetry.location.latitude.toFixed(2)}°</p>
                <p>Lon: {latestTelemetry.location.longitude.toFixed(2)}°</p>
                <p>Alt: {latestTelemetry.location.altitude.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-gray-400">Attitude</p>
                <p>Azimuth: {latestTelemetry.attitude.azimuth.toFixed(2)}°</p>
                <p>Elevation: {latestTelemetry.attitude.elevation.toFixed(2)}°</p>
              </div>
            </div>
          </div>
        )}

        {statistics && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400">Time Range</p>
                <p>First: {new Date(statistics.timeRange.first).toLocaleString()}</p>
                <p>Last: {new Date(statistics.timeRange.last).toLocaleString()}</p>
                <p>Duration: {statistics.timeRange.durationHours.toFixed(1)} hours</p>
              </div>
              <div>
                <p className="text-gray-400">Velocity (m/s)</p>
                <p>Min: {statistics.velocity.min.toFixed(2)}</p>
                <p>Max: {statistics.velocity.max.toFixed(2)}</p>
                <p>Avg: {statistics.velocity.avg.toFixed(2)}</p>
              </div>
              {statistics.altitude && (
                <div>
                  <p className="text-gray-400">Altitude (km)</p>
                  <p>Min: {statistics.altitude.min.toFixed(2)}</p>
                  <p>Max: {statistics.altitude.max.toFixed(2)}</p>
                  <p>Avg: {statistics.altitude.avg.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {renderContent()}
    </div>
  );
};

export default SatelliteDetails; 