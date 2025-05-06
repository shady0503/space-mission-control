'use client';

import { Rocket, Satellite, User, AlertTriangle, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardSummary as DashboardSummaryType } from '@/lib/services/dashboardService';
import { motion } from 'framer-motion';

interface DashboardSummaryProps {
  data: DashboardSummaryType | null;
}

export default function DashboardSummary({ data }: DashboardSummaryProps) {
  if (!data) return null;
  
  const summaryItems = [
    {
      title: 'Active Missions',
      value: data.activeMissionCount,
      icon: <Rocket className="h-8 w-8" />,
      description: 'Current ongoing missions',
      color: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
      iconColor: 'text-indigo-300',
      borderColor: 'border-indigo-700',
      ringColor: 'ring-indigo-500/20',
      textColor: 'text-indigo-300',
      hoverColor: 'hover:from-indigo-500 hover:to-indigo-600'
    },
    {
      title: 'Spacecraft',
      value: data.totalSpacecraftCount,
      icon: <Satellite className="h-8 w-8" />,
      description: 'Total managed spacecraft',
      color: 'bg-gradient-to-br from-cyan-600 to-cyan-700',
      iconColor: 'text-cyan-300',
      borderColor: 'border-cyan-700',
      ringColor: 'ring-cyan-500/20',
      textColor: 'text-cyan-300',
      hoverColor: 'hover:from-cyan-500 hover:to-cyan-600'
    },
    {
      title: 'Active Operators',
      value: data.activeOperatorCount,
      icon: <User className="h-8 w-8" />,
      description: 'Personnel on duty',
      color: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
      iconColor: 'text-emerald-300',
      borderColor: 'border-emerald-700',
      ringColor: 'ring-emerald-500/20',
      textColor: 'text-emerald-300',
      hoverColor: 'hover:from-emerald-500 hover:to-emerald-600'
    },
    {
      title: 'Pending Commands',
      value: data.pendingCommandCount,
      icon: <Send className="h-8 w-8" />,
      description: 'Commands awaiting execution',
      color: 'bg-gradient-to-br from-amber-600 to-amber-700',
      iconColor: 'text-amber-300',
      borderColor: 'border-amber-700',
      ringColor: 'ring-amber-500/20',
      textColor: 'text-amber-300',
      hoverColor: 'hover:from-amber-500 hover:to-amber-600'
    },
    {
      title: 'Recent Alerts',
      value: data.recentAlertCount,
      icon: <AlertTriangle className="h-8 w-8" />,
      description: 'Alerts in the last 24h',
      color: 'bg-gradient-to-br from-rose-600 to-rose-700',
      iconColor: 'text-rose-300',
      borderColor: 'border-rose-700',
      ringColor: 'ring-rose-500/20',
      textColor: 'text-rose-300',
      hoverColor: 'hover:from-rose-500 hover:to-rose-600'
    }
  ];

  // Animation variants
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
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {summaryItems.map((item) => (
        <motion.div key={item.title} variants={itemVariants} className="h-full">
          <Card
            className={`
              ${item.color} shadow-lg border ${item.borderColor} ring-1 ${item.ringColor}
              transition-all ${item.hoverColor} hover:shadow-xl hover:scale-[1.02] h-full
            `}
          >
            {/* Use relative positioning to place icon at top-right */}
            <CardContent className="relative p-6 h-full">
              {/* Top-right icon */}
              <div
                className={`absolute top-4 right-4 p-3 rounded-full bg-black/20 ${item.iconColor}`}
              >
                {item.icon}
              </div>

              <p className="text-sm font-medium text-white/80 mb-1">{item.title}</p>
              <h3 className={`text-3xl font-bold ${item.textColor} mt-2`}>
                {item.value}
              </h3>
              <p className="text-xs text-white/70 mt-2">
                {item.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
