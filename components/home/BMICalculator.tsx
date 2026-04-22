"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/effects/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Activity } from "lucide-react";

export function BMICalculator() {
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState<string | null>(null);
    const [status, setStatus] = useState<{ label: string; color: string; tips: string[] } | null>(null);

    const calculateBMI = () => {
        const h = parseFloat(height); // feet
        const w = parseFloat(weight); // kg

        if (h > 0 && w > 0) {
            const heightInMeters = h * 0.3048;
            const bmiValue = (w / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(bmiValue);

            const val = parseFloat(bmiValue);
            if (val < 18.5) {
                setStatus({
                    label: "Underweight",
                    color: "text-yellow-500",
                    tips: ["Eat more frequently", "Include protein-rich foods", "Add healthy fats", "Strength training"]
                });
            } else if (val < 25) {
                setStatus({
                    label: "Normal weight",
                    color: "text-green-500",
                    tips: ["Maintain balanced diet", "Stay physically active", "Get adequate sleep", "Manage stress"]
                });
            } else if (val < 30) {
                setStatus({
                    label: "Overweight",
                    color: "text-orange-500",
                    tips: ["Monitor portion sizes", "Increase activity", "Choose whole foods", "Stay hydrated"]
                });
            } else {
                setStatus({
                    label: "Obese",
                    color: "text-red-500",
                    tips: ["Consult healthcare provider", "Gentle exercise", "Nutrient-rich foods", "Keep food diary"]
                });
            }
        }
    };

    return (
        <section className="py-20 bg-medical-blue/5 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/photo/QHC.webp"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
            </div>
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple">
                        Quick Health Check
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Calculate your BMI and get personalized health tips
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard className="p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-medical-blue" /> BMI Calculator
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Height (feet)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 5.9"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Weight (kg)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 70"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </div>
                            <Button onClick={calculateBMI} className="w-full bg-medical-blue hover:bg-medical-blue/90">
                                Calculate Result
                            </Button>

                            {bmi && status && (
                                <div className="mt-6 p-4 bg-background/50 rounded-xl border border-white/10 text-center animate-in fade-in slide-in-from-bottom-4">
                                    <p className="text-sm text-muted-foreground">Your BMI</p>
                                    <p className="text-4xl font-bold mb-2">{bmi}</p>
                                    <p className={`font-semibold ${status.color}`}>{status.label}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 relative overflow-hidden">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-medical-purple" /> Health Insights
                        </h3>

                        {status ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <p className="text-muted-foreground mb-4">
                                    Based on your BMI of <span className="font-bold text-foreground">{bmi}</span>, here are some recommendations:
                                </p>
                                <ul className="space-y-3">
                                    {status.tips.map((tip, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-medical-purple" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-50 py-12">
                                <Activity className="w-16 h-16 mb-4" />
                                <p>Enter your details to generate<br />personalized health tips</p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </section>
    );
}
