/**
 * Optimized Authentication Hook
 * React hook for managing authentication state with minimal session checks
 */

import { useSession, signOut, signIn } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Define these interfaces here instead of importing
export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  // Add new optional fields for registration
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// Add UserProfile interface for the extended user data
export interface UserData {
  sub?: string;
  id?: string;
  username?: string;
  email?: string;
  enterpriseId?: string;
  iat?: number;
  exp?: number;
}

// Create a stable empty user object to prevent unnecessary renders
const EMPTY_USER = Object.freeze({});

// Use a global cache to share auth state across components
let globalAuthCache = {
  isAuthenticated: false,
  user: EMPTY_USER,
  token: null,
  lastChecked: 0,
};

export const useAuth = () => {
  // Use Next.js session with minimal configuration
  const { data: session, status } = useSession({
    required: false,
    // Only trigger manual refetch every 5 minutes
    refetchInterval: 5 * 60, // 5 minutes in seconds
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only reference the session, don't make it a dependency for effects
  const sessionRef = useRef(session);
  const authCheckTimestampRef = useRef(0);

  // Update sessionRef when session changes, but don't trigger effects
  useEffect(() => {
    sessionRef.current = session;
    console.log(session?.user);

    // Only update global cache if this is a "fresh" session check
    if (session && Date.now() - authCheckTimestampRef.current > 1000) {
      authCheckTimestampRef.current = Date.now();
      globalAuthCache = {
        isAuthenticated: !!session,
        user: session?.user || EMPTY_USER,
        token: session?.accessToken || null,
        lastChecked: Date.now(),
      };
    }
  }, [session]);

  // Create stable auth state object that doesn't change on every render
  const authState = useRef({
    get isAuthenticated() {
      // Use cached value if checked recently (within 5 seconds)
      const cacheAge = Date.now() - globalAuthCache.lastChecked;
      if (cacheAge < 5000) {
        return globalAuthCache.isAuthenticated;
      }
      return !!sessionRef.current;
    },

    get user(): UserData {
      return sessionRef.current?.user || EMPTY_USER;
    },

    get token() {
      return sessionRef.current?.accessToken || null;
    },

    // Add convenient getters for specific user fields
    get id() {
      return sessionRef.current?.user?.id || "";
    },

    get username() {
      return sessionRef.current?.user?.username || "";
    },

    get email() {
      return sessionRef.current?.user?.email || "";
    },

    get enterpriseId() {
      return sessionRef.current?.user?.enterpriseId || "";
    },
  }).current;

  // Update the effect to store all user data in the global cache
  useEffect(() => {
    if (session) {
      console.log("=== SESSION DATA in useAuth ===");
      console.log("Full session:", JSON.stringify(session, null, 2));
      console.log("User data:", JSON.stringify(session.user, null, 2));
      console.log("Token exists:", !!session.accessToken);
      if (session.accessToken) {
        console.log(
          "Token preview:",
          session.accessToken.substring(0, 20) + "..."
        );

        // Try to decode token
        try {
          const parts = session.accessToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log(
              "Decoded token payload:",
              JSON.stringify(payload, null, 2)
            );
          }
        } catch (e) {
          console.error("Error decoding token:", e);
        }
      }
    }

    sessionRef.current = session;
    console.log(session?.user);

    // Only update global cache if this is a "fresh" session check
    if (session && Date.now() - authCheckTimestampRef.current > 1000) {
      authCheckTimestampRef.current = Date.now();
      globalAuthCache = {
        isAuthenticated: !!session,
        user: session?.user || EMPTY_USER,
        token: session?.accessToken || null,
        lastChecked: Date.now(),
      };
    }
  }, [session]);

  /**
   * Login with credentials - optimized to minimize re-renders
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        // Use Next Auth's signIn directly
        const result = await signIn("credentials", {
          redirect: false,
          identifier: credentials.identifier,
          password: credentials.password,
        });
        console.log('=== LOGIN RESULT ===');
        console.log('Result:', JSON.stringify(result, null, 2));

        const success = !result?.error;

        if (!success) {
          setError("Invalid credentials");
        } else {
          // Check if we have a redirect path
          let redirectPath = "/dashboard";
          // if (typeof window !== 'undefined') {
          //   const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
          //   if (storedRedirect) {
          //     redirectPath = storedRedirect;
          //     sessionStorage.removeItem('redirectAfterLogin');
          //   }
          // }
          router.push(redirectPath);
        }

        setIsLoading(false);
        return success;
      } catch (err) {
        console.error("Login error:", err);
        setError("Login failed. Please try again.");
        setIsLoading(false);
        return false;
      }
    },
    [router]
  );

  /**
   * Register a new user - optimized to minimize re-renders
   */
  const register = useCallback(async (data: RegistrationData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Direct API call for registration with all user fields
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const success = response.ok;

      if (!success) {
        setError("Registration failed");
      }

      setIsLoading(false);
      return success;
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
      setIsLoading(false);
      return false;
    }
  }, []);
  /**
   * Logout the current user - optimized to minimize re-renders
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call the backend logout endpoint if needed
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Backend logout failed:", error);
      }

      // Use NextAuth signOut
      await signOut({ callbackUrl: "/login" });

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    // Return stable references that don't change on each render
    isAuthenticated: authState.isAuthenticated,
    isLoading: status === "loading" || isLoading,
    user: authState.user,
    token: authState.token,
    id: authState.id,
    username: authState.username,
    email: authState.email,
    enterpriseId: authState.enterpriseId,
    login,
    register,
    logout,
    error,
  };
};
