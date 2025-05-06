// types/SatelliteConfig.ts
export interface SatelliteConfig {
  name: string;
  details: string;
  scale: number;
  modelUrl: string;
  satId?: string; // Added to identify the satellite in telemetry data
}