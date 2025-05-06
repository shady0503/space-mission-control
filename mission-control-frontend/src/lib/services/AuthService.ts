/**
 * Authentication Service
 * Functions for managing user authentication
 */

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { API_CONFIG } from '../api/config';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  /**
   * Login with credentials
   * @param credentials User credentials
   * @returns Whether login was successful
   */
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const result = await nextAuthSignIn('credentials', {
        redirect: false,
        identifier: credentials.identifier,
        password: credentials.password,
      });

      if (!result?.error) {
        // Store redirect path for later use
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  /**
   * Register a new user
   * @param data Registration data
   * @returns Whether registration was successful
   */
  register: async (data: RegistrationData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  },

  /**
   * Logout the current user
   * @returns Whether logout was successful
   */
  logout: async (): Promise<boolean> => {
    try {
      // Try to call the backend logout endpoint
      try {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (backendError) {
        console.error('Backend logout failed:', backendError);
      }
      
      // Always perform NextAuth sign out
      await nextAuthSignOut({ callbackUrl: '/login' });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
};

export default authService;