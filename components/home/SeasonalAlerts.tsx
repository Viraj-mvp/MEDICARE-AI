"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/effects/GlassCard";
import { Calendar, AlertTriangle, CloudRain, Sun, Leaf, Snowflake } from "lucide-react";
import { Select, SelectItem, SelectListBox, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select-1";
import { Label } from "react-aria-components";

export function SeasonalAlerts() {
    const [month, setMonth] = useState<string>("0");

    useEffect(() => {
        setMonth(new Date().getMonth().toString());
    }, []);

    const monthlyDiseases: Record<string, any[]> = {
        // ... (data remains the same, omitted for brevity as replace_file_content applies to target range)
        "0": [
            { name: "Influenza (Flu)", risk: "high", symptoms: "Fever, cough, body aches", prevention: ["Get flu vaccination", "Wash hands frequent", "Avoid close contact"] },
            { name: "Common Cold", risk: "high", symptoms: "Runny nose, sore throat", prevention: ["Maintain hygiene", "Stay hydrated", "Wear warm clothing"] }
        ],
        "1": [
            { name: "Seasonal Flu", risk: "high", symptoms: "Fever, chills, muscle aches", prevention: ["Regular hand washing", "Use face masks", "Boost immunity"] }
        ],
        "2": [
            { name: "Allergies", risk: "medium", symptoms: "Sneezing, itchy eyes", prevention: ["Monitor pollen", "Keep windows closed", "Use air purifiers"] }
        ],
        "3": [
            { name: "Spring Allergies", risk: "high", symptoms: "Watery eyes, sneezing", prevention: ["Use air filters", "Shower after outdoors", "Consider antihistamines"] }
        ],
        "4": [
            { name: "Food Poisoning", risk: "medium", symptoms: "Nausea, vomiting", prevention: ["Practice food safety", "Wash produce", "Store food properly"] }
        ],
        "5": [
            { name: "Heat-related Illness", risk: "high", symptoms: "Fatigue, dehydration", prevention: ["Stay hydrated", "Avoid peak sun", "Use sunscreen"] }
        ],
        "6": [
            { name: "Dehydration", risk: "high", symptoms: "Thirst, dark urine", prevention: ["Drink water", "Avoid alcohol", "Stay cool"] }
        ],
        "7": [
            { name: "Mosquito-borne Diseases", risk: "high", symptoms: "Fever, joint pain", prevention: ["Use repellent", "Remove standing water", "Wear long sleeves"] }
        ],
        "8": [
            { name: "Viral Infections", risk: "medium", symptoms: "Fever, cough", prevention: ["Maintain hygiene", "Boost immunity", "Get sleep"] }
        ],
        "9": [
            { name: "Seasonal Flu", risk: "high", symptoms: "Fever, body aches", prevention: ["Get flu shot", "Practice hygiene", "Social distance"] }
        ],
        "10": [
            { name: "Respiratory Infections", risk: "high", symptoms: "Cough, congestion", prevention: ["Wear warm clothing", "Stay hydrated", "Get rest"] }
        ],
        "11": [
            { name: "Winter Flu", risk: "high", symptoms: "High fever, aches", prevention: ["Get vaccinated", "Stay warm", "Boost immunity"] }
        ]
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentDiseases = monthlyDiseases[month] || [];
    const currentMonthName = months[parseInt(month)];

    // helper for seasonal icon
    const getSeasonIcon = (m: number) => {
        if (m >= 2 && m <= 4) return <Leaf className="w-6 h-6 text-green-500" />;
        if (m >= 5 && m <= 7) return <Sun className="w-6 h-6 text-yellow-500" />;
        if (m >= 8 && m <= 10) return <CloudRain className="w-6 h-6 text-orange-500" />;
        return <Snowflake className="w-6 h-6 text-blue-500" />;
    };

    // Prepare options for Carousel3DSelect
    const carouselOptions = months.map((m, i) => ({
        value: i.toString(),
        label: m,
        // Assign colors based on season for visual flair
        color: (i >= 2 && i <= 4) ? "#dcfce7" : // Spring (Green-ish)
            (i >= 5 && i <= 7) ? "#fef9c3" : // Summer (Yellow-ish)
                (i >= 8 && i <= 10) ? "#ffedd5" : // Autumn (Orange-ish)
                    "#dbeafe" // Winter (Blue-ish)
    }));

    return (
        <section className="py-20 bg-background/50 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                {/* Next.js Image component needs to be imported if not already */}
                {/* Since I can't easily see if Image is imported in this file view context for the top of the file, I'll use a standard img tag or assume Image is available. 
                    Wait, SeasonalAlerts.tsx imports: React, GlassCard, lucide icons, Select... It DOES NOT import Image.
                    I must add the import first or use img. I'll use the multi_replace tool to be safe and add the import.
                 */}
                <img
                    src="/photo/SA.webp"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
            </div>
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple">
                        Seasonal Health Alerts
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Stay informed about common health risks this month
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <GlassCard className="p-6 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-medical-blue" /> Select Month
                            </h3>

                            <Select selectedKey={month} onSelectionChange={(key) => setMonth(key as string)} className="w-[200px]" placeholder="Select Month">
                                <Label className="sr-only">Select Month</Label>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectPopover>
                                    <SelectListBox>
                                        {months.map((m, i) => (
                                            <SelectItem key={i} id={i.toString()}>{m}</SelectItem>
                                        ))}
                                    </SelectListBox>
                                </SelectPopover>
                            </Select>

                            <div className="mt-6 flex flex-col items-center justify-center p-6 bg-medical-blue/5 rounded-xl border border-medical-blue/10 w-full animate-in fade-in zoom-in duration-500" key={month}>
                                {getSeasonIcon(parseInt(month))}
                                <span className="mt-2 font-medium text-medical-blue">{currentMonthName}</span>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentDiseases.map((disease, idx) => (
                            <GlassCard key={idx} className="p-6 border-l-4 border-l-medical-blue">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold">{disease.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${disease.risk === 'high' ? 'bg-red-500/10 text-red-500' :
                                        disease.risk === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-green-500/10 text-green-500'
                                        }`}>
                                        {disease.risk} Risk
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Symptoms:</p>
                                        <p className="text-sm">{disease.symptoms}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground mb-1">Prevention:</p>
                                        <ul className="space-y-1">
                                            {disease.prevention.map((tip: string, i: number) => (
                                                <li key={i} className="text-sm flex items-start gap-2">
                                                    <span className="text-medical-blue mt-1">•</span> {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
