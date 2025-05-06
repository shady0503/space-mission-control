'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Satellite, Search, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Import your spacecraft service
import { spacecraftService } from '@/lib/services/spacecraftService';
import { missionService } from '@/lib/services/missionService';
import { useAuth } from '@/lib/hooks';

// Updated interfaces to match Java model
interface Spacecraft {
  id: string; // UUID
  externalId: number; // Long in Java
  externalName: string;
  missionId: string; // UUID
  enterpriseId: string; // UUID
  type: 'SATELLITE' | 'ROVER'; // SpacecraftType enum
  displayName: string;
  commands: any[]; // List<Command>
}

interface Mission {
  id: string;
  name: string;
}

export default function SatellitesOverviewPage() {
  const router = useRouter();
  const [spacecraft, setSpacecraft] = useState<Spacecraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  // Form state matching required fields from Java model
  const [newSpacecraft, setNewSpacecraft] = useState({
    externalId: '', // required
    externalName: '', // required
    displayName: '', // required 
    type: 'SATELLITE', // required, enum value
    missionId: '' // optional in form, but needed for creation
  });
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const {user} = useAuth();
  const enterpriseId = user?.enterpriseId || '';

  // Fetch spacecraft data
  const fetchSpacecraft = useCallback(async () => {
    try {
      setLoading(true);
      const data = await spacecraftService.getAllSpacecraft(enterpriseId);
      setSpacecraft(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching spacecraft:', error);
      setLoading(false);
    }
  }, [enterpriseId]);

  // Filter spacecraft based on search query
  const filteredSpacecraft = useMemo(() => {
    return spacecraft.filter(craft => 
      craft.externalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (craft.displayName && craft.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [spacecraft, searchQuery]);

  // Fetch missions for dropdown using the missionService
  const fetchMissions = useCallback(async () => {
    try {
      // Use missionService.getMissions to get all missions the user has access to
      const missions = await missionService.getMissions();
      setAvailableMissions(missions);
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  }, []);

  useEffect(() => {
    fetchSpacecraft();
    // Fetch missions for the dropdown
    fetchMissions();
  }, [fetchSpacecraft, fetchMissions]);

  const handleCreateSpacecraft = useCallback(async () => {
    try {
      // Create payload matching the Java model structure
      await spacecraftService.createSpacecraft({
        externalId: parseInt(newSpacecraft.externalId), // Long in Java
        externalName: newSpacecraft.externalName,
        displayName: newSpacecraft.displayName || newSpacecraft.externalName,
        type: newSpacecraft.type, // Matches SpacecraftType enum
        missionId: newSpacecraft.missionId, // UUID string
        enterpriseId // UUID string from user context
      });
      setCreateDialogOpen(false);
      resetNewSpacecraft();
      fetchSpacecraft();
    } catch (error) {
      console.error('Error creating spacecraft:', error);
    }
  }, [newSpacecraft, fetchSpacecraft, enterpriseId]);

  const checkSatelliteExists = useCallback(async () => {
    if (!newSpacecraft.externalId) return;
    
    setVerificationStatus('checking');
    try {
      const exists = await spacecraftService.checkSatelliteExists(parseInt(newSpacecraft.externalId));
      if (exists) {
        setVerificationStatus('success');
        
        // Pre-fill the name if it's empty
        if (!newSpacecraft.externalName) {
          setNewSpacecraft(prev => ({
            ...prev,
            externalName: `Satellite ${newSpacecraft.externalId}`
          }));
        }
      } else {
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error('Error checking satellite:', error);
      setVerificationStatus('error');
    }
  }, [newSpacecraft.externalId, newSpacecraft.externalName]);

  const resetNewSpacecraft = useCallback(() => {
    setNewSpacecraft({
      externalId: '',
      externalName: '',
      displayName: '',
      type: 'SATELLITE', // Default to SATELLITE type
      missionId: ''
    });
    setVerificationStatus('idle');
  }, []);

  const navigateToSpacecraft = useCallback((id: string) => {
    router.push(`/spacecrafts/${id}`);
  }, [router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSpacecraft(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSelectChange = useCallback((value: string, field: string) => {
    setNewSpacecraft(prev => ({ ...prev, [field]: value }));
  }, []);

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

  return (
    <div className="min-h-screen bg-[#0f1628] text-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
            Satellite Management
          </h1>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search satellites..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a2236] border-[#2a3750] text-white w-full md:w-64"
              />
            </div>
            
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Satellite
            </Button>
          </div>
        </div>

        {/* Satellite Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpacecraft.length === 0 ? (
            <p className="col-span-full text-center py-8 text-gray-400 bg-[#1a2236]/50 rounded-md">
              No satellites found
            </p>
          ) : (
            filteredSpacecraft.map(satellite => (
              <SpacecraftCard
                key={satellite.id}
                spacecraft={satellite}
                onClick={() => navigateToSpacecraft(satellite.id)}
              />
            ))
          )}
        </div>

        {/* Create Spacecraft Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-[#1a2236] border-[#2a3750] text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-400">Add New Satellite</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter satellite details or use a NORAD ID to verify its existence.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[3fr_1fr] gap-2">
                <div>
                  <Label htmlFor="externalId" className="text-gray-300">
                    NORAD ID
                  </Label>
                  <Input
                    id="externalId"
                    value={newSpacecraft.externalId}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (verificationStatus !== 'idle') setVerificationStatus('idle');
                    }}
                    className="bg-[#0f1628] border-[#2a3750] text-white"
                    placeholder="25544"
                  />
                </div>
                <div className="flex items-end">
                  {verificationStatus === 'idle' && (
                    <Button 
                      onClick={checkSatelliteExists}
                      disabled={!newSpacecraft.externalId}
                      className="bg-[#2a3750] hover:bg-[#3a4760] text-white w-full"
                    >
                      Verify
                    </Button>
                  )}
                  
                  {verificationStatus === 'checking' && (
                    <Button 
                      disabled
                      className="bg-[#2a3750] text-white w-full"
                    >
                      <LoadingSpinner size="small" />
                    </Button>
                  )}
                  
                  {verificationStatus === 'success' && (
                    <Button 
                      className="bg-green-700 hover:bg-green-800 text-white w-full"
                      onClick={() => setVerificationStatus('idle')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  )}
                  
                  {verificationStatus === 'error' && (
                    <Button 
                      className="bg-red-700 hover:bg-red-800 text-white w-full"
                      onClick={() => setVerificationStatus('idle')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="externalName" className="text-gray-300">
                  Satellite Name
                </Label>
                <Input
                  id="externalName"
                  value={newSpacecraft.externalName}
                  onChange={handleInputChange}
                  className="bg-[#0f1628] border-[#2a3750] text-white"
                  placeholder="Zarya"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="displayName" className="text-gray-300">
                  Display Name (Optional)
                </Label>
                <Input
                  id="displayName"
                  value={newSpacecraft.displayName}
                  onChange={handleInputChange}
                  className="bg-[#0f1628] border-[#2a3750] text-white"
                  placeholder="Zarya"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-gray-300">
                    Type
                  </Label>
                  <Select 
                    value={newSpacecraft.type} 
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
                
                <div className="grid gap-2">
                  <Label htmlFor="missionId" className="text-gray-300">
                    Mission
                  </Label>
                  <Select 
                    value={newSpacecraft.missionId.toString()} 
                    onValueChange={(value) => handleSelectChange(value, 'missionId')}
                  >
                    <SelectTrigger className="bg-[#0f1628] border-[#2a3750] text-white">
                      <SelectValue placeholder="Select mission" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2236] border-[#2a3750] text-white">
                      {availableMissions.length > 0 ? (
                        availableMissions.map(mission => (
                          <SelectItem key={mission.id} value={mission.id}>
                            {mission.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-2 text-center text-gray-400">No missions available</div>
                      )}
                    </SelectContent>
                  </Select>
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
                onClick={handleCreateSpacecraft}
                disabled={!newSpacecraft.externalId || !newSpacecraft.externalName || !newSpacecraft.missionId}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                Add Satellite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Spacecraft Card Component updated to match the new API response format
interface SpacecraftCardProps {
  spacecraft: Spacecraft;
  onClick: () => void;
}

const SpacecraftCard = React.memo(function SpacecraftCard({ spacecraft, onClick }: SpacecraftCardProps) {
  return (
    <Card
      className="bg-[#0f1628] border-[#1a2236] hover:shadow-lg hover:shadow-blue-900/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-xl" title={spacecraft.externalName}>
              {spacecraft.displayName || spacecraft.externalName}
            </CardTitle>
            <p className="text-sm text-gray-400">ID: {spacecraft.externalId}</p>
            {spacecraft.externalName !== spacecraft.displayName && spacecraft.displayName && (
              <p className="text-sm text-gray-300 mt-1">{spacecraft.externalName}</p>
            )}
          </div>
          <Badge
            className="bg-blue-900 text-blue-100"
          >
            {spacecraft.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-gray-300">
          <Satellite className="h-4 w-4 text-blue-400" />
          <span>NORAD: {spacecraft.externalId}</span>
        </div>
      </CardContent>
    </Card>
  );
});