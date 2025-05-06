/**
 * Authentication Utilities
 * Functions for managing authentication state and tokens
 */

import { getSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { API_CONFIG } from './config';

/**
 * Get the authentication token from the session
 * @returns The authentication token or null if not authenticated
 */// In auth.ts - modify getAuthToken
// In auth.ts - modify getAuthToken
export const getAuthToken = async (): Promise<string | null> => {
  // Only check localStorage in browser environment
  if (typeof window !== 'undefined') {
    const cachedToken = localStorage.getItem('auth_token');
    const tokenExpiry = localStorage.getItem('token_expiry');
    
    if (cachedToken && tokenExpiry && parseInt(tokenExpiry) > Date.now()) {
      return cachedToken;
    }
  }
  
  const session = await getSession();
  const token = session?.accessToken || null;
  
  if (token && typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_expiry', (Date.now() + 55 * 60 * 1000).toString());
  }
  
  return token;
};

// Only refresh when actually needed
export const refreshToken = async (): Promise<boolean> => {
  try {
    // Clear out any problematic existing tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Token refresh failed with status:', response.status);
      return false;
    }
    
    // Get the new token from the response
    const data = await response.json();
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token_expiry', (Date.now() + 55 * 60 * 1000).toString());
    }
    
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Sign in with credentials using NextAuth
 * @param identifier Username or email
 * @param password User password
 * @returns Whether the sign in was successful
 */
export const signIn = async (
  identifier: string, 
  password: string
): Promise<boolean> => {
  try {
    const result = await nextAuthSignIn('credentials', {
      redirect: false,
      identifier,
      password,
    });
    
    return !result?.error;
  } catch (error) {
    console.error('Sign in failed:', error);
    return false;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    // First try to call the backend logout endpoint
    await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Backend logout failed:', error);
  }
  
  // Always perform NextAuth sign out
  await nextAuthSignOut({ callbackUrl: '/login' });
};

/**
 * Register a new user
 * @param username Username
 * @param email Email address
 * @param password Password
 * @returns Whether the registration was successful
 */
export const register = async (
  username: string,
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNUP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Registration failed:', error);
    return false;
  }
};