// SatelliteControls.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SatelliteConfig } from '@/types/SatelliteConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface SatelliteControlsProps {
  config: SatelliteConfig;
  onChange: (newConfig: Partial<SatelliteConfig>) => void;
}

const SatelliteControls: React.FC<SatelliteControlsProps> = ({ config, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="absolute top-4 left-4 max-w-xs z-50"
    >
      <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-xl text-slate-50">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-lg font-medium">Satellite Controls</CardTitle>
        </CardHeader>
        <Separator className="bg-slate-700/50" />
        <CardContent className="pt-3 px-4 pb-4 space-y-4">
          <div>
            <Label className="text-sm text-slate-300">Speed: {config.speed.toFixed(2)}</Label>
            <Slider
              value={[config.speed]}
              onValueChange={(val) => onChange({ speed: val[0] })}
              min={0.01}
              max={1}
              step={0.01}
            />
          </div>
          <div>
            <Label className="text-sm text-slate-300">
              Orbit Radius: {config.orbitRadius.toFixed(2)}
            </Label>
            <Slider
              value={[config.orbitRadius]}
              onValueChange={(val) => onChange({ orbitRadius: val[0] })}
              min={5}
              max={50}
              step={0.5}
            />
          </div>
          <div>
            <Label className="text-sm text-slate-300">Scale: {config.scale.toFixed(2)}</Label>
            <Slider
              value={[config.scale]}
              onValueChange={(val) => onChange({ scale: val[0] })}
              min={0.1}
              max={2}
              step={0.1}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SatelliteControls;
