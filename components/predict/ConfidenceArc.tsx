"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const ConfidenceArc = ({ confidence }: { confidence: number }) => {
    // Determine color based on confidence thresholds
    let color = 'text-green-500';
    let gradient = 'from-green-500 to-emerald-400';
    
    if (confidence < 50) {
        color = 'text-red-500';
        gradient = 'from-red-500 to-rose-400';
    } else if (confidence <= 75) {
        color = 'text-amber-500';
        gradient = 'from-amber-500 to-orange-400';
    }

    // Arc math: 180 degrees sweep
    const radius = 60;
    const circumference = Math.PI * radius; // length of half circle
    const strokeDashoffset = circumference - (confidence / 100) * circumference;

    return (
        <div className="relative w-48 h-28 flex flex-col items-center justify-end">
            <svg className="absolute top-0 left-0 w-full h-full overflow-visible" viewBox="0 0 160 100">
                {/* Background Track */}
                <path
                    d="M 20 80 A 60 60 0 0 1 140 80"
                    fill="none"
                    className="stroke-gray-800"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                
                {/* Animated Foreground Arc */}
                <motion.path
                    d="M 20 80 A 60 60 0 0 1 140 80"
                    fill="none"
                    className={`stroke-current ${color}`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, type: 'spring', bounce: 0.2, delay: 0.3 }}
                />
            </svg>
            
            {/* Center Text */}
            <div className="text-center z-10 -mb-2">
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}
                >
                    {confidence}%
                </motion.div>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold"
                >
                    Reliability
                </motion.p>
            </div>
        </div>
    );
};
