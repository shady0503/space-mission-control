'use client';
import React, { createContext, useContext } from 'react';
import useTelemetry from '@/lib/hooks/useTelemetry';

const TelemetryContext = createContext<ReturnType<typeof useTelemetry> | null>(null);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const telemetry = useTelemetry();
  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetryContext = () => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetryContext must be used within a TelemetryProvider');
  return ctx;
}; 