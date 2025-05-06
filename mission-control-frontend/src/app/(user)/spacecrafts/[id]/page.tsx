'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Satellite,
  ArrowLeft,
  Edit,
  Save,
  Rocket,
  Globe,
  Activity,
  Clock,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Radio
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { spacecraftService } from '@/lib/services/spacecraftService';
import { missionService } from '@/lib/services/missionService';
import { commandService, telemetryService } from '@/lib/services';
import SatelliteDataDisplay from '@/components/satellites/SatelliteDataDisplay';
import { visualizationService, SpacecraftInfo, Mission, LatestTelemetryPoint } from '@/lib/services/visualizationService';
import { useAuth } from '@/lib/hooks';

enum CommandType {
  LAUNCH = 'LAUNCH',
  ADJUST_TRAJECTORY = 'ADJUST_TRAJECTORY',
  SHUTDOWN = 'SHUTDOWN',
  EMERGENCY_STOP = 'EMERGENCY_STOP'
}

interface Command {
  id: number;
  commandType: CommandType;
  payload: any;
  status: boolean;
  createdAt: string;
  executedAt: string | null;
  spacecraft?: SpacecraftInfo;
  operator?: {
    id: number;
    username: string;
    email: string;
    createdAt: string;
  };
}

export default function SatelliteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const satelliteId = params?.id ? (params.id as string) : null;
  const {user } = useAuth(); // Assuming you have a useAuth hook to get user info
  const operatorId = user?.id || null; // Get operator ID from user context

  const [loading, setLoading] = useState(true);
  const [spacecraft, setSpacecraft] = useState<SpacecraftInfo | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [commands, setCommands] = useState<Command[]>([]);
  const [editing, setEditing] = useState(false);
  const [editedSpacecraft, setEditedSpacecraft] = useState<Partial<SpacecraftInfo>>({});
  const [issueCommandOpen, setIssueCommandOpen] = useState(false);
  const [newCommand, setNewCommand] = useState({
    commandType: CommandType.ADJUST_TRAJECTORY,
    payload: '{}'
  });
  const [savingChanges, setSavingChanges] = useState(false);
  const [sendingCommand, setSendingCommand] = useState(false);
  const [executingCommand, setExecutingCommand] = useState<number | null>(null);
  const [telemetryData, setTelemetryData] = useState<LatestTelemetryPoint | null>(null);

  // Fetch spacecraft data
  const fetchSpacecraftData = useCallback(async () => {
    if (!satelliteId) return;

    setLoading(true);
    try {
      // Get spacecraft details
      const spacecraftData = await spacecraftService.getSpacecraft(satelliteId);
      setSpacecraft(spacecraftData);
      setEditedSpacecraft(spacecraftData);

      // Get spacecraft mission
      if (spacecraftData.missionId) {
        const missionData = await missionService.getMission(spacecraftData.missionId);
        setMission(missionData);
      }

      // Get telemetry data
      if (spacecraftData.externalId) {
        try {
          const latestTelemetry = await visualizationService.getLatestTelemetry(spacecraftData.externalId);
          setTelemetryData(latestTelemetry);
        } catch (error) {
          console.error('Error fetching telemetry data:', error);
          // Continue even if telemetry data cannot be fetched
        }
      }

      // Get spacecraft commands
      const commandsData = spacecraftData.commands || [];
      setCommands(commandsData as unknown as Command[]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching spacecraft data:', error);
      setLoading(false);
    }
  }, [satelliteId]);

  useEffect(() => {
    fetchSpacecraftData();
  }, [fetchSpacecraftData]);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedSpacecraft(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSelectChange = useCallback((value: string, field: string) => {
    setEditedSpacecraft(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!spacecraft) return;

    setSavingChanges(true);
    try {
      // Update spacecraft with edited values
      const updatedSpacecraft = await spacecraftService.updateSpacecraft({
        ...spacecraft,
        ...editedSpacecraft
      });

      setSpacecraft(updatedSpacecraft);
      setEditing(false);
      setSavingChanges(false);
    } catch (error) {
      console.error('Error updating spacecraft:', error);
      setSavingChanges(false);
    }
  }, [spacecraft, editedSpacecraft]);

  // Handle issuing commands
  const handleIssueCommand = useCallback(async () => {
    if (!spacecraft || !mission) return;

    setSendingCommand(true);
    try {
      let payload = {};
      // Try to parse payload JSON if not empty
      if (newCommand.payload && newCommand.payload !== '{}') {
        try {
          payload = JSON.parse(newCommand.payload);
        } catch (e) {
          console.error('Invalid payload JSON:', e);
          alert('Please enter valid JSON for the payload');
          setSendingCommand(false);
          return;
        }
      }

      // Issue the command
      await commandService.issueCommand(
        {
          spacecraftId  : spacecraft.id,
          commandType: newCommand.commandType,
          operatorId: operatorId,
          status: false,
          payload: JSON.stringify(payload),
        }
      );

      // Refresh commands list
      fetchSpacecraftData();

      setIssueCommandOpen(false);
      setSendingCommand(false);

    } catch (error) {
      console.error('Error issuing command:', error);
      setSendingCommand(false);
    }
  }, [spacecraft, mission, newCommand, fetchSpacecraftData]);

  // Handle executing a command
  const handleExecuteCommand = useCallback(async (command: Command) => {
    setExecutingCommand(command.id);
    try {
      // Execute the command
      const executedCommand = await commandService.executeCommand(command);

      // Update commands list with executed command
      setCommands(prevCommands =>
        prevCommands.map(cmd =>
          cmd.id === command.id ? { ...cmd, status: true, executedAt: executedCommand.executedAt } : cmd
        )
      );

      setExecutingCommand(null);
    } catch (error) {
      console.error('Error executing command:', error);
      setExecutingCommand(null);
    }
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Calculate orbital speed in km/s if available
  const orbitalSpeed = telemetryData && telemetryData.velocity && telemetryData.velocity.total 
    ? telemetryData.velocity.total / 1000 
    : null;

  // Calculate altitude in km if available
  const altitude = telemetryData && telemetryData.location && telemetryData.location.altitude 
    ? telemetryData.location.altitude 
    : null;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 p-8 flex items-center justify-center min-h-screen">
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-xl backdrop-blur-sm flex flex-col items-center">
          <Satellite className="h-16 w-16 text-indigo-400 mb-4 animate-pulse" />
          <LoadingSpinner size="large" message="Establishing satellite communication link..." className="mt-4" />
        </div>
      </div>
    );
  }

  if (!spacecraft) {
    return (
      <div className="min-h-screen bg-[#0f1628] text-gray-100 p-4">
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Satellite Not Found</h1>
          <p className="text-gray-300 mb-6">The spacecraft you're looking for could not be located.</p>
          <Button
            onClick={() => router.push('/spacecrafts')}
            className="bg-blue-700 hover:bg-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Satellites
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1628] text-gray-100">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white -ml-4 mb-2"
              onClick={() => router.push('/spacecrafts')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Satellites
            </Button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              {spacecraft.displayName || spacecraft.externalName}
            </h1>
            {spacecraft.displayName && spacecraft.displayName !== spacecraft.externalName && (
              <p className="text-gray-400">{spacecraft.externalName}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-blue-900 text-blue-100 py-1 px-3 text-sm">
              {spacecraft.type}
            </Badge>

            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                className="bg-[#2a3750] hover:bg-[#3a4760]"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Details
              </Button>
            ) : (
              <Button
                onClick={handleSaveChanges}
                disabled={savingChanges}
                className="bg-green-700 hover:bg-green-800"
              >
                {savingChanges ? <LoadingSpinner size="small" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Spacecraft Details */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1a2236] border-[#2a3750]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Spacecraft Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  // Edit mode
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="externalName" className="text-gray-300">Spacecraft Name</Label>
                      <Input
                        id="externalName"
                        value={editedSpacecraft.externalName || ''}
                        onChange={handleEditChange}
                        className="bg-[#0f1628] border-[#2a3750] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                      <Input
                        id="displayName"
                        value={editedSpacecraft.displayName || ''}
                        onChange={handleEditChange}
                        className="bg-[#0f1628] border-[#2a3750] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-gray-300">Type</Label>
                      <Select
                        value={editedSpacecraft.type}
                        onValueChange={(value) => handleSelectChange(value, 'type')}
                      >
                        <SelectTrigger className="bg-[#0f1628] border-[#2a3750] text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2236] border-[#2a3750] text-white">
                          <SelectItem value="SATELLITE">Satellite</SelectItem>
                          <SelectItem value="ROVER">Rover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-[#2a3750]">
                      <span className="text-gray-400">NORAD ID</span>
                      <span className="text-white font-mono">{spacecraft.externalId}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-[#2a3750]">
                      <span className="text-gray-400">Mission</span>
                      <span className="text-white">{mission?.name || 'Unknown'}</span>
                    </div>

                    {altitude !== null && (
                      <div className="flex items-center justify-between py-2 border-b border-[#2a3750]">
                        <span className="text-gray-400">Altitude</span>
                        <span className="text-white">{altitude.toFixed(2)} km</span>
                      </div>
                    )}

                    {orbitalSpeed !== null && (
                      <div className="flex items-center justify-between py-2 border-b border-[#2a3750]">
                        <span className="text-gray-400">Orbital Speed</span>
                        <span className="text-white">{orbitalSpeed.toFixed(2)} km/s</span>
                      </div>
                    )}

                    {telemetryData && telemetryData.position && (
                      <div className="pt-4">
                        <h3 className="text-lg font-medium text-white mb-2">Position</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-[#0f1628] p-2 rounded border border-[#2a3750]">
                            <div className="text-xs text-gray-400">X</div>
                            <div className="font-mono text-white">{telemetryData.position.x?.toFixed(0) || 'N/A'}</div>
                          </div>
                          <div className="bg-[#0f1628] p-2 rounded border border-[#2a3750]">
                            <div className="text-xs text-gray-400">Y</div>
                            <div className="font-mono text-white">{telemetryData.position.y?.toFixed(0) || 'N/A'}</div>
                          </div>
                          <div className="bg-[#0f1628] p-2 rounded border border-[#2a3750]">
                            <div className="text-xs text-gray-400">Z</div>
                            <div className="font-mono text-white">{telemetryData.position.z?.toFixed(0) || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {telemetryData && telemetryData.velocity && (
                      <div className="pt-2">
                        <h3 className="text-lg font-medium text-white mb-2">Velocity</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-[#0f1628] p-2 rounded border border-[#2a3750]">
                            <div className="text-xs text-gray-400">X</div>
                            <div className="font-mono text-white">{telemetryData.velocity.x?.toFixed(2) || 'N/A'}</div>
                          </div>
                          <div className="bg-[#0f1628] p-2 rounded border border-[#2a3750]">
                            <div className="text-xs text-gray-400">Y</div>
                            <div className="font-mono text-white">{telemetryData.velocity.y?.toFixed(2) || 'N/A'}</div>
                          </div>
                          <div className="bg-[#0f1628] p-2 rounded border border-[#2a3750]">
                            <div className="text-xs text-gray-400">Z</div>
                            <div className="font-mono text-white">{telemetryData.velocity.z?.toFixed(2) || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Visualization Card */}
            <Card className="bg-[#1a2236] border-[#2a3750] mt-6">
              <CardHeader>
                <CardTitle className="text-xl text-white">Satellite Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  {/* Orbit Visualization */}
                  <div className="relative w-48 h-48 mb-4">
                    <div className="absolute inset-0 rounded-full border border-[#2a3750]"></div>
                    <div className="absolute inset-3 rounded-full border border-blue-700/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Globe className="h-8 w-8 text-blue-400/80" />
                      </div>
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-500/50"
                      style={{
                        left: `${50 + 35 * Math.cos(Date.now() / 1000 % (2 * Math.PI))}%`,
                        top: `${50 + 35 * Math.sin(Date.now() / 1000 % (2 * Math.PI))}%`,
                        animation: 'pulse 2s infinite'
                      }}
                    ></div>
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="flex items-center gap-2 text-green-400">
                      <Radio className="h-4 w-4" />
                      <span>Signal: Strong</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <Activity className="h-4 w-4" />
                      <span>Systems: Nominal</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <Battery className="h-4 w-4" />
                      <span>Power: 78%</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <Thermometer className="h-4 w-4" />
                      <span>Temp: Normal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Commands and Telemetry */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="commands" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#1a2236]">
                <TabsTrigger
                  value="commands"
                  className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
                >
                  Commands
                </TabsTrigger>
                <TabsTrigger
                  value="telemetry"
                  className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
                >
                  Telemetry Data
                </TabsTrigger>
              </TabsList>

              {/* Commands Tab */}
              <TabsContent value="commands" className="mt-4">
                <Card className="bg-[#1a2236] border-[#2a3750]">
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-xl text-white">Command History</CardTitle>
                    <Dialog open={issueCommandOpen} onOpenChange={setIssueCommandOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-700 hover:bg-blue-800">
                          <Rocket className="mr-2 h-4 w-4" /> Issue Command
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a2236] border-[#2a3750] text-white">
                        <DialogHeader>
                          <DialogTitle className="text-blue-400">Issue New Command</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Send a command to {spacecraft.displayName || spacecraft.externalName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="commandType" className="text-gray-300">Command Type</Label>
                            <Select
                              value={newCommand.commandType}
                              onValueChange={(value) => setNewCommand(prev => ({ ...prev, commandType: value as CommandType }))}
                            >
                              <SelectTrigger className="bg-[#0f1628] border-[#2a3750] text-white">
                                <SelectValue placeholder="Select command" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a2236] border-[#2a3750] text-white">
                                {Object.values(CommandType).map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="payload" className="text-gray-300">Payload (JSON)</Label>
                            <Textarea
                              id="payload"
                              value={newCommand.payload}
                              onChange={(e) => setNewCommand(prev => ({ ...prev, payload: e.target.value }))}
                              className="font-mono bg-[#0f1628] border-[#2a3750] text-white min-h-[100px]"
                              placeholder="{}"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIssueCommandOpen(false)}
                            className="bg-[#0f1628] hover:bg-[#2a3750] text-white border-[#2a3750]"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleIssueCommand}
                            disabled={sendingCommand}
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                          >
                            {sendingCommand ? <LoadingSpinner size="small" className="mr-2" /> : <Terminal className="mr-2 h-4 w-4" />}
                            Send Command
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {commands.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No commands have been issued to this spacecraft yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-[#2a3750] hover:bg-[#121930]">
                              <TableHead className="text-gray-300">Command</TableHead>
                              <TableHead className="text-gray-300">Status</TableHead>
                              <TableHead className="text-gray-300">Issued</TableHead>
                              <TableHead className="text-gray-300">Executed</TableHead>
                              <TableHead className="text-gray-300">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {commands.map((command) => (
                              <TableRow key={command.id} className="border-[#2a3750] hover:bg-[#121930]">
                                <TableCell className="font-medium text-white">
                                  {command.commandType ? command.commandType.replace(/_/g, ' ') : 'Unknown Command'}
                                </TableCell>
                                <TableCell>
                                  {command.status ? (
                                    <Badge className="bg-green-800/30 text-green-400 border-green-900">
                                      <CheckCircle2 className="mr-1 h-3 w-3" /> Executed
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-800/30 text-amber-400 border-amber-900">
                                      <Clock className="mr-1 h-3 w-3" /> Pending
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {formatDate(command.createdAt)}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {command.executedAt ? formatDate(command.executedAt) : '-'}
                                </TableCell>
                                <TableCell>
                                  {!command.status && (
                                    <Button
                                      onClick={() => handleExecuteCommand(command)}
                                      disabled={!!executingCommand}
                                      size="sm"
                                      className="bg-green-700 hover:bg-green-800 text-white h-8"
                                    >
                                      {executingCommand === command.id ? (
                                        <LoadingSpinner size="small" className="mr-1" />
                                      ) : (
                                        <Terminal className="mr-1 h-3 w-3" />
                                      )}
                                      Execute
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Telemetry Tab */}
              <TabsContent value="telemetry" className="mt-4">
                {spacecraft?.externalId && (
                  <SatelliteDataDisplay
                    spacecraftId={spacecraft.externalId}
                    refreshInterval={30000} // 30 seconds
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing components defined here
const Battery = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <line x1="6" y1="7" x2="6" y2="17" />
    <line x1="10" y1="7" x2="10" y2="17" />
    <line x1="14" y1="7" x2="14" y2="17" />
  </svg>
);

const Thermometer = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);