'use client';

import React from 'react';

export function LoadingOrbit() {
    return (
        <div className="flex items-center justify-center">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-medical-blue/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-medical-blue animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-medical-cyan animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
                <div className="absolute inset-4 rounded-full bg-medical-purple/20 animate-pulse"></div>
            </div>
        </div>
    );
}
