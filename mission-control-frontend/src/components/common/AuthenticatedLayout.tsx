'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/common/sidebar';
import useAuthRedirect from '@/lib/hooks/useAuthRedirect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EnterpriseCheck from '@/components/common/EnterpriseCheck';

const publicRoutes = ['/', '/login', '/signup', '/auth/callback'];

const AuthenticatedLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthRedirect();
  const pathname = usePathname();

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // For public routes, don't show the sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading your session..." className="text-center" />
      </div>
    );
  }

  // For protected routes, show the layout with sidebar when authenticated
  if (isAuthenticated) {
    return (
      <EnterpriseCheck>
        <div className="flex h-screen w-full overflow-hidden bg-[#0f1628]">
          <div className="sidebar-container">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-auto w-full max-w-[calc(100%-16rem)] ml-auto lg:max-w-[calc(100%-5rem)]">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </EnterpriseCheck>
    );
  }

  // This should not be reached because useAuthRedirect will redirect,
  // but we'll handle it as a fallback
  return <>{children}</>;
};

export default AuthenticatedLayout;