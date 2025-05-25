import Scene from '@/components/visualization/3d/Scene'
import { TelemetryProvider } from '@/components/telemetry/TelemetryProvider'
import React from 'react'

export default function page() {
  return (
    <TelemetryProvider>
      <div
        className='relative w-full h-screen bg-black'
      >
        <Scene></Scene>
      </div>
    </TelemetryProvider>
  )
}
