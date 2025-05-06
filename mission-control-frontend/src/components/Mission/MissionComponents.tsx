'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft, Edit, Trash2, Calendar, Clock, Users, Rocket,
  AlertTriangle, CheckCircle, RotateCw, Send, Radio, Satellite, Activity
} from 'lucide-react';

// Updated interfaces to match new API structure
export interface Mission {
  id: string;
  enterpriseId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string | boolean; // The API seems to return a string ('PLANNING') but code expected boolean
  createdAt: string;
}

export interface Spacecraft {
  id: string;
  externalId: number;
  externalName: string;
  missionId: string;
  enterpriseId: string;
  type: string; // Changed from spacecraftType to type
  displayName: string; // Changed from spacecraftName to displayName
  commands: any[];
  // For compatibility with previous code
  spacecraftType?: string;
  spacecraftName?: string;
  spacecraftId?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  velocityX?: number;
  velocityY?: number;
  velocityZ?: number;
  orbitRadius?: number;
}

export interface Operator {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  enterpriseId?: string;
  role?: string; // Some endpoints may include role directly, others nest it
}

export interface OperatorWithRole {
  operator: Operator;
  role: string;
}

export interface Command {
  id: string;
  spacecraft: Spacecraft;
  commandType: string;
  operatorId: string;
  payload: string;
  status: boolean;
  createdAt: string;
  executedAt?: string;
  operator?: Operator;
}

export type CommandType = 'TELEMETRY' | 'ORBIT_ADJUST' | 'IMAGING' | 'POWER' | 'LANDING';

