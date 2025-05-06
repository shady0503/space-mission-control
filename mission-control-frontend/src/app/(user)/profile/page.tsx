// src/pages/profile.jsx
import React from 'react';
import Head from 'next/head';
import UserProfile from '@/components/profile/index';
import { Rocket, User, Bell, Menu, Search, LogOut } from 'lucide-react';

export default function ProfilePage() {
    return (
        <>
            <Head>
                <title>Profile | CosmicNav</title>
                <meta name="description" content="Your CosmicNav profile dashboard" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <div className="flex">


                {/* Main content */}
                <main className="flex-1 overflow-auto bg-gray-900">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <UserProfile />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}