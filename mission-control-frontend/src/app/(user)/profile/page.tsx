"use client";

import React from 'react';
import Head from 'next/head';
import UserProfile from '@/components/profile/index';
import { motion } from 'framer-motion';

// Animation variants
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProfilePage() {
    return (
        <>
            <Head>
                <title>Profile | CosmicNav</title>
                <meta name="description" content="Your CosmicNav profile dashboard" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="relative min-h-screen">
                {/* Background with stars */}
                <div className="absolute inset-0 overflow-hidden z-0">
                    <div className="stars-sm"></div>
                    <div className="stars-md"></div>
                    <div className="stars-lg"></div>
                </div>
                
                {/* Decorative gradient orbs */}
                <motion.div 
                    className="absolute top-[10%] right-[8%] w-32 h-32 rounded-full bg-gradient-to-br from-blue-800 to-indigo-900 opacity-20 blur-md z-0"
                    animate={{
                        y: [0, -12, 0],
                        rotate: [0, 5, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                />
                
                <motion.div 
                    className="absolute bottom-[20%] left-[5%] w-24 h-24 rounded-full bg-gradient-to-br from-indigo-800 to-purple-900 opacity-20 blur-md z-0"
                    animate={{
                        y: [0, 10, 0],
                        rotate: [0, -8, 0],
                        scale: [1, 1.03, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                />

                {/* Main content */}
                <motion.main 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="relative z-10 flex-1 overflow-auto"
                >
                    <div className="py-10">
                        <motion.div variants={item} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-300 to-indigo-300">
                                    Your Profile
                                </h1>
                                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-1"></div>
                            </div>
                            <motion.div 
                                variants={item}
                                className="relative bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-indigo-900/10 pointer-events-none"></div>
                                <UserProfile />
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.main>
            </div>
        </>
    );
}