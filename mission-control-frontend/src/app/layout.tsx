'use client';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthenticatedLayout from '@/components/common/AuthenticatedLayout';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

// Create client outside of component to prevent recreation on each render
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-200`}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider
            refetchInterval={5 * 60} // Check every 5 minutes instead of every minute
            refetchOnWindowFocus={false}
          >
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}