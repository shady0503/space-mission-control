'use client';

import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mission, Operator, Spacecraft } from '@/lib/api/hooks/MissionHooks';

interface EditMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: boolean;
  };
  setEditForm: (form: any) => void;
  handleUpdateMission: () => Promise<void>;
}

export function EditMissionDialog({ 
  open, 
  onOpenChange, 
  editForm, 
  setEditForm, 
  handleUpdateMission 
}: EditMissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-300">Edit Mission</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-gray-300">Mission Name</Label>
            <Input
              id="name"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={editForm.startDate}
                onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate" className="text-gray-300">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={editForm.endDate}
                onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-white"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status" className="text-gray-300">Status</Label>
            <Select
              value={editForm.status ? "active" : "inactive"}
              onValueChange={(value) => setEditForm({
                ...editForm,
                status: value === "active"
              })}
            >
              <SelectTrigger className="bg-gray-700 border border-gray-600 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                <SelectItem value="active" className="hover:bg-gray-600">Active</SelectItem>
                <SelectItem value="inactive" className="hover:bg-gray-600">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateMission}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission;
  handleDeleteMission: () => Promise<void>;
}

export function DeleteMissionDialog({ 
  open, 
  onOpenChange, 
  mission, 
  handleDeleteMission 
}: DeleteMissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border border-gray-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-400">Delete Mission</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-300">Are you sure you want to delete <strong className="text-white">{mission.name}</strong>?</p>
          <p className="text-sm text-gray-400 mt-2">
            This action cannot be undone. All mission data will be permanently removed.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteMission}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Delete Mission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddOperatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newOperator: {
    operatorId: string;
    role: string;
  };
  setNewOperator: (operator: any) => void;
  allOperators: Operator[];
  operators: Operator[];
  isEditingOperator: boolean;
  handleAddOperator: () => Promise<void>;
  handleUpdateOperator: () => Promise<void>;
}

export function OperatorDialog({
  open,
  onOpenChange,
  newOperator,
  setNewOperator,
  allOperators,
  operators,
  isEditingOperator,
  handleAddOperator,
  handleUpdateOperator
}: AddOperatorDialogProps) {
  const dialogTitle = isEditingOperator ? 'Update Operator Role' : 'Add Operator to Mission';
  const actionButtonText = isEditingOperator ? 'Update Role' : 'Add to Mission';
  const handleAction = isEditingOperator ? handleUpdateOperator : handleAddOperator;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-300">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isEditingOperator && (
            <div className="grid gap-2">
              <Label htmlFor="operatorId" className="text-gray-300">Operator</Label>
              <Select
                value={newOperator.operatorId}
                onValueChange={(value) => setNewOperator({
                  ...newOperator,
                  operatorId: value
                })}
              >
                <SelectTrigger className="bg-gray-700 border border-gray-600 text-white">
                  <SelectValue placeholder="Select an operator" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                  {allOperators
                    .filter(op => !operators.some((mop) => mop.id === op.id))
                    .map((op) => (
                      <SelectItem
                        key={op.id}
                        value={op.id.toString()}
                        className="hover:bg-gray-600"
                      >
                        {op.username} ({op.email})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-gray-300">Role</Label>
            <Select
              value={newOperator.role}
              onValueChange={(value) => setNewOperator({
                ...newOperator,
                role: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border border-gray-600 text-white">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                <SelectItem
                  value="ADMIN"
                  className="hover:bg-gray-600"
                >
                  Admin
                </SelectItem>
                <SelectItem
                  value="VIEWER"
                  className="hover:bg-gray-600"
                >
                  Viewer
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-400 mt-1">
              Admins can manage the mission while viewers only have read access.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={!newOperator.operatorId}
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-900"
          >
            {actionButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface IssueCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCommand: {
    spacecraftId: string;
    commandType: string;
    payload: any;
  };
  setNewCommand: (command: any) => void;
  spacecrafts: Spacecraft[];
  handleIssueCommand: () => Promise<void>;
}

export function IssueCommandDialog({
  open,
  onOpenChange,
  newCommand,
  setNewCommand,
  spacecrafts,
  handleIssueCommand
}: IssueCommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-300">Issue Command</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="spacecraftId" className="text-gray-300">Target Spacecraft</Label>
            <Select
              value={newCommand.spacecraftId}
              onValueChange={(value) => setNewCommand({
                ...newCommand,
                spacecraftId: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border border-gray-600 text-white">
                <SelectValue placeholder="Select spacecraft" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                {spacecrafts && spacecrafts.map((spacecraft) => (
                  <SelectItem
                    key={spacecraft.id}
                    value={spacecraft.id.toString()}
                    className="hover:bg-gray-600"
                  >
                    {spacecraft.spacecraftName || spacecraft.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="commandType" className="text-gray-300">Command Type</Label>
            <Select
              value={newCommand.commandType}
              onValueChange={(value) => setNewCommand({
                ...newCommand,
                commandType: value
              })}
            >
              <SelectTrigger className="bg-gray-700 border border-gray-600 text-white">
                <SelectValue placeholder="Select command type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                <SelectItem value="ADJUST_TRAJECTORY" className="hover:bg-gray-600">
                  Adjust Trajectory
                </SelectItem>
                <SelectItem value="SHUTDOWN" className="hover:bg-gray-600">
                  Shutdown
                </SelectItem>
                <SelectItem value="EMERGENCY_STOP" className="hover:bg-gray-600">
                  Emergency Stop
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-300">Command Parameters</Label>
            <Textarea
              placeholder="Enter JSON format parameters..."
              className="bg-gray-700 border border-gray-600 text-white font-mono text-sm h-24"
              onChange={(e) => {
                try {
                  const payload = JSON.parse(e.target.value);
                  setNewCommand({
                    ...newCommand,
                    payload
                  });
                } catch (error) {
                  // Invalid JSON – you may wish to handle this case
                }
              }}
            />
            <p className="text-sm text-gray-400">
              Example: {"{"}"deltaX": 10, "deltaY": 0, "deltaZ": 5{"}"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleIssueCommand}
            disabled={!newCommand.spacecraftId || !newCommand.commandType}
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-900"
          >
            Issue Command
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}