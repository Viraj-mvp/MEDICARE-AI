"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Globe, AlertOctagon } from "lucide-react";

// Dynamic import for the map to avoid SSR issues
const AdvancedMap = dynamic(
    () => import("@/components/ui/interactive-map").then((mod) => mod.AdvancedMap),
    { ssr: false, loading: () => <div className="h-[500px] w-full bg-muted/20 animate-pulse rounded-3xl" /> }
);

export function GlobalDiseaseMap() {
    const [outbreakStats, setOutbreakStats] = useState<any>(null);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        fetch('/api/admin/outbreak-stats', { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                clearTimeout(timeoutId);
                setOutbreakStats(data);
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.warn("Outbreak stats fetch timed out");
                } else {
                    console.error("Outbreak stats fetch failed", err);
                }
            })
            .finally(() => clearTimeout(timeoutId));
    }, []);

    // Sample disease data based on User's HTML
    // Converted to circle overlays
    const diseaseCircles = [
        // Covid - Red
        { center: [37.0902, -95.7129], radius: 500000, style: { color: '#ff4444', fillColor: '#ff4444', fillOpacity: 0.5, border: 'none' }, popup: 'USA: COVID-19 (1M cases)' },
        { center: [20.5937, 78.9629], radius: 400000, style: { color: '#ff4444', fillColor: '#ff4444', fillOpacity: 0.5 }, popup: 'India: COVID-19 (800k cases)' },
        { center: [-14.2350, -51.9253], radius: 300000, style: { color: '#ff4444', fillColor: '#ff4444', fillOpacity: 0.5 }, popup: 'Brazil: COVID-19 (600k cases)' },

        // Influenza - Orange
        { center: [35.8617, 104.1954], radius: 250000, style: { color: '#ffbb33', fillColor: '#ffbb33', fillOpacity: 0.5 }, popup: 'China: Influenza (50k cases)' },
        { center: [61.5240, 105.3188], radius: 200000, style: { color: '#ffbb33', fillColor: '#ffbb33', fillOpacity: 0.5 }, popup: 'Russia: Influenza (30k cases)' },

        // Dengue - Green
        { center: [15.8700, 100.9925], radius: 220000, style: { color: '#00C851', fillColor: '#00C851', fillOpacity: 0.5 }, popup: 'Thailand: Dengue (40k cases)' },
        { center: [-0.7893, 113.9213], radius: 210000, style: { color: '#00C851', fillColor: '#00C851', fillOpacity: 0.5 }, popup: 'Indonesia: Dengue (35k cases)' },

        // Malaria - Blue
        { center: [9.0820, 8.6753], radius: 180000, style: { color: '#33b5e5', fillColor: '#33b5e5', fillOpacity: 0.5 }, popup: 'Nigeria: Malaria (25k cases)' },
        { center: [-4.0383, 21.7587], radius: 150000, style: { color: '#33b5e5', fillColor: '#33b5e5', fillOpacity: 0.5 }, popup: 'DR Congo: Malaria (18k cases)' },
    ];

    return (
        <section className="py-20 bg-background relative z-10">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple flex items-center justify-center gap-3">
                        <Globe className="w-8 h-8 text-medical-blue" /> Global Disease Tracker
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Interactive map showing current disease outbreaks worldwide
                    </p>
                </div>

                {/* Outbreak Stats Widget */}
                {outbreakStats && outbreakStats.india && (
                    <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                        <div>
                            <h3 className="font-bold text-lg text-red-400 mb-1 flex items-center gap-2">
                                <AlertOctagon className="w-5 h-5"/> Live India Outbreak Stats
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Powered by disease.sh</p>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs text-red-500/70 uppercase font-bold tracking-wider">Active Cases</p>
                                    <p className="text-2xl font-bold text-white">{outbreakStats.india.active?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-green-500/70 uppercase font-bold tracking-wider">Recovered</p>
                                    <p className="text-2xl font-bold text-white">{outbreakStats.india.recovered?.toLocaleString() || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:border-l md:border-t-0 border-t border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                            <h4 className="font-bold text-gray-300 mb-2">Global Overview</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Cases:</span>
                                <span className="font-mono text-white">{outbreakStats.global?.cases?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-400">Total Deaths:</span>
                                <span className="font-mono text-white">{outbreakStats.global?.deaths?.toLocaleString() || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 h-[500px] relative">
                    <AdvancedMap
                        center={[20, 0]}
                        zoom={2}
                        circles={diseaseCircles}
                        enableSearch={false}
                        style={{ height: "100%", width: "100%" }}
                        mapLayers={{ openstreetmap: true, satellite: false, traffic: false }}
                    />

                    {/* Legend Overlay */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg z-[1000] text-xs text-zinc-900">
                        <h4 className="font-bold mb-2 text-zinc-900">Outbreaks</h4>
                        <div className="space-y-2 font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ff4444]"></span> COVID-19
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ffbb33]"></span> Influenza
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#00C851]"></span> Dengue
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#33b5e5]"></span> Malaria
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
