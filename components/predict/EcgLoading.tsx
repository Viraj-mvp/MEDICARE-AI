"use client";

import React, { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
    "Reading symptoms",
    "Analyzing biomarker patterns",
    "Cross-referencing medical database",
    "Matching patterns",
    "Running diagnostic models"
];

export const EcgLoading = () => {
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        }, 2500); // Change text every 2.5 seconds
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-80 h-40 flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                {/* Background medical grid */}
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}
                />
                {/* Scanning line effect */}
                <div className="absolute top-0 bottom-0 w-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[scan_2s_linear_infinite]" 
                     style={{
                         animationName: 'scan',
                         animationDuration: '2s',
                         animationTimingFunction: 'linear',
                         animationIterationCount: 'infinite'
                     }} 
                />
                
                <svg viewBox="0 0 500 150" className="w-full h-full drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] relative z-10">
                    <style>
                        {`
                            @keyframes ecg {
                                0% { stroke-dashoffset: 1000; }
                                100% { stroke-dashoffset: 0; }
                            }
                            @keyframes scan {
                                0% { left: 0%; opacity: 0; }
                                10% { opacity: 1; }
                                90% { opacity: 1; }
                                100% { left: 100%; opacity: 0; }
                            }
                            .ecg-line {
                                stroke-dasharray: 1000;
                                animation: ecg 2s linear infinite;
                                stroke: #ef4444;
                                stroke-width: 4;
                                fill: none;
                            }
                        `}
                    </style>
                    <path
                        className="ecg-line"
                        d="M 0 75 L 100 75 L 120 20 L 150 130 L 180 75 L 250 75 L 270 50 L 290 90 L 310 75 L 500 75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
                <p className="text-2xl font-bold text-white flex items-center transition-all duration-500">
                    {STATUS_MESSAGES[statusIndex]}
                    <span className="inline-flex ml-1 w-8">
                        <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.32s]">.</span>
                        <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.16s]">.</span>
                        <span className="animate-[bounce_1.4s_infinite]">.</span>
                    </span>
                </p>
                <p className="text-sm font-medium text-red-400/80 animate-pulse tracking-widest uppercase">
                    AI Health Assessment System
                </p>
            </div>
        </div>
    );
};
