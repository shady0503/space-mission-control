// app/page.tsx
'use client';

import React from 'react';
import Scene from '@/components/visualization/3d/Scene';

const HomePage: React.FC = () => {
  return (
    <div 
    className='bg-black'
    style={{ height: '100vh', width: '100vw', }}>
      <Scene />
    </div>
  );
};

export default HomePage;
