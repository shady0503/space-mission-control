// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import type { Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { API_CONFIG } from '@/lib/api/config'

// Extend the Session and User types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      sub?: string;
      id?: string;
      username?: string;
      email?: string;
      enterpriseId?: string;
      iat?: number;
      exp?: number;
    };
  }
  
  interface User {
    token?: string;
    sub?: string;
    id?: string;
    username?: string;
    email?: string;
    enterpriseId?: string;
    iat?: number;
    exp?: number;
  }
}

export const config = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
      },
// In route.ts - add detailed logging in the authorize function

// In route.ts - modify the authorize function to add more detailed logging
async authorize(credentials) {
  // Special case for OAuth token handling
  if (credentials?.identifier === 'oauth_token' && credentials?.token) {
    return {
      id: 'oauth-user',
      email: 'oauth-user',
      token: credentials.token,
    };
  }
  
  // Regular credentials login
  try {
    console.log('Attempting to authenticate with:', {
      identifier: credentials?.identifier,
      passwordProvided: !!credentials?.password
    });
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: credentials?.identifier,
        password: credentials?.password,
      }),
    });
    
    // Log raw response status
    console.log('Auth response status:', res.status);
    
    if (!res.ok) {
      console.error('Auth failed with status:', res.status);
      return null;
    }
    
    // Get the raw response data
    const userData = await res.json();
    
    // Log the complete structure - formatted for readability
    console.log('RAW AUTH RESPONSE DATA:');
    console.log(JSON.stringify(userData, null, 2));
    
    // Log direct properties at the top level for quick inspection
    console.log('TOP LEVEL KEYS:', Object.keys(userData));
    
    // Check if user data is nested in a user property
    if (userData.user) {
      console.log('USER OBJECT KEYS:', Object.keys(userData.user));
      console.log('USER DATA:', JSON.stringify(userData.user, null, 2));
    }
    
    // Check if claims data exists
    if (userData.claims) {
      console.log('CLAIMS OBJECT KEYS:', Object.keys(userData.claims));
      console.log('CLAIMS DATA:', JSON.stringify(userData.claims, null, 2));
    }
    
    if (userData.token) {
      console.log('TOKEN EXISTS:', !!userData.token);
      console.log('TOKEN PREVIEW:', userData.token.substring(0, 20) + '...');
      
      // Try to decode the token to see what's inside
      try {
        // Split the token to get the payload part
        const parts = userData.token.split('.');
        if (parts.length === 3) {
          // Decode the payload part (the middle part of the JWT)
          const payload = JSON.parse(atob(parts[1]));
          console.log('DECODED TOKEN PAYLOAD:');
          console.log(JSON.stringify(payload, null, 2));
          
          // Log token expiration details if available
          if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            console.log('TOKEN EXPIRES:', expDate.toLocaleString());
            console.log('EXPIRES IN:', Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60), 'minutes');
          }
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
      
      // Construct the return object with all possible data sources
      const returnData = {
        token: userData.token,
        ...(userData.user || {}),    // If user data is in a nested 'user' object
        ...(userData.claims || {}),  // If claims are in a nested 'claims' object
        ...userData                  // If user data is at the top level
      };
      
      // Log the final constructed user object
      console.log('FINAL CONSTRUCTED USER DATA:');
      console.log(JSON.stringify(returnData, null, 2));
      
      return returnData;
    }
  } catch (error) {
    console.error('Auth error:', error);
  }
  return null;
}
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, copy all user data to token
      if (user) {
        console.log('Raw user data in JWT callback:', JSON.stringify(user, null, 2));
        
        // Preserve the JWT token
        token.accessToken = user.token;
        
        // Extract user data from the token payload
        try {
          if (user.token) {
            const parts = user.token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              console.log('Decoded payload in JWT callback:', JSON.stringify(payload, null, 2));
              
              // Use the decoded JWT payload data instead of the top-level user object
              token.sub = payload.sub;
              token.id = payload.id;
              token.username = payload.username;
              token.email = payload.email;
              token.enterpriseId = payload.enterpriseId;
              token.iat = payload.iat;
              token.exp = payload.exp;
            }
          }
        } catch (error) {
          console.error('Error decoding token in JWT callback:', error);
          
          // Fallback: use the user object directly if token decoding fails
          token.sub = user.sub;
          token.id = user.id;
          token.username = user.username;
          token.email = user.email;
          token.enterpriseId = user.enterpriseId;
          token.iat = user.iat;
          token.exp = user.exp;
        }
      }
      
      console.log('Final token in JWT callback:', JSON.stringify(token, null, 2));
      return token;
    },
    
    async session({ session, token }: { session: Session, token: any }) {
      console.log('Token data in session callback:', JSON.stringify(token, null, 2));
      
      // Copy token to session.accessToken
      session.accessToken = token.accessToken as string;
      
      // Ensure user object exists
      if (!session.user) {
        session.user = {};
      }
      
      // Copy all user fields from token to session.user
      session.user.sub = token.sub;
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.email = token.email;
      session.user.enterpriseId = token.enterpriseId;
      session.user.iat = token.iat;
      session.user.exp = token.exp;
      
      console.log('Final session in callback:', JSON.stringify(session, null, 2));
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
export const { GET, POST } = handlers