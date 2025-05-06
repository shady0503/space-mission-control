'use client';

import { formatDistanceToNow } from 'date-fns';
import { RecentActivity as RecentActivityType } from '@/lib/services/dashboardService';
import { 
  CheckCircle, XCircle, AlertCircle, Clock, 
  Rocket, Satellite, Globe, Terminal 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentActivityProps {
  data: RecentActivityType | null;
}

export default function RecentActivity({ data }: RecentActivityProps) {
  if (!data || !data.recentActivities || data.recentActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-800/40 rounded-lg border border-slate-700">
        <Clock className="h-10 w-10 text-slate-500 mb-3" />
        <p className="text-muted-foreground">No recent activities to display</p>
      </div>
    );
  }

  // Get icon and color for activity based on type and status
  const getActivityDetails = (type: string, status: string) => {
    // Icons based on type
    const typeIcons: Record<string, React.ReactNode> = {
      'COMMAND': <Terminal className="h-4 w-4" />,
      'MISSION': <Rocket className="h-4 w-4" />,
      'SATELLITE': <Satellite className="h-4 w-4" />,
      'SYSTEM': <Globe className="h-4 w-4" />,
    };
    
    // Colors based on status
    const statusColors: Record<string, string> = {
      'SUCCESS': 'bg-emerald-500/90 text-emerald-100 ring-1 ring-emerald-400/30',
      'PENDING': 'bg-amber-500/90 text-amber-100 ring-1 ring-amber-400/30',
      'FAILURE': 'bg-rose-500/90 text-rose-100 ring-1 ring-rose-400/30',
      'WARNING': 'bg-orange-500/90 text-orange-100 ring-1 ring-orange-400/30',
      'INFO': 'bg-blue-500/90 text-blue-100 ring-1 ring-blue-400/30',
    };
    
    // Status icons
    const statusIcons: Record<string, React.ReactNode> = {
      'SUCCESS': <CheckCircle className="h-4 w-4" />,
      'PENDING': <Clock className="h-4 w-4" />,
      'FAILURE': <XCircle className="h-4 w-4" />,
      'WARNING': <AlertCircle className="h-4 w-4" />,
      'INFO': <AlertCircle className="h-4 w-4" />,
    };
    
    return {
      icon: typeIcons[type] || <Globe className="h-4 w-4" />,
      color: statusColors[status] || 'bg-gray-500/90 text-gray-100 ring-1 ring-gray-400/30',
      statusIcon: statusIcons[status] || <AlertCircle className="h-4 w-4" />
    };
  };
  
  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {data.recentActivities.map((activity, index) => {
        const { icon, color, statusIcon } = getActivityDetails(activity.type, activity.status);
        const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
        
        return (
          <motion.div 
            key={activity.id} 
            className="flex items-start p-4 rounded-lg bg-slate-800/40 border border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 transition-all"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`p-2.5 rounded-full ${color} mr-4 shadow-lg`}>
              {icon}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium">{activity.message}</h4>
                <div className="flex items-center space-x-1.5 text-xs bg-slate-700/50 px-2 py-1 rounded-full">
                  {statusIcon}
                  <span className="uppercase tracking-wider font-semibold">{activity.status}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-2">
                <p className="text-xs text-muted-foreground bg-slate-700/30 px-2 py-0.5 rounded">
                  {activity.entity} #{activity.entityId}
                </p>
                <p className="text-xs text-muted-foreground italic">{timeAgo}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}