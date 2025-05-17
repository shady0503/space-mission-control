'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useMissionData,
  useAdminStatus,
  useMissionForms,
  useDialogState,
  Mission,
  Spacecraft,
  Operator,
  OperatorWithRole,
  Command
} from '@/lib/hooks/MissionHooks';
import {
  missionService,
  commandService,
  operatorService,
  spacecraftService
} from '@/lib/services';
import {
  ArrowLeft,
  AlertTriangle,
  RotateCw,
  Satellite,
  Users,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MissionHeader,
  MissionProgress,
  MissionStats,
  SpacecraftTab,
  TeamTab,
  CommandsTab,
  MissionTimeline,
  RoleAccess
} from '@/components/Mission/MissionComponents';
import {
  EditMissionDialog,
  DeleteMissionDialog,
  OperatorDialog,
  IssueCommandDialog,
  AddSpacecraftDialog
} from '@/components/Mission/MissionDialogs';
import { useAuth } from '@/lib/hooks';

export default function MissionDetailsPage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const missionId = React.use(params).id;
  const { user } = useAuth(); // Get the current logged-in user

  const {
    mission,
    operators,
    spacecrafts,
    commands,
    allOperators,
    loading,
    error,
    refreshMission,
    refreshOperators,
    refreshSpacecrafts,
    refreshCommands,
    setMission
  } = useMissionData(missionId);

  const { isAdmin } = useAdminStatus(operators);

  const {
    editForm,
    setEditForm,
    newOperator,
    setNewOperator,
    newCommand,
    setNewCommand
  } = useMissionForms(mission);

  const {
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    operatorDialogOpen,
    setOperatorDialogOpen,
    commandDialogOpen,
    setCommandDialogOpen,
    isEditingOperator,
    setIsEditingOperator
  } = useDialogState();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const calculateProgress = () => {
    if (!mission) return 0;
    const start = new Date(mission.startDate).getTime();
    const end = new Date(mission.endDate).getTime();
    const now = Date.now();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };


  interface SpacecraftTabProps {
    spacecrafts: Spacecraft[];
    isAdmin: boolean;
    openCommandDialog: (spacecraftId: string) => void;
    handleRemoveSpacecraft: (id: string) => void;
    openAddSpacecraftDialog: () => void;
  }

  // Add this to your page.tsx file
  // Add this state in your component
  const [addSpacecraftDialogOpen, setAddSpacecraftDialogOpen] = useState(false);
  const [newSpacecraft, setNewSpacecraft] = useState({
    externalId: '',
    externalName: '',
    type: 'SATELLITE',
    displayName: ''
  });

  // Add this function to handle adding a spacecraft
  const handleAddSpacecraft = async () => {
    if (!mission) return;

    try {
      // Convert externalId to a number
      const spacecraftData = {
        externalId: parseInt(newSpacecraft.externalId, 10),
        externalName: newSpacecraft.externalName,
        displayName: newSpacecraft.displayName,
        type: newSpacecraft.type,
        missionId: mission.id,
        enterpriseId: mission.enterpriseId
      };

      await spacecraftService.createSpacecraft(spacecraftData, user.id);
      setAddSpacecraftDialogOpen(false);
      setNewSpacecraft({
        externalId: '',
        externalName: '',
        type: 'SATELLITE',
        displayName: ''
      });
      await refreshSpacecrafts();
    } catch (err) {
      console.error('Error adding spacecraft:', err);
    }
  };



  // Format ISO date string for API
  const formatISODate = (date: string): string => {
    // If the date already has time component, return it
    if (date.includes('T')) return date;
    // Otherwise add time component
    return `${date}T00:00:00`;
  };

  // --- mission actions ---
  const handleUpdateMission = async () => {
    if (!mission) return;
    try {
      const updated: Mission = {
        ...mission,
        name: editForm.name,
        description: editForm.description,
        startDate: formatISODate(editForm.startDate),
        endDate: formatISODate(editForm.endDate),
        status: editForm.status
      };

      console.log('Updating mission:', updated);
      await missionService.updateMission(updated, user.id);
      setMission(updated);
      await Promise.all([refreshOperators(), refreshSpacecrafts()]);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating mission:', err);
    }
  };

  const handleDeleteMission = async () => {
    if (!mission) return;
    try {
      await missionService.deleteMission(mission.id, user.id);
      router.push('/missions');
    } catch (err) {
      console.error('Error deleting mission:', err);
    }
  };

  // --- operator actions ---
  const handleUpsertOperator = async () => {
    if (!mission || !newOperator.operatorId) return;
    try {
      await missionService.upsertOperator(
        mission.id,
        newOperator.operatorId,
        user.id,
        newOperator.role
      );
      setOperatorDialogOpen(false);
      setNewOperator({ operatorId: '', role: 'VIEWER' });
      setIsEditingOperator(false);
      await refreshOperators();
    } catch (err) {
      console.error('Error updating operator:', err);
    }
  };

  const handleRemoveOperator = async (operatorId: string) => {
    if (!mission) return;
    try {
      // Call upsertOperator with no role to remove the operator
      await missionService.upsertOperator(mission.id, operatorId, user.id);
      await refreshOperators();
    } catch (err) {
      console.error('Error removing operator:', err);
    }
  };

  // --- command actions ---
  const handleIssueCommand = async () => {
    if (!mission || !newCommand.spacecraftId || !newCommand.commandType)
      return;
    try {
      await commandService.issueCommand({
        spacecraftId: newCommand.spacecraftId,
        missionId: mission.id,
        commandType: newCommand.commandType,
        payload: JSON.stringify(newCommand.payload)
      }, user.id);
      setCommandDialogOpen(false);
      setNewCommand({ spacecraftId: '', commandType: '', payload: {} });
      await refreshCommands();
    } catch (err) {
      console.error('Error issuing command:', err);
    }
  };

  const handleExecuteCommand = async (command: Command) => {
    try {
      await commandService.executeCommand(command.id, user.id);
      await refreshCommands();
    } catch (err) {
      console.error('Error executing command:', err);
    }
  };

  // --- spacecraft actions ---
  const handleRemoveSpacecraft = async (spacecraftId: string) => {
    try {
      await spacecraftService.updateSpacecraft({
        id: spacecraftId,
        missionId: '' // detach by clearing missionId
      }, user.id);
      await refreshSpacecrafts();
    } catch (err) {
      console.error('Error detaching spacecraft:', err);
    }
  };

  // --- open dialogs ---
  const openCommandDialog = (spacecraftId = '') => {
    setNewCommand(cmd => ({ ...cmd, spacecraftId }));
    setCommandDialogOpen(true);
  };

  const openEditOperatorDialog = (operator: Operator, role: string) => {
    setNewOperator({
      operatorId: operator.id,
      role
    });
    setIsEditingOperator(true);
    setOperatorDialogOpen(true);
  };

  // --- loading / error states ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <RotateCw className="h-10 w-10 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <div className="container mx-auto p-4">
          <div className="bg-red-900/20 border border-red-700/30 text-red-400 p-4 rounded-md mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Mission not found</span>
          </div>
          <Button
            onClick={() => router.push('/missions')}
            variant="outline"
            className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Missions
          </Button>
        </div>
      </div>
    );
  }

  // --- main render ---
  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <div className="container mx-auto py-6 px-4">
        <MissionHeader
          mission={mission}
          isAdmin={isAdmin}
          onBack={() => router.push('/missions')}
          onEdit={() => setEditDialogOpen(true)}
          onDelete={() => setDeleteDialogOpen(true)}
        />

        <MissionProgress
          mission={mission}
          formatDate={formatDate}
          calculateProgress={calculateProgress}
        />

        <MissionStats
          operators={operators}
          spacecrafts={spacecrafts}
          commands={commands}
          mission={mission}
        />

        <Tabs defaultValue="spacecraft" className="mb-8 w-full">
          <TabsList className="bg-gray-800 mb-4 w-full">
            <TabsTrigger
              value="spacecraft"
              className="data-[state=active]:bg-purple-600 text-white data-[state=active]:text-blue-200"
            >
              <Satellite className="h-4 w-4 mr-2" /> Spacecraft
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-purple-600 text-white data-[state=active]:text-blue-200"
            >
              <Users className="h-4 w-4 mr-2" /> Team
            </TabsTrigger>
            <TabsTrigger
              value="commands"
              className="data-[state=active]:bg-purple-600 text-white data-[state=active]:text-blue-200"
            >
              <Send className="h-4 w-4 mr-2" /> Commands
            </TabsTrigger>
          </TabsList>

          <SpacecraftTab
            spacecrafts={spacecrafts}
            isAdmin={isAdmin}
            openCommandDialog={openCommandDialog}
            handleRemoveSpacecraft={handleRemoveSpacecraft}
            openAddSpacecraftDialog={() => setAddSpacecraftDialogOpen(true)}
          />

          <TeamTab
            operators={operators}
            user={user}
            isAdmin={isAdmin}
            openEditOperatorDialog={(operator, role) => openEditOperatorDialog(operator, role)}
            handleRemoveOperator={handleRemoveOperator}
            openAddOperatorDialog={() => {
              setIsEditingOperator(false);
              setNewOperator({ operatorId: '', role: 'VIEWER' });
              setOperatorDialogOpen(true);
            }}
          />

          <CommandsTab
            commands={commands}
            isAdmin={isAdmin}
            spacecrafts={spacecrafts}
            openCommandDialog={() => openCommandDialog()}
            handleExecuteCommand={handleExecuteCommand}
          />
        </Tabs>

        <MissionTimeline
          mission={mission}
          formatDate={formatDate}
          spacecrafts={spacecrafts}
        />

        <RoleAccess user={user} isAdmin={isAdmin} />
      </div>

      <EditMissionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        handleUpdateMission={handleUpdateMission}
      />

      <DeleteMissionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        mission={mission}
        handleDeleteMission={handleDeleteMission}
      />

      <OperatorDialog
        open={operatorDialogOpen}
        onOpenChange={setOperatorDialogOpen}
        newOperator={newOperator}
        setNewOperator={setNewOperator}
        allOperators={allOperators}
        operators={operators}
        isEditingOperator={isEditingOperator}
        handleAddOperator={handleUpsertOperator}
        handleUpdateOperator={handleUpsertOperator}
      />

      <IssueCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
        newCommand={newCommand}
        setNewCommand={setNewCommand}
        spacecrafts={spacecrafts}
        handleIssueCommand={handleIssueCommand}
      />

      <AddSpacecraftDialog
        open={addSpacecraftDialogOpen}
        onOpenChange={setAddSpacecraftDialogOpen}
        missionId={mission.id}
        enterpriseId={mission.enterpriseId}
        handleAddSpacecraft={handleAddSpacecraft}
        newSpacecraft={newSpacecraft}
        setNewSpacecraft={setNewSpacecraft}
      />
    </div>
  );
}