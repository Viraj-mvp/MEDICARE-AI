"use client";

import React, { useEffect, useState } from "react";
import { Users, Building2, Stethoscope } from "lucide-react";
import { GlassCard } from "@/components/effects/GlassCard";

export function MissionStats() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [hospitalCount, setHospitalCount] = useState<number | null>(null);
    const [predictionCount, setPredictionCount] = useState<number | null>(null);

    useEffect(() => {
        // Fetch registered user count
        fetch('/api/stats/users')
            .then(r => r.json())
            .then(d => setUserCount(d.count))
            .catch(() => setUserCount(null));

        // Fetch hospital count
        fetch('/api/hospitals?limit=1&countOnly=true')
            .then(r => r.json())
            .then(d => {
                if (typeof d.total === 'number') setHospitalCount(d.total);
            })
            .catch(() => setHospitalCount(null));

        // Fetch predictions count  
        fetch('/api/stats/predictions')
            .then(r => r.json())
            .then(d => setPredictionCount(d.count))
            .catch(() => setPredictionCount(null));
    }, []);

    const fmt = (n: number | null, fallback: string) =>
        n === null ? fallback : n > 999 ? `${(n / 1000).toFixed(1)}k+` : `${n}+`;

    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/photo/OM.webp"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
            </div>
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple">
                            Our Mission
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            At MediCare, we're dedicated to making healthcare information more
                            accessible and understandable for everyone. Our platform combines
                            advanced technology with medical knowledge to help users make
                            informed decisions about their health.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassCard className="text-center p-6 space-y-4 hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-foreground">
                                    {fmt(userCount, '50+')}
                                </h3>
                                <p className="text-sm text-muted-foreground">Registered Users</p>
                            </div>
                        </GlassCard>

                        <GlassCard className="text-center p-6 space-y-4 hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-500">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-foreground">
                                    {fmt(hospitalCount, '900+')}
                                </h3>
                                <p className="text-sm text-muted-foreground">Partner Hospitals</p>
                            </div>
                        </GlassCard>

                        <GlassCard className="text-center p-6 space-y-4 hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto text-teal-500">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-foreground">
                                    {fmt(predictionCount, '100+')}
                                </h3>
                                <p className="text-sm text-muted-foreground">Disease Predictions</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </section>
    );
}
