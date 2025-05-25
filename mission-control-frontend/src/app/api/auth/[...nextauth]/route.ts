// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
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

const config = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        console.log('=== NEXTAUTH AUTHORIZE START ===');
        console.log('Environment check:', {
          NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          NODE_ENV: process.env.NODE_ENV,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL
        });
        console.log('Credentials received:', {
          identifier: credentials?.identifier,
          passwordProvided: !!credentials?.password,
          tokenProvided: !!credentials?.token
        });

        // Special case for OAuth token handling
        if (credentials?.identifier === 'oauth_token' && credentials?.token) {
          console.log('OAuth token flow detected');
          return {
            id: 'oauth-user',
            email: 'oauth-user',
            token: credentials.token as string,
          };
        }
        
        // Regular credentials login
        if (!credentials?.identifier || !credentials?.password) {
          console.error('Missing credentials - identifier:', !!credentials?.identifier, 'password:', !!credentials?.password);
          return null;
        }

        // Check if backend URL is configured
        if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
          console.error('NEXT_PUBLIC_BACKEND_URL environment variable is not set');
          return null;
        }

        try {
          const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNIN}`;
          console.log('Making request to:', backendUrl);
          
          const requestBody = {
            identifier: credentials.identifier,
            password: credentials.password,
          };
          console.log('Request body:', JSON.stringify(requestBody, null, 2));
          
          const res = await fetch(backendUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
          });
          
          console.log('Backend response status:', res.status);
          console.log('Backend response headers:', Object.fromEntries(res.headers.entries()));
          
          if (!res.ok) {
            const errorText = await res.text();
            console.error('Backend auth failed:', {
              status: res.status,
              statusText: res.statusText,
              errorText: errorText
            });
            return null;
          }
          
          const responseData = await res.json();
          console.log('Backend response data:', JSON.stringify(responseData, null, 2));
          
          // Check if we have a token in the response
          if (!responseData.token) {
            console.error('No token in response. Response keys:', Object.keys(responseData));
            return null;
          }
          
          // Decode the JWT token to extract user information
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let userInfo: Record<string, any> = {};
          try {
            const tokenParts = responseData.token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Decoded JWT payload:', JSON.stringify(payload, null, 2));
              userInfo = payload;
            } else {
              console.warn('Token does not appear to be a valid JWT (wrong number of parts)');
            }
          } catch (decodeError) {
            console.error('Error decoding JWT:', decodeError);
          }
          
          // Construct the user object for NextAuth
          const user = {
            id: userInfo.sub || userInfo.id || responseData.id || 'unknown',
            email: userInfo.email || responseData.email || credentials.identifier,
            username: userInfo.username || responseData.username || credentials.identifier,
            enterpriseId: userInfo.enterpriseId || responseData.enterpriseId,
            token: responseData.token,
            sub: userInfo.sub || userInfo.id || responseData.id || 'unknown',
            iat: userInfo.iat,
            exp: userInfo.exp,
          };
          
          console.log('Final user object for NextAuth:', JSON.stringify(user, null, 2));
          return user;
          
        } catch (error) {
          console.error('Auth request error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error: error
          });
          return null;
        }
      }
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      console.log('=== JWT CALLBACK ===');
      
      // When user signs in, copy user data to token
      if (user) {
        console.log('User data in JWT callback:', JSON.stringify(user, null, 2));
        
        // Store the access token
        token.accessToken = user.token;
        
        // Store user information
        token.sub = user.sub || user.id;
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.enterpriseId = user.enterpriseId;
        token.iat = user.iat;
        token.exp = user.exp;
      }
      
      console.log('Final JWT token:', JSON.stringify(token, null, 2));
      return token;
    },
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: Session, token: any }) {
      console.log('=== SESSION CALLBACK ===');
      console.log('Token in session callback:', JSON.stringify(token, null, 2));
      
      // Copy token to session.accessToken
      session.accessToken = token.accessToken as string;
      
      // Ensure user object exists
      if (!session.user) {
        session.user = {};
      }
      
      // Copy user fields from token to session.user
      session.user.sub = token.sub;
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.email = token.email;
      session.user.enterpriseId = token.enterpriseId;
      session.user.iat = token.iat;
      session.user.exp = token.exp;
      
      console.log('Final session:', JSON.stringify(session, null, 2));
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
export const { GET, POST } = handlers