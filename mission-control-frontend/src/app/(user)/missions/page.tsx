'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { missionService, Mission } from '@/lib/services/missionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, Rocket, Users, RotateCw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/hooks';

export default function MissionsOverviewPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const {user} = useAuth();
  const [newMission, setNewMission] = useState({
    name: '',
    description: '',
    startDate: '',      // “YYYY-MM-DD”
    endDate: '',        // “YYYY-MM-DD”
    enterpriseId: ''    // <- add this
  });
  

  // Use useCallback to memoize functions
  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await missionService.getMissions();
      setMissions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleCreateMission = useCallback(async () => {
    try {
      await missionService.createMission({
        name:        newMission.name,
        description: newMission.description,
        startDate:   newMission.startDate,    // e.g. "2025-05-01"
        endDate:     newMission.endDate,      // e.g. "2026-03-15"
        enterpriseId: user.enterpriseId 
      });
  
      setCreateDialogOpen(false);
      resetNewMission();
      fetchMissions();
    } catch (error) {
      console.error('Error creating mission:', error);
    }
  }, [newMission, fetchMissions]);

  const resetNewMission = useCallback(() => {
    setNewMission({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: true
    });
  }, []);

  const navigateToMission = useCallback((id: number) => {
    router.push(`/missions/${id}`);
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
  }, []);

  // Use useMemo to avoid recalculating these on every render
  const { activeMissions, upcomingMissions, completedMissions } = useMemo(() => {
    // Group missions by upcoming, active, and completed
    const active = missions.filter(
      mission =>
        new Date(mission.startDate) <= new Date() &&
        new Date(mission.endDate) >= new Date() &&
        mission.status
    );

    const upcoming = missions.filter(
      mission => new Date(mission.startDate) > new Date() && mission.status
    );

    const completed = missions.filter(
      mission => new Date(mission.endDate) < new Date() || !mission.status
    );

    return { activeMissions: active, upcomingMissions: upcoming, completedMissions: completed };
  }, [missions]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewMission(prev => ({ ...prev, [id]: value }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-xl backdrop-blur-sm flex flex-col items-center">
          <Rocket className="h-16 w-16 text-indigo-400 mb-4 animate-pulse" />
          <LoadingSpinner size="large" message="Establishing mission control link..." className="mt-4" />
        </div>
      </div>
    );
  }
  console.log('Missions fetched:', missions);

  return (
    <div className="text-gray-100 h-full overflow-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Mission Control</h1>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Mission
          </Button>
        </div>

        <Tabs defaultValue="active" className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a2236]">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
            >
              Active Missions ({activeMissions.length})
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
            >
              Upcoming Missions ({upcomingMissions.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-[#2a3750] text-white data-[state=active]:text-white"
            >
              Completed Missions ({completedMissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMissions.length === 0 ? (
                <p className="col-span-full text-center py-8 text-gray-400 bg-[#1a2236]/50 rounded-md">
                  No active missions
                </p>
              ) : (
                activeMissions.map(mission => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onClick={() => navigateToMission(mission.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMissions.length === 0 ? (
                <p className="col-span-full text-center py-8 text-gray-400 bg-[#1a2236]/50 rounded-md">
                  No upcoming missions
                </p>
              ) : (
                upcomingMissions.map(mission => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onClick={() => navigateToMission(mission.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedMissions.length === 0 ? (
                <p className="col-span-full text-center py-8 text-gray-400 bg-[#1a2236]/50 rounded-md">
                  No completed missions
                </p>
              ) : (
                completedMissions.map(mission => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onClick={() => navigateToMission(mission.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Mission Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-[#1a2236] border-[#2a3750] text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-400">Create New Mission</DialogTitle>
              <DialogDescription className="text-gray-400">
                Fill in the details to create a new mission.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-300">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMission.name}
                  onChange={handleInputChange}
                  className="bg-[#0f1628] border-[#2a3750] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newMission.description}
                  onChange={handleInputChange}
                  className="bg-[#0f1628] border-[#2a3750] text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate" className="text-gray-300">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newMission.startDate}
                    onChange={handleInputChange}
                    className="bg-[#0f1628] border-[#2a3750] text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate" className="text-gray-300">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newMission.endDate}
                    onChange={handleInputChange}
                    className="bg-[#0f1628] border-[#2a3750] text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="bg-[#0f1628] hover:bg-[#2a3750] text-white border-[#2a3750]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMission}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                Create Mission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// MissionCard component remains the same
interface MissionCardProps {
  mission: Mission;
  onClick: () => void;
}

const MissionCard = React.memo(function MissionCard({ mission, onClick }: MissionCardProps) {
  // Calculate mission duration in days
  const startDate = new Date(mission.startDate);
  const endDate = new Date(mission.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format dates more concisely
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card
      className="bg-[#1a2236] border-[#2a3750] hover:shadow-lg hover:shadow-blue-900/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white">{mission.name}</CardTitle>
          <Badge
            variant={mission.status ? "default" : "secondary"}
            className={mission.status ? "bg-green-700 hover:bg-green-800" : "bg-yellow-700/50 hover:bg-yellow-700"}
          >
            {mission.status ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{mission.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-300">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>Start: {formatDate(startDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>End: {formatDate(endDate)}</span>
          </div>
        </div>

        <div className="mt-3 h-1.5 bg-[#0f1628] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  ((new Date().getTime() - startDate.getTime()) /
                    (endDate.getTime() - startDate.getTime())) * 100
                )
              )}%`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Duration: {durationDays} days</span>
          <span>
            {Math.max(
              0,
              Math.floor(
                ((new Date().getTime() - startDate.getTime()) /
                  (endDate.getTime() - startDate.getTime())) * 100
              )
            )}% complete
          </span>
        </div>
      </CardContent>
    </Card>
  );
});