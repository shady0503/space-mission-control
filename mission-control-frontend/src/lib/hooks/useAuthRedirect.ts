// lib/hooks/useAuthRedirect.ts
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AuthRedirectOptions {
  // Routes that require authentication
  protectedRoutes?: string[];
  // Routes that are only accessible when NOT authenticated (e.g., login, signup)
  authRoutes?: string[];
  // Where to redirect when a user accesses a protected route without authentication
  fallbackUrl?: string;
  // Where to redirect when an authenticated user tries to access auth routes
  authenticatedRedirect?: string;
}

/**
 * Hook to handle authentication-based redirects
 */
export function useAuthRedirect({
  protectedRoutes = ['/dashboard', '/missions', '/telemetry', '/observatory', '/discoveries', '/globes', '/profile', '/settings'],
  authRoutes = ['/login', '/signup', '/auth/callback'],
  fallbackUrl = '/login',
  authenticatedRedirect = '/telemetry'
}: AuthRedirectOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine if the current route is protected or auth-only
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname?.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname?.startsWith(route)
  );

  useEffect(() => {
    // Don't redirect during loading state
    if (status === 'loading') return;
    
    const isAuthenticated = !!session;
    
    // Scenario 1: User is not authenticated and tries to access a protected route
    if (!isAuthenticated && isProtectedRoute) {
      // Store the intended destination to redirect back after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname || '/');
      }
      router.push(fallbackUrl);
    }
    
    // Scenario 2: User is authenticated and tries to access an auth route (login/signup)
    if (isAuthenticated && isAuthRoute) {
      // Check if we have a stored redirect path
      let redirectPath = authenticatedRedirect;
      if (typeof window !== 'undefined') {
        const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
        if (storedRedirect) {
          redirectPath = storedRedirect;
          sessionStorage.removeItem('redirectAfterLogin');
        }
      }
      router.push(redirectPath);
    }
  }, [session, status, pathname, router, isProtectedRoute, isAuthRoute, fallbackUrl, authenticatedRedirect]);

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user,
    token: session?.accessToken
  };
}

export default useAuthRedirect;