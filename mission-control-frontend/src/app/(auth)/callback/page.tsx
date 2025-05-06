'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(true);
    
    useEffect(() => {
        const processCallback = async () => {
            const token = searchParams.get('token');
            
            if (token) {
                try {
                    // Store the token in localStorage as a backup
                    localStorage.setItem('auth_token', token);
                    
                    // Create a NextAuth session for this token 
                    // This ensures your authentication state is consistent across the app
                    const result = await signIn('credentials', {
                        redirect: false,
                        // Pass a special flag to indicate this is an OAuth token
                        identifier: 'oauth_token',
                        password: token,
                        token: token, // Pass the token directly as well
                    });
                    
                    if (result?.error) {
                        console.error('Failed to create session:', result.error);
                        setError('Authentication failed. Please try again.');
                        setIsProcessing(false);
                    } else {
                        // Successfully created session, now redirect
                        // Check if we have a redirect path
                        let redirectPath = '/telemetry';
                        if (typeof window !== 'undefined') {
                            const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
                            if (storedRedirect) {
                                redirectPath = storedRedirect;
                                sessionStorage.removeItem('redirectAfterLogin');
                            }
                        }
                        router.push(redirectPath);
                    }
                } catch (err) {
                    console.error('Auth callback error:', err);
                    setError('Authentication failed. Please try again.');
                    setIsProcessing(false);
                }
            } else {
                // If no token is received, redirect to login page
                setError('No authentication token received.');
                setIsProcessing(false);
                setTimeout(() => router.push('/login'), 2000);
            }
        };
        
        processCallback();
    }, [router, searchParams]);
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="p-8 rounded-lg backdrop-blur-xl bg-opacity-20 bg-gray-900 border border-gray-700 shadow-2xl">
                {isProcessing ? (
                    <>
                        <h1 className="text-2xl text-white mb-4">Authenticating...</h1>
                        <div className="w-16 h-1 bg-purple-500 mx-auto rounded-full animate-pulse"></div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl text-white mb-4">{error ? 'Authentication Error' : 'Redirecting...'}</h1>
                        {error && <p className="text-red-400 mt-2">{error}</p>}
                    </>
                )}
            </div>
        </div>
    );
}