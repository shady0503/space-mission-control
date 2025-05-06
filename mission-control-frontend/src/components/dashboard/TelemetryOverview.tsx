'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, Database, Clock, ChevronDown, Activity, Layers, 
  AlertCircle, Wifi
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface SpacecraftData {
  externalId: number;
  spacecraftName: string | null;
  currentPosition: Position;
  currentVelocity: number;
  currentOrbitRadius: number;
  timestamp: string;
  dataPointsLast24h: number;
  currentlyTracked: boolean;
}

interface SystemMetrics {
  totalDataPointsLast24h: number;
  averageSystemVelocity: number;
  spacecraftWithTelemetryCount: number;
}

interface TelemetrySummary {
  spacecrafts: SpacecraftData[];
  system: SystemMetrics;
}

export default function TelemetryOverview({ telemetrySummary }: { telemetrySummary: TelemetrySummary | null }) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedSpacecraftId, setSelectedSpacecraftId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Helper formatting functions
  const formatPosition = (pos: Position | null) =>
    !pos
      ? { x: 'N/A', y: 'N/A', z: 'N/A' }
      : { x: (pos.x / 1000).toFixed(2), y: (pos.y / 1000).toFixed(2), z: (pos.z / 1000).toFixed(2) };

  const calculateAltitude = (radius?: number) => {
    if (!radius) return 'N/A';
    return ((radius / 1000) - 6371).toFixed(2);
  };

  const formatVelocity = (velocity?: number) =>
    !velocity ? 'N/A' : (velocity / 1000).toFixed(2);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).replace(',', '');
    } catch {
      return timestamp;
    }
  };

  // Determine spacecraft list and selection
  const spacecrafts = telemetrySummary?.spacecrafts || [];
  const spacecraft =
    spacecrafts.find(c => c.externalId === selectedSpacecraftId) || spacecrafts[0];

  useEffect(() => {
    if (spacecrafts.length > 0 && selectedSpacecraftId === null) {
      setSelectedSpacecraftId(spacecrafts[0].externalId);
    }
  }, [spacecrafts, selectedSpacecraftId]);

  if (!telemetrySummary || spacecrafts.length === 0 || !spacecraft) {
    return (
      <Card className="w-full h-full bg-[#0a1020] border-[#1a2e4c]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-base text-red-300">Telemetry data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalDataPointsLast24h, averageSystemVelocity, spacecraftWithTelemetryCount } = telemetrySummary.system;
  
  // Get spacecraft identifier
  const spacecraftIdentifier = spacecraft.spacecraftName ? spacecraft.spacecraftName : `ID: ${spacecraft.externalId}`;

  return (
    <Card className="w-full h-full bg-[#0a1020] border-[#1a2e4c] overflow-hidden flex flex-col">
      <CardHeader className="bg-[#0a1020] border-b border-[#1a2e4c] pb-1 px-3 pt-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-blue-400 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-400" />
            Telemetry
          </CardTitle>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-[#14213e] text-gray-100 px-3 py-1 rounded-md text-sm"
            >
              {spacecraftIdentifier}
              <ChevronDown className="h-4 w-4 text-blue-400 ml-1" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-[#14213e] border border-[#1a2e4c] rounded-md shadow-lg z-10">
                <ul className="py-1">
                  {spacecrafts.map(craft => (
                    <li key={craft.externalId}>
                      <button
                        onClick={() => { setSelectedSpacecraftId(craft.externalId); setDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 hover:bg-[#1e3054] ${
                          selectedSpacecraftId === craft.externalId
                            ? 'bg-[#1a2e4c] text-blue-300'
                            : 'text-gray-300'
                        }`}
                      >
                        {craft.spacecraftName ? craft.spacecraftName : `ID: ${craft.externalId}`}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center text-gray-400 text-sm mt-1">
          <Clock className="h-4 w-4 text-gray-500 mr-1" />
          <span>Updated: {formatTimestamp(spacecraft.timestamp)}</span>
          <div className="ml-auto flex items-center">
            <Wifi className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">Signal Active</span>
            <span className="ml-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full h-full flex flex-col">
          <TabsList className="bg-[#0a1020] border-b border-[#1a2e4c] rounded-none p-0 flex-shrink-0">
            <TabsTrigger
              value="overview"
              className="rounded-none py-2 px-4 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 text-white"
            >
              <Globe className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="telemetry"
              className="rounded-none py-2 px-4 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 text-white"
            >
              <Activity className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="rounded-none py-2 px-4 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 text-white"
            >
              <Layers className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="p-0 m-0 flex-grow overflow-auto">
            <div className="p-4 space-y-4">
              {/* Orbital Information */}
              <div className="bg-[#14213e] rounded-lg border border-[#1a2e4c] p-4">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="text-base text-blue-400">Orbital Information</h3>
                  <span className="ml-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 mb-1">Altitude</p>
                    <p className="text-3xl text-blue-300">{calculateAltitude(spacecraft.currentOrbitRadius)}</p>
                    <p className="text-blue-400">km</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Velocity</p>
                    <p className="text-3xl text-blue-300">{formatVelocity(spacecraft.currentVelocity)}</p>
                    <p className="text-blue-400">km/s</p>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-2">Current Position (km)</p>
                <div className="grid grid-cols-3 gap-4">
                  {['x','y','z'].map(axis => (
                    <div key={axis} className="bg-[#1a2e4c] rounded-lg p-2">
                      <p className="text-gray-400">{axis.toUpperCase()}</p>
                      <p className="text-lg text-blue-300">{formatPosition(spacecraft.currentPosition)[axis as 'x'|'y'|'z']}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Telemetry Stats */}
              <div className="bg-[#14213e] rounded-lg border border-[#1a2e4c] p-4">
                <div className="flex items-center mb-4">
                  <Database className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="text-base text-blue-400">Telemetry Stats</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 mb-1">Data Points (24h)</p>
                    <p className="text-2xl text-blue-300">{spacecraft.dataPointsLast24h}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-green-400">Live</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Last Update</p>
                    <p className="text-blue-300">{formatTimestamp(spacecraft.timestamp)}</p>
                  </div>
                </div>
              </div>
              
              {/* System Overview */}
              <div className="bg-[#14213e] rounded-lg border border-[#1a2e4c] p-4">
                <div className="flex items-center mb-4">
                  <Activity className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="text-base text-blue-400">System Overview</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-300">Active Spacecraft</p>
                      <p className="text-blue-300">{spacecraftWithTelemetryCount} of {spacecrafts.length}</p>
                    </div>
                    <div className="h-2 bg-[#1a2e4c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${spacecrafts.length ? (spacecraftWithTelemetryCount / spacecrafts.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-300">Total Data Points (24h)</p>
                      <p className="text-blue-300">{totalDataPointsLast24h}</p>
                    </div>
                    <div className="h-2 bg-[#1a2e4c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (totalDataPointsLast24h / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-300">Average System Velocity</p>
                      <p className="text-blue-300">{formatVelocity(averageSystemVelocity)} km/s</p>
                    </div>
                    <div className="h-2 bg-[#1a2e4c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `100%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TELEMETRY DATA TAB */}
          <TabsContent value="telemetry" className="m-0 p-4 flex-grow overflow-auto">
            <div className="bg-[#14213e] rounded-lg border border-[#1a2e4c] p-4">
              <h3 className="text-lg text-blue-400 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-400" />
                Telemetry for {spacecraftIdentifier}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-[#1a2e4c]">
                    <tr>
                      <th className="pb-3 text-sm text-gray-400">Parameter</th>
                      <th className="pb-3 text-sm text-gray-400">Value</th>
                      <th className="pb-3 text-sm text-gray-400">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2e4c]">
                    {[
                      { name: 'External ID', value: spacecraft.externalId, unit: '-' },
                      { name: 'Orbit Radius', value: (spacecraft.currentOrbitRadius/1000).toFixed(2), unit: 'km' },
                      { name: 'Velocity', value: formatVelocity(spacecraft.currentVelocity), unit: 'km/s' },
                      { name: 'Altitude', value: calculateAltitude(spacecraft.currentOrbitRadius), unit: 'km' },
                      { name: 'Position X', value: formatPosition(spacecraft.currentPosition).x, unit: 'km' },
                      { name: 'Position Y', value: formatPosition(spacecraft.currentPosition).y, unit: 'km' },
                      { name: 'Position Z', value: formatPosition(spacecraft.currentPosition).z, unit: 'km' },
                      { name: 'Data Points (24h)', value: spacecraft.dataPointsLast24h, unit: 'count' }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#1a2e4c]">
                        <td className="py-3 text-gray-300">{row.name}</td>
                        <td className="py-3 text-blue-300">{row.value}</td>
                        <td className="py-3 text-gray-400">{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* SYSTEM STATUS TAB */}
          <TabsContent value="system" className="m-0 p-4 flex-grow overflow-auto">
            <div className="space-y-4">
              <div className="bg-[#14213e] rounded-lg border border-[#1a2e4c] p-4">
                <h3 className="text-lg text-blue-400 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-400" />
                  System Status
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-300">Active Spacecraft</p>
                      <p className="text-blue-300">{spacecraftWithTelemetryCount} of {spacecrafts.length}</p>
                    </div>
                    <div className="h-2 bg-[#1a2e4c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${spacecrafts.length ? (spacecraftWithTelemetryCount / spacecrafts.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-300">Total Data Points (24h)</p>
                      <p className="text-blue-300">{totalDataPointsLast24h}</p>
                    </div>
                    <div className="h-2 bg-[#1a2e4c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (totalDataPointsLast24h / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-300">Average System Velocity</p>
                      <p className="text-blue-300">{formatVelocity(averageSystemVelocity)} km/s</p>
                    </div>
                    <div className="h-2 bg-[#1a2e4c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `100%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#14213e] rounded-lg border border-[#1a2e4c] p-4">
                <h3 className="text-lg text-blue-400 mb-4 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-blue-400" />
                  Spacecraft Status
                </h3>
                
                <div className="overflow-hidden border border-[#1a2e4c] rounded-lg">
                  <table className="w-full text-left">
                    <thead className="bg-[#1a2e4c]">
                      <tr>
                        <th className="py-2 px-4 text-sm text-gray-400">Name</th>
                        <th className="py-2 px-4 text-sm text-gray-400 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spacecrafts.map(craft => (
                        <tr
                          key={craft.externalId}
                          className={`cursor-pointer hover:bg-[#1a2e4c] ${
                            selectedSpacecraftId === craft.externalId ? 'bg-[#1e3054]' : ''
                          }`}
                          onClick={() => setSelectedSpacecraftId(craft.externalId)}
                        >
                          <td className="py-2 px-4 text-gray-300">
                            {craft.spacecraftName ? craft.spacecraftName : `ID: ${craft.externalId}`}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              craft.currentlyTracked ? 'bg-green-900/40 text-green-400' : 'bg-amber-900/40 text-amber-400'
                            }`}>
                              {craft.currentlyTracked ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}