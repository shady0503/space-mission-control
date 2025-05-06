import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Plus,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Layers
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';

interface Mission {
  id: string;
  enterpriseId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

interface MissionStats {
  activeMissionCount: number;
  inactiveMissionCount: number;
  missionsByMonth: Record<string, number>;  // ISO date string → count
  missions: Mission[];
  distinctOperators: number;
  spacecraftsCount: string[];               // list of spacecraft IDs
}

interface SpacecraftStats {
  countByType: Record<string, number>;
  activeSpacecraftCount: number;
  averageOrbitRadius: number;
}

interface CommandStats {
  successfulCommandCount: number;
  pendingCommandCount: number;
  commandsByType: Record<string, number>;
  commandsByOperator: Record<string, number>;
}

interface MissionStatisticsProps {
  missionStats?: MissionStats;
  spacecraftStats?: SpacecraftStats;
  commandStats?: CommandStats;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MissionStatistics: React.FC<MissionStatisticsProps> = ({
  missionStats,
  spacecraftStats,
  commandStats
}) => {
  // Selected mission ID state
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missionStats && missionStats.missions.length > 0
      ? missionStats.missions[0].id
      : ''
  );

  // Reset selection when new stats arrive
  useEffect(() => {
    if (missionStats && missionStats.missions.length > 0) {
      setSelectedMissionId(missionStats.missions[0].id);
    }
  }, [missionStats]);

  // If no data, show placeholder
  if (!missionStats || missionStats.missions.length === 0) {
    return (
      <Card className="w-full bg-slate-800 border border-slate-700 shadow-md">
        <CardHeader className="p-4 border-b border-slate-700 bg-slate-800">
          <CardTitle className="flex items-center justify-between text-white text-lg font-semibold">
            <div className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-indigo-400" />
              <span>Missions</span>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Mission</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-slate-500 opacity-70 mb-4" />
          <p className="text-slate-400 text-center">Mission statistics unavailable</p>
        </CardContent>
      </Card>
    );
  }

  // Find the selected mission object
  const selectedMission = missionStats.missions.find(
    (m) => m.id === selectedMissionId
  );

  // Format an ISO date string
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Build a month-indexed count map from the ISO-keyed missionsByMonth
  const monthCounts: Record<number, number> = {};
  Object.entries(missionStats.missionsByMonth).forEach(
    ([isoDate, count]) => {
      const d = new Date(isoDate);
      monthCounts[d.getMonth()] = count;
    }
  );

  // Prepare chart data for all 12 months
  const chartData = monthNames.map((mon, idx) => ({
    month: mon,
    missions: monthCounts[idx] || 0
  }));

  // Totals
  const totalMissions = missionStats.activeMissionCount + missionStats.inactiveMissionCount;
  const operatorCount = missionStats.distinctOperators;
  const spacecraftCount = missionStats.spacecraftsCount.length;

  return (
    <Card className="w-full bg-slate-800 border border-slate-700 shadow-md">
      {/* Header & Selector */}
      <CardHeader className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <CardTitle className="text-white text-lg font-semibold flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-indigo-400" />
            <span>Missions</span>
          </CardTitle>
        </div>
        <div className="mt-4">
          <select
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-md p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {missionStats.missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4 rounded-md text-center flex flex-col items-center">
            <PlayCircle className="h-6 w-6 text-green-400 mb-1" />
            <h5 className="text-slate-400 text-sm uppercase">Active</h5>
            <p className="text-slate-200 text-xl font-bold">
              {missionStats.activeMissionCount}
            </p>
          </div>
          <div className="bg-slate-700 p-4 rounded-md text-center flex flex-col items-center">
            <PauseCircle className="h-6 w-6 text-yellow-400 mb-1" />
            <h5 className="text-slate-400 text-sm uppercase">Inactive</h5>
            <p className="text-slate-200 text-xl font-bold">
              {missionStats.inactiveMissionCount}
            </p>
          </div>
          <div className="bg-slate-700 p-4 rounded-md text-center flex flex-col items-center">
            <Layers className="h-6 w-6 text-blue-400 mb-1" />
            <h5 className="text-slate-400 text-sm uppercase">Total</h5>
            <p className="text-slate-200 text-xl font-bold">
              {totalMissions}
            </p>
          </div>
        </div>

        {/* Mission Details */}
        {selectedMission ? (
          <div className="bg-slate-700 p-4 rounded-md space-y-4">
            <h3 className="text-xl font-bold text-indigo-300">
              {selectedMission.name}
            </h3>
            <p className="text-slate-300">{selectedMission.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-slate-800 rounded">
                <span className="block text-slate-400">Start Date</span>
                <span className="text-slate-200">
                  {formatDate(selectedMission.startDate)}
                </span>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <span className="block text-slate-400">End Date</span>
                <span className="text-slate-200">
                  {formatDate(selectedMission.endDate)}
                </span>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <span className="block text-slate-400">Status</span>
                <span className="text-slate-200">
                  {selectedMission.status}
                </span>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <span className="block text-slate-400">Spacecraft</span>
                <span className="text-slate-200">
                  {spacecraftCount}
                </span>
              </div>
              <div className="p-3 bg-slate-800 rounded">
                <span className="block text-slate-400">Operators</span>
                <span className="text-slate-200">
                  {operatorCount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-700 p-6 rounded-md flex flex-col items-center justify-center text-slate-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p>No mission selected</p>
          </div>
        )}

        {/* Missions-by-Month Chart */}
        <div className="bg-slate-700 p-4 rounded-md">
          <h4 className="text-slate-300 text-base mb-2">Missions by Month</h4>
          <div className="h-48">
            {chartData.some((d) => d.missions > 0) ? (
              <ResponsiveBar
                data={chartData}
                keys={['missions']}
                indexBy="month"
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Month',
                  legendPosition: 'middle',
                  legendOffset: 30
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Missions',
                  legendPosition: 'middle',
                  legendOffset: -35
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                theme={{
                  axis: {
                    ticks: { text: { fill: '#cbd5e1' } },
                    legend: { text: { fill: '#cbd5e1' } }
                  },
                  grid: { line: { stroke: '#475569', strokeWidth: 1 } },
                  labels: { text: { fill: '#ffffff' } },
                  tooltip: { container: { background: '#1e293b' } }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <p>No monthly data</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 border-t border-slate-700 bg-slate-800 text-slate-400 text-sm flex justify-end">
        <p>
          Total Missions:{' '}
          <span className="font-semibold">{totalMissions}</span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default MissionStatistics;
