'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      // Perform the logout operation
      await logout();
      
      // Redirect to login page
      router.push('/login');
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-slate-900">
      <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-xl backdrop-blur-sm flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white mb-4">Logging Out</h1>
        <LoadingSpinner size="large" message="Ending your session..." className="mt-4" />
      </div>
    </div>
  );
}