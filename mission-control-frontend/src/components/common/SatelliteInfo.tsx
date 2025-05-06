/* path to file: src/components/common/SatelliteInfo.tsx */
'use client';

import React from 'react';
import { SatelliteConfig } from '@/types/SatelliteConfig';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

interface SatelliteInfoProps {
  config: SatelliteConfig;
  position: THREE.Vector3;
}

const SatelliteInfo: React.FC<SatelliteInfoProps> = ({ config, position }) => {
  const { name, details, orbitRadius, speed, scale } = config;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
      className="absolute top-4 right-4 max-w-xs z-50"
    >
      <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-xl text-slate-50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Info size={16} className="text-blue-400" />
              {name}
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
              Active
            </Badge>
          </div>
        </CardHeader>
        <Separator className="bg-slate-700/50" />
        <CardContent className="pt-3 px-4 pb-4">
          <p className="text-sm text-slate-300 mb-3">{details}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Orbit Radius</span>
              <span className="font-mono text-slate-200">{orbitRadius}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Speed</span>
              <span className="font-mono text-slate-200">{speed}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Scale</span>
              <span className="font-mono text-slate-200">{scale}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Position</span>
              <span className="font-mono text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
                {position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SatelliteInfo;