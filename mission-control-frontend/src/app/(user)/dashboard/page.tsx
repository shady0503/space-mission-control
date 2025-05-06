'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { dashboardService } from '@/lib/services';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import MissionStatistics from '@/components/dashboard/MissionStatistics';
import TelemetryOverview from '@/components/dashboard/TelemetryOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { Rocket, RefreshCw } from 'lucide-react';
import enterpriseService from '@/lib/services/enterpriseService';

// Define a single dashboard data object to manage state more efficiently
interface DashboardData {
  summaryData: any;
  missionStats: any;
  spacecraftStats: any;
  commandStats: any;
  // recentActivity: any;
  telemetrySummary: any;
  enterpriseData: any; // Add enterprise data type here
}

export default function DashboardPage() {
  const { user } = useAuth(); // Get user data from auth hook
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const requestInProgressRef = useRef(false);
  // Use a ref to track if it's the initial load
  const initialLoadRef = useRef(true);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    // Don't proceed if user data is not available yet
    if (!user?.id) {
      return;
    }
    
    if (requestInProgressRef.current) {
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else if (initialLoadRef.current) {
      setIsLoading(true);
    }

    setError(null);
    requestInProgressRef.current = true;

    try {
      const [summary, missions, spacecraft, commands, telemetry, enterprise] = await Promise.all([
        dashboardService.getSummary(user.id),
        dashboardService.getMissionStats(user.id),
        dashboardService.getSpacecraftStats(user.id),
        dashboardService.getCommandStats(user.id),
        // dashboardService.getRecentActivity(user.id, 10), // Limit to 10 most recent
        dashboardService.getTelemetrySummary(user.enterpriseId),
        enterpriseService.getEnterprise(user.enterpriseId) // Fetch enterprise data
      ]);

      if (isMountedRef.current) {
        setDashboardData({
          summaryData: summary,
          missionStats: missions,
          spacecraftStats: spacecraft,
          commandStats: commands,
          // recentActivity: activities,
          telemetrySummary: telemetry,
          enterpriseData: enterprise // Store enterprise data in state
        });
        setLastUpdated(new Date());
        initialLoadRef.current = false; // Mark initial load complete
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (isMountedRef.current) {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      requestInProgressRef.current = false;
    }
  }, [user]); // Add user as a dependency to re-fetch when user changes

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Setup initial data fetch (no periodic refresh)
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only fetch data when user is available
    if (user?.id) {
      fetchDashboardData();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchDashboardData, user]); // Add user dependency here as well

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Show loading state if user data isn't available or still loading
  if (!user?.id || (isLoading && !dashboardData)) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 p-8 flex items-center justify-center min-h-screen">
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-xl backdrop-blur-sm flex flex-col items-center">
          <Rocket className="h-16 w-16 text-indigo-400 mb-4 animate-pulse" />
          <LoadingSpinner size="large" message="Establishing mission control link..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen p-6">
        <ErrorDisplay
          title="Mission Control Error"
          error={error}
          retry={handleRefresh}
          className="bg-slate-800/70 border-slate-700 backdrop-blur-sm"
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
      <motion.div
        className="container mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          className="mb-8 flex justify-between items-center"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              {/* Add user's username if available */}
              Mission Control Dashboard {user.username ? `- ${user.username}` : ''}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Real-time overview of mission status and satellite telemetry
              {user.enterpriseId && ` for Enterprise : ${dashboardData?.enterpriseData?.name}`}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </motion.div>

        {/* Dashboard Summary */}
        <motion.div variants={itemVariants}>
          <DashboardSummary data={dashboardData?.summaryData} />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6" // added h-full
          variants={itemVariants}
        >
          <MissionStatistics
            missionStats={dashboardData?.missionStats}
            spacecraftStats={dashboardData?.spacecraftStats}
            commandStats={dashboardData?.commandStats}
          />
          <motion.div
          className='flex flex-col gap-4 h-full'
          >
          <TelemetryOverview telemetrySummary={dashboardData?.telemetrySummary} />
          {/*<Card className="w-full bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader className="bg-slate-800/50 border-b border-slate-700 pb-4">
              <CardTitle className="flex items-center">
                <RefreshCw className="h-5 w-5 text-amber-400 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <RecentActivity data={dashboardData?.recentActivity} />
            </CardContent>
          </Card> */}
          </motion.div>
        </motion.div>

        <Separator className="my-8 opacity-30" />

        {/* Recent Activity Feed */}
        <motion.div variants={itemVariants}>
          
        </motion.div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            Mission Control Dashboard v2.0 • Last Updated:{" "}
            {lastUpdated ? lastUpdated.toLocaleTimeString() : new Date().toLocaleTimeString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}