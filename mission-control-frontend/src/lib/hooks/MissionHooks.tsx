'use client';

import { useState, useEffect } from 'react';
import { missionService } from '@/lib/services/missionService';
import { commandService } from '@/lib/services/commandService';
import { operatorService } from '@/lib/services/operatorService';
import { spacecraftService } from '@/lib/services';
import { useAuth } from '@/lib/hooks/useAuth';

// Type definitions matching the new API structure
export interface Mission {
    id: string;
    enterpriseId: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
    createdAt: string;
}

export interface Operator {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    enterpriseId?: string;
}

export interface OperatorWithRole {
    operator: Operator;
    role: 'ADMIN' | 'VIEWER';
}

export interface Satellite {
    id: string;
    externalId: number;
    externalName: string;
    missionId: string;
    enterpriseId: string;
    type: string;
    displayName: string;
    commands: Command[];
}

export interface Command {
    id: string;
    spacecraftId: string;
    missionId: string;
    commandType: string;
    operatorId: string;
    payload: string;         // JSON-string
    status: boolean;
    createdAt: string;
    executedAt?: string;
}

// Hook for mission data
export function useMissionData(missionId: string) {
    const [mission, setMission] = useState<Mission | null>(null);
    const [operators, setOperators] = useState<OperatorWithRole[]>([]);
    const [spacecrafts, setSpacecrafts] = useState<Satellite[]>([]);
    const [commands, setCommands] = useState<Command[]>([]);
    const [allOperators, setAllOperators] = useState<Operator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    // Function to load all mission data
    async function loadData() {
        if (!missionId) return;

        try {
            setLoading(true);

            // Fetch all required data
            console.log("Fetching mission data...", missionId);
            const [missionData, operatorsData, spacecraftData, allOperatorsData] = await Promise.all([
                missionService.getMission(missionId, user?.id),
                missionService.getMissionOperators(missionId, user?.id),
                spacecraftService.getSpacecraftByMission(missionId),
                operatorService.getAllOperators(user?.enterpriseId || '')
            ]);

            console.log("fetched operators", operatorsData);

            // Set state with fetched data
            setMission(missionData);
            setOperators(operatorsData);
            setSpacecrafts(spacecraftData);
            setAllOperators(allOperatorsData);

            // Fetch commands
            if (missionData.id) {
                const commandsData = await commandService.getMissionCommands(missionData.id);
                setCommands(commandsData);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading mission data:', error);
            setError(error instanceof Error ? error : new Error('Failed to load mission data'));
            setLoading(false);
        }
    }

    // Refresh functions to reload specific data sets
    const refreshMission = async () => {
        try {
            const data = await missionService.getMission(missionId, user?.id);
            setMission(data);
        } catch (err) {
            console.error('Error refreshing mission:', err);
        }
    };

    const refreshOperators = async () => {
        try {
            const data = await missionService.getMissionOperators(missionId, user?.id);
            setOperators(data);
        } catch (err) {
            console.error('Error refreshing operators:', err);
        }
    };

    const refreshSpacecrafts = async () => {
        try {
            const data = await spacecraftService.getSpacecraftByMission(missionId);
            setSpacecrafts(data);
        } catch (err) {
            console.error('Error refreshing spacecrafts:', err);
        }
    };

    const refreshCommands = async () => {
        if (!mission?.id) return;
        try {
            const data = await commandService.getMissionCommands(mission.id);
            setCommands(data);
        } catch (err) {
            console.error('Error refreshing commands:', err);
        }
    };

    // Load data on initial render
    useEffect(() => {
        loadData();
    }, [missionId]);

    return {
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
    };
}

// Hook for checking admin status
export function useAdminStatus(operators: OperatorWithRole[]) {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!operators || !user || !user.email) return;

        // Find current user in operators list and check role
        const currentOperator = operators.find(op => op.operator.email === user.email);
        const userIsAdmin = currentOperator && currentOperator.role === 'ADMIN';

        setIsAdmin(userIsAdmin);
    }, [operators, user]);

    return { isAdmin, user };
}

// Hook for managing form states
export function useMissionForms(mission: Mission | null) {
    // Edit mission form
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'PLANNING' as 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED'
    });

    // New operator form
    const [newOperator, setNewOperator] = useState({
        operatorId: '',
        role: 'VIEWER' as 'ADMIN' | 'VIEWER'
    });

    // New command form
    const [newCommand, setNewCommand] = useState({
        spacecraftId: '',
        commandType: '',
        payload: {}
    });

    // Initialize edit form when mission data is loaded
    useEffect(() => {
        if (mission) {
            setEditForm({
                name: mission.name || '',
                description: mission.description || '',
                startDate: mission.startDate ? mission.startDate.split('T')[0] : '',
                endDate: mission.endDate ? mission.endDate.split('T')[0] : '',
                status: mission.status
            });
        }
    }, [mission]);

    return {
        editForm, setEditForm,
        newOperator, setNewOperator,
        newCommand, setNewCommand
    };
}

// Hook for dialog states
export function useDialogState() {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [operatorDialogOpen, setOperatorDialogOpen] = useState(false);
    const [commandDialogOpen, setCommandDialogOpen] = useState(false);
    const [isEditingOperator, setIsEditingOperator] = useState(false);

    return {
        editDialogOpen, setEditDialogOpen,
        deleteDialogOpen, setDeleteDialogOpen,
        operatorDialogOpen, setOperatorDialogOpen,
        commandDialogOpen, setCommandDialogOpen,
        isEditingOperator, setIsEditingOperator
    };
}