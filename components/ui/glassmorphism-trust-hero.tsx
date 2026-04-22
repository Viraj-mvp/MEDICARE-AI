"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    Target,
    Crown,
    Star,
    Activity,
    Heart,
    Brain,
    Stethoscope,
    Database,
    Lock
} from "lucide-react";

// --- MOCK BRANDS / FEATURES ---
const FEATURES = [
    { name: "AI Analysis", icon: Brain },
    { name: "Secure Data", icon: Lock },
    { name: "Expert Check", icon: Stethoscope },
    { name: "Global DB", icon: Database },
    { name: "24/7 Access", icon: Activity },
    { name: "Health Tracking", icon: Heart },
];

// --- SUB-COMPONENTS ---
const StatItem = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
        <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">{label}</span>
    </div>
);

// --- LIVE MINI STATS ---
function LiveMiniStats() {
    const [userCount, setUserCount] = useState<string>('...');

    useEffect(() => {
        fetch('/api/stats/users')
            .then(r => r.json())
            .then(d => {
                const n: number = d.count ?? 0;
                setUserCount(n > 999 ? `${(n / 1000).toFixed(1)}k+` : `${n}+`);
            })
            .catch(() => setUserCount('New'));
    }, []);

    return (
        <div className="grid grid-cols-3 gap-4 text-center">
            <StatItem value="24/7" label="Active" />
            <div className="w-px h-full bg-white/10 mx-auto" />
            <StatItem value="50+" label="Diseases" />
            <div className="w-px h-full bg-white/10 mx-auto" />
            <StatItem value={userCount} label="Users" />
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function HeroSection() {
    return (
        <div className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden font-sans">
            {/* 
        SCOPED ANIMATIONS 
      */}
            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

            {/* Background with darker medical theme and Image */}
            <div className="absolute inset-0 z-0 bg-background">
                <div
                    className="absolute inset-0 bg-[url('/photo/bg.webp')] bg-cover bg-center opacity-40"
                    style={{
                        maskImage: "linear-gradient(180deg, transparent, black 0%, black 70%, transparent)",
                        WebkitMaskImage: "linear-gradient(180deg, transparent, black 0%, black 70%, transparent)",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/10 via-background to-medical-purple/10 opacity-50 mix-blend-overlay" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">

                    {/* --- LEFT COLUMN --- */}
                    <div className="lg:col-span-7 flex flex-col justify-center space-y-8">

                        {/* Badge */}


                        {/* Heading */}
                        <h1
                            className="animate-fade-in delay-200 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.9]"
                        >
                            Advanced<br />
                            <span className="bg-gradient-to-br from-medical-blue via-medical-cyan to-medical-purple bg-clip-text text-transparent">
                                Prediction
                            </span><br />
                            For Your Health
                        </h1>

                        {/* Description */}
                        <p className="animate-fade-in delay-300 max-w-xl text-lg text-zinc-400 leading-relaxed">
                            Empower your well-being with AI-driven insights.
                            Get accurate disease predictions, locate top hospitals, and prevent future risks.
                        </p>

                        {/* CTA Buttons */}
                        <div className="animate-fade-in delay-400 flex flex-col sm:flex-row gap-4">
                            <Link href="/predict" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]">
                                Start Prediction
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link href="/prevention" className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20">
                                <ShieldCheck className="w-4 h-4" />
                                Prevention Guide
                            </Link>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="lg:col-span-5 space-y-6 lg:mt-0">

                        {/* Stats Card */}
                        <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
                            {/* Card Glow Effect */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-medical-blue/20 blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-blue/20 ring-1 ring-white/20">
                                        <Target className="h-6 w-6 text-medical-blue" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold tracking-tight text-white">98.5%</div>
                                        <div className="text-sm text-zinc-400">Accuracy Rate</div>
                                    </div>
                                </div>

                                {/* Progress Bar Section */}
                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">System Confidence</span>
                                        <span className="text-white font-medium">High</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                                        <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-medical-blue to-medical-purple" />
                                    </div>
                                </div>

                                <div className="h-px w-full bg-white/10 mb-6" />

                                {/* Mini Stats Grid — live data */}
                                <LiveMiniStats />

                                {/* Tag Pills */}
                                <div className="mt-8 flex flex-wrap gap-2">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        LIVE SYSTEM
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Marquee Card */}
                        <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">


                            <div
                                className="relative flex overflow-hidden"
                                style={{
                                    maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                                    WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
                                }}
                            >
                                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                                    {/* Triple list for seamless loop */}
                                    {[...FEATURES, ...FEATURES, ...FEATURES].map((feature, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default"
                                        >
                                            {/* Brand Icon */}
                                            <feature.icon className="h-6 w-6 text-medical-blue fill-current/10" />
                                            {/* Brand Name */}
                                            <span className="text-lg font-bold text-white tracking-tight">
                                                {feature.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
