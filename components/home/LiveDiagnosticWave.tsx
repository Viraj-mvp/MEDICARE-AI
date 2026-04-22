"use client";

import React from "react";
import { Activity } from "lucide-react";

export function LiveDiagnosticWave() {
    // Generate pseudo-random blips deterministically
    const blips = Array.from({ length: 8 }, (_, i) => ({
        top: 25 + Math.abs(Math.sin(i * 17)) * 50,
        left: 25 + Math.abs(Math.cos(i * 11)) * 50,
        delay: (i * 0.45) % 4
    }));

    return (
        <div className="w-full h-full min-h-[350px] flex flex-col justify-center relative p-8 bg-black/40 border border-white/10 rounded-2xl overflow-hidden group">
            {/* Global Keyframes entirely self-contained inside the component */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes sweep {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes blip {
                    0% { opacity: 0; transform: scale(0.5); border-color: rgba(56,189,248,1); }
                    10% { opacity: 1; transform: scale(1.5); border-color: rgba(56,189,248,0); }
                    100% { opacity: 0; transform: scale(1); border-color: rgba(56,189,248,0); }
                }
            `}} />

            {/* Ambient glow */}
            <div className="absolute inset-0 bg-blue-500/5 opacity-50 transition-opacity group-hover:opacity-100" />
            
            <div className="flex items-center gap-3 mb-6 z-20">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Intelligent Radar</h3>
                    <p className="text-zinc-500 text-xs">Scanning 900+ health providers</p>
                </div>
            </div>

            {/* Radar Viewport */}
            <div className="relative flex-1 flex items-center justify-center min-h-[200px] z-10 w-full overflow-hidden">
                <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.1)]">
                    
                    {/* Inner rings */}
                    <div className="absolute w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full border border-blue-500/20" />
                    <div className="absolute w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full border border-blue-500/40 bg-blue-500/5" />
                    <div className="absolute w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,1)]" />

                    {/* Crosshairs */}
                    <div className="absolute w-full h-[1px] bg-blue-500/30" />
                    <div className="absolute h-full w-[1px] bg-blue-500/30" />

                    {/* Sweeping Cone */}
                    <div 
                        className="absolute inset-0 rounded-full z-10 pointer-events-none"
                        style={{
                            animation: "sweep 4s linear infinite",
                            background: "conic-gradient(from 0deg, transparent 0deg, rgba(56,189,248,0.05) 260deg, rgba(56,189,248,0.4) 355deg, rgba(56,189,248,0.8) 360deg)"
                        }}
                    />

                    {/* Blips simulating hospitals/nodes */}
                    {blips.map((blip, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full border-2 z-20 pointer-events-none"
                            style={{
                                top: `${blip.top}%`,
                                left: `${blip.left}%`,
                                opacity: 0,
                                animation: `blip 4s cubic-bezier(0.1, 0.8, 0.3, 1) ${blip.delay}s infinite`,
                                backgroundColor: 'transparent'
                            }}
                        >
                            {/* Inner dot */}
                            <div className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full opacity-80" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
                <span className="text-xs text-sky-400 font-medium">Tracking Live</span>
            </div>
        </div>
    );
}
