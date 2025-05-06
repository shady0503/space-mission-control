// useTelemetry.tsx
import { useState, useEffect } from "react";

export interface TelemetryData {
  id: {
    time: string;
    spacecraftId: number;
  };
  // Telemetry data from the backend (in our simulation, these are updated in real time)
  positionX: number;    // Longitude (degrees)
  positionY: number;    // Latitude (degrees)
  positionZ: number;    // Altitude (km)
  orbitRadius: number;  // Computed: Earth radius (in km) + altitude
  velocity: number;     // In km/s or scaled units
  acceleration: number; // In km/s² or scaled units
  source: string;
  traceContext: string | null;
}

const useTelemetry = () => {
  const [data, setData] = useState<TelemetryData | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws/trajectory");
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      try {
        const telemetry: TelemetryData = JSON.parse(event.data);
        setData(telemetry);
      } catch (error) {
        console.error("Error parsing telemetry:", error);
      }
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      ws.close();
    };
  }, []);

  return data;
};

export default useTelemetry;