interface MissionHeaderProps {
  mission: Mission;
  isAdmin: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MissionHeader({ mission, isAdmin, onBack, onEdit, onDelete }: MissionHeaderProps) {
  // Status could be string ("PLANNING", "ACTIVE", etc) or boolean, handle both
  const isActive = mission.status === true || mission.status === "ACTIVE";
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-gray-850 p-4 rounded-lg border border-gray-700">
      {/* Mission Info Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 h-10 w-10 p-0 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{mission.name}</h1>
          <p className="text-blue-300 mt-1 text-sm md:text-base">{mission.description}</p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={isActive ? "bg-green-600 text-white py-1.5 px-3 text-sm font-medium" : "bg-yellow-600 text-white py-1.5 px-3 text-sm font-medium"}
        >
          {isActive ? 'Active' : mission.status || 'Inactive'}
        </Badge>

        {isAdmin && (
          <>
            <Button
              variant="outline"
              onClick={onEdit}
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              className="bg-red-700 hover:bg-red-800 text-white"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface MissionProgressProps {
  mission: Mission;
  formatDate: (date: string) => string;
  calculateProgress: () => number;
}

export function MissionProgress({ mission, formatDate, calculateProgress }: MissionProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-blue-400" />
          {formatDate(mission.startDate)}
        </div>
        <div>{calculateProgress()}% Complete</div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-blue-400" />
          {formatDate(mission.endDate)}
        </div>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>
    </div>
  );
}

interface MissionStatsProps {
  operators: (Operator | OperatorWithRole)[]; // Updated to handle both data formats
  spacecrafts: Spacecraft[];
  commands: Command[];
  mission: Mission;
}

export function MissionStats({ operators, spacecrafts, commands, mission }: MissionStatsProps) {
  // Helper to get operator role regardless of data format
  const getOperatorRole = (op: Operator | OperatorWithRole): string => {
    if ('role' in op) return op.role;
    if ('operator' in op && op.operator && 'role' in op) return op.role;
    return 'VIEWER'; // Default
  };

  // Helper to determine if spacecraft is a satellite
  const isSatellite = (spacecraft: Spacecraft): boolean => {
    return spacecraft.type === 'SATELLITE' || spacecraft.spacecraftType === 'SATELLITE';
  };

  // Count admins
  const adminCount = operators?.filter(op => getOperatorRole(op) === 'ADMIN').length || 0;
  const viewerCount = operators?.length - adminCount || 0;

  // Count satellites and rovers
  const satelliteCount = spacecrafts?.filter(s => isSatellite(s)).length || 0;
  const roverCount = spacecrafts?.length - satelliteCount || 0;

  // Count executed and pending commands
  const executedCommands = commands?.filter(c => c.status).length || 0;
  const pendingCommands = commands?.length - executedCommands || 0;

  // Determine mission status display
  const missionStatusDisplay = typeof mission.status === 'string' 
    ? mission.status 
    : mission.status ? 'Active' : 'Inactive';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
            <Users className="h-4 w-4 mr-2" /> Team
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="text-2xl font-bold text-white">{operators?.length || 0}</div>
          <div className="text-xs text-blue-300">
            {adminCount} admins, {viewerCount} viewers
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
            <Rocket className="h-4 w-4 mr-2" /> Spacecraft
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="text-2xl font-bold text-white">{spacecrafts?.length || 0}</div>
          <div className="text-xs text-blue-300">
            {satelliteCount} satellites, {roverCount} rovers
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
            <Send className="h-4 w-4 mr-2" /> Commands
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="text-2xl font-bold text-white">{commands?.length || 0}</div>
          <div className="text-xs text-blue-300">
            {executedCommands} executed, {pendingCommands} pending
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
            <Activity className="h-4 w-4 mr-2" /> Status
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="text-2xl font-bold text-white">
            {missionStatusDisplay}
          </div>
          <div className="text-xs text-green-300">
            Created {new Date(mission.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SpacecraftTabProps {
  spacecrafts: Spacecraft[];
  isAdmin: boolean;
  openCommandDialog: (spacecraftId: string) => void;
  handleRemoveSpacecraft: (id: string) => void;
}

export function SpacecraftTab({ spacecrafts, isAdmin, openCommandDialog, handleRemoveSpacecraft }: SpacecraftTabProps) {
  // Helper function to get proper name fields
  const getSpacecraftName = (spacecraft: Spacecraft): string => {
    return spacecraft.displayName || spacecraft.spacecraftName || spacecraft.externalName || 'Unnamed Spacecraft';
  };

  const getSpacecraftId = (spacecraft: Spacecraft): string => {
    return spacecraft.externalId?.toString() || spacecraft.spacecraftId || 'Unknown ID';
  };

  const getSpacecraftType = (spacecraft: Spacecraft): string => {
    return spacecraft.type || spacecraft.spacecraftType || 'UNKNOWN';
  };

  // Default values for telemetry data (if not present in the API response)
  const defaultTelemetry = {
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0,
    orbitRadius: 6371000, // Default Earth radius in meters
  };

  return (
    <TabsContent value="spacecraft">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Mission Spacecraft</h2>
        {isAdmin && (
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 cursor-pointer text-white"
          >
            <Rocket className="mr-2 h-4 w-4" /> Add Spacecraft
          </Button>
        )}
      </div>

      {spacecrafts && spacecrafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spacecrafts.map((spacecraft) => {
            const spacecraftType = getSpacecraftType(spacecraft);
            const isSatellite = spacecraftType === 'SATELLITE';
            
            // Merge with default telemetry for missing data
            const telemetry = { ...defaultTelemetry, ...spacecraft };
            
            return (
              <Card
                key={spacecraft.id}
                className="bg-gray-800 border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        {isSatellite ? 
                          <Satellite className="h-4 w-4 text-blue-400" /> :
                          <Radio className="h-4 w-4 text-green-400" />}
                        {getSpacecraftName(spacecraft)}
                      </h3>
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {getSpacecraftId(spacecraft)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={isSatellite ?
                        "bg-purple-600 text-white" :
                        "bg-green-600 text-white"}>
                        {spacecraftType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Telemetry Data Section */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Position Section */}
                    <div>
                      <div className="text-xs text-blue-300 mb-2 font-medium">Position (km)</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['X', 'Y', 'Z'].map((axis) => (
                          <div key={axis} className="bg-gray-700 p-2 rounded-md text-center">
                            <div className="text-xs text-gray-400 mb-1">{axis}</div>
                            <div className="font-mono text-sm text-white">
                              {(telemetry[`position${axis}`] / 1000 || 0).toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Velocity Section */}
                    <div>
                      <div className="text-xs text-blue-300 mb-2 font-medium">Velocity (km/s)</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['X', 'Y', 'Z'].map((axis) => (
                          <div key={axis} className="bg-gray-700 p-2 rounded-md text-center">
                            <div className="text-xs text-gray-400 mb-1">{axis}</div>
                            <div className="font-mono text-sm text-white">
                              {(telemetry[`velocity${axis}`] / 1000 || 0).toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700/50 p-3 rounded-md">
                      <div className="text-xs text-blue-300 mb-1 font-medium">Altitude</div>
                      <div className="font-bold text-xl text-white flex items-baseline">
                        {(telemetry.orbitRadius / 1000 || 0).toFixed(1)}
                        <span className="text-xs ml-1 font-normal text-gray-400">km</span>
                      </div>
                    </div>

                    <div className="bg-gray-700/50 p-3 rounded-md">
                      <div className="text-xs text-blue-300 mb-1 font-medium">Status</div>
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="font-medium text-green-400">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border border-blue-700"
                        size="sm"
                        onClick={() => openCommandDialog(spacecraft.id)}
                      >
                        <Send className="mr-2 h-4 w-4" /> Send Command
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-gray-800 hover:bg-red-900 text-red-400 border border-red-700/50 hover:text-white"
                        onClick={() => handleRemoveSpacecraft(spacecraft.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Unattach
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-md p-8 text-center text-gray-400">
          No spacecraft assigned to this mission
        </div>
      )}
    </TabsContent>
  );
}

interface TeamTabProps {
  operators: (Operator | OperatorWithRole)[];
  user: any;
  isAdmin: boolean;
  openEditOperatorDialog: (operator: Operator, role: string) => void;
  handleRemoveOperator: (id: string) => void;
  openAddOperatorDialog: () => void;
}

export function TeamTab({ operators, user, isAdmin, openEditOperatorDialog, handleRemoveOperator, openAddOperatorDialog }: TeamTabProps) {
  // Helper to extract operator data regardless of format
  const getOperatorData = (op: Operator | OperatorWithRole): { operator: Operator, role: string } => {
    if ('operator' in op && op.operator) {
      return { operator: op.operator, role: op.role };
    }
    // If it's a flat operator object, extract role if it exists
    const { role, ...operatorData } = op as Operator & { role?: string };
    return { 
      operator: operatorData as Operator, 
      role: role || 'VIEWER' // Default to VIEWER if no role specified
    };
  };

  return (
    <TabsContent value="team">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Mission Team</h2>
        {isAdmin && (
          <Button
            size="sm"
            onClick={openAddOperatorDialog}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Users className="mr-2 h-4 w-4" /> Add Operator
          </Button>
        )}
      </div>

      {operators && operators.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-transparent">
                <TableHead className="text-blue-300">Operator</TableHead>
                <TableHead className="text-blue-300">Email</TableHead>
                <TableHead className="text-blue-300">Role</TableHead>
                {isAdmin && <TableHead className="text-blue-300 w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map((op) => {
                const { operator, role } = getOperatorData(op);
                return (
                  <TableRow key={operator.id} className="border-gray-700 hover:bg-gray-700">
                    <TableCell className="font-medium text-white">
                      {operator.username}
                    </TableCell>
                    <TableCell className="text-gray-400">{operator.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={role === 'ADMIN'
                          ? "bg-purple-600 text-white"
                          : "bg-gray-600 text-gray-300"}
                      >
                        {role}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditOperatorDialog(operator, role)}
                            className="hover:bg-purple-600 hover:text-blue-200"
                            title="Edit Role"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Only show remove button for other users */}
                          {operator.email !== user?.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOperator(operator.id)}
                              className="hover:bg-red-700 hover:text-red-300"
                              title="Remove Operator"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-md p-8 text-center text-gray-400">
          No operators assigned to this mission
        </div>
      )}
    </TabsContent>
  );
}

interface CommandsTabProps {
  commands: Command[];
  isAdmin: boolean;
  spacecrafts: Spacecraft[];
  openCommandDialog: () => void;
  handleExecuteCommand: (command: Command) => void;
}

export function CommandsTab({ commands, isAdmin, spacecrafts, openCommandDialog, handleExecuteCommand }: CommandsTabProps) {
  // Helper to get spacecraft name
  const getSpacecraftName = (spacecraft?: Spacecraft): string => {
    if (!spacecraft) return 'Unknown';
    return spacecraft.displayName || spacecraft.spacecraftName || spacecraft.externalName || 'Unnamed';
  };

  return (
    <TabsContent value="commands">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Mission Commands</h2>
        {isAdmin && spacecrafts?.length > 0 && (
          <Button
            size="sm"
            onClick={openCommandDialog}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Send className="mr-2 h-4 w-4" /> Issue Command
          </Button>
        )}
      </div>
      {commands && commands.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-transparent">
                <TableHead className="text-blue-300">Type</TableHead>
                <TableHead className="text-blue-300">Target</TableHead>
                <TableHead className="text-blue-300">Issued By</TableHead>
                <TableHead className="text-blue-300">Date</TableHead>
                <TableHead className="text-blue-300">Status</TableHead>
                {isAdmin && <TableHead className="text-blue-300 w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {commands.map((command) => (
                <TableRow key={command.id} className="border-gray-700 hover:bg-gray-700">
                  <TableCell className="font-medium text-white">
                    {command.commandType}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {getSpacecraftName(command.spacecraft)}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {command.operator?.username || 'System'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {command.createdAt ? new Date(command.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {command.status ? (
                      <Badge className="bg-green-600 text-white flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Executed
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-600 text-white flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </Badge>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {!command.status ? (
                        <Button
                          size="sm"
                          onClick={() => handleExecuteCommand(command)}
                          className="bg-purple-600 hover:bg-purple-700 text-white border border-blue-700"
                        >
                          Execute
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {command.executedAt
                            ? new Date(command.executedAt).toLocaleTimeString()
                            : "N/A"}
                        </span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-md p-8 text-center text-gray-400">
          No commands have been issued for this mission
        </div>
      )}
    </TabsContent>
  );
}

interface MissionTimelineProps {
  mission: Mission;
  formatDate: (date: string) => string;
  spacecrafts: Spacecraft[];
}

export function MissionTimeline({ mission, formatDate, spacecrafts }: MissionTimelineProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Mission Timeline</h2>
      <div className="bg-gray-800 border border-gray-700 rounded-md p-6">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>

          <div className="mb-8 relative">
            <div className="absolute left-0 w-16 h-16 rounded-full bg-purple-600/30 border-2 border-blue-700 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-300" />
            </div>
            <div className="ml-24">
              <h3 className="text-white font-bold">Mission Created</h3>
              <p className="text-blue-300">
                {formatDate(mission.createdAt)}
              </p>
              <p className="text-gray-400 mt-1">
                Mission "{mission.name}" was created and configured for launch
              </p>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="absolute left-0 w-16 h-16 rounded-full bg-green-600/30 border-2 border-green-700 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-green-300" />
            </div>
            <div className="ml-24">
              <h3 className="text-white font-bold">Mission Started</h3>
              <p className="text-green-300">
                {formatDate(mission.startDate)}
              </p>
              <p className="text-gray-400 mt-1">
                Mission operations began with {spacecrafts?.length || 0} spacecraft
              </p>
            </div>
          </div>

          {new Date() > new Date(mission.endDate) ? (
            <div className="relative">
              <div className="absolute left-0 w-16 h-16 rounded-full bg-orange-600/30 border-2 border-orange-700 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-orange-300" />
              </div>
              <div className="ml-24">
                <h3 className="text-white font-bold">Mission Completed</h3>
                <p className="text-orange-300">
                  {formatDate(mission.endDate)}
                </p>
                <p className="text-gray-400 mt-1">
                  Mission reached its scheduled end date
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-0 w-16 h-16 rounded-full bg-gray-600 border-2 border-gray-500 flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-300" />
              </div>
              <div className="ml-24">
                <h3 className="text-white font-bold">Mission End (Scheduled)</h3>
                <p className="text-gray-300">
                  {formatDate(mission.endDate)}
                </p>
                <p className="text-gray-400 mt-1">
                  Expected completion date
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RoleAccessProps {
  user: any;
  isAdmin: boolean;
}

export function RoleAccess({ user, isAdmin }: RoleAccessProps) {
  if (!user) return null;
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md p-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-white">Your Mission Role</h2>
        <p className="text-gray-400 mt-1">
          You are currently assigned to this mission as a{' '}
          <Badge
            className={isAdmin
              ? "bg-purple-600 text-white"
              : "bg-gray-600 text-gray-300"}
          >
            {isAdmin ? 'ADMIN' : 'VIEWER'}
          </Badge>
        </p>
      </div>
      <div className="text-sm text-gray-400">
        {isAdmin ? (
          <div className="flex flex-col items-end">
            <div className="text-blue-300 font-medium mb-1">Admin Privileges:</div>
            <div>✓ Edit mission details</div>
            <div>✓ Manage team members</div>
            <div>✓ Issue spacecraft commands</div>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <div className="text-gray-300 font-medium mb-1">Viewer Privileges:</div>
            <div>✓ View mission details</div>
            <div>✓ View spacecraft status</div>
            <div>✓ View command history</div>
          </div>
        )}
      </div>
    </div>
  );
}