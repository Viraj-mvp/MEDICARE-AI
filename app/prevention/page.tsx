'use client';

import React, { useRef } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Heart, Activity, Moon, ShieldAlert, CheckCircle2,
    Thermometer, Pill, Utensils, Apple, Hand, Brain, Bone, Zap
} from 'lucide-react';
import Image from 'next/image';

export default function PreventionPage() {
    const diseases = [
        {
            title: "Common Cold",
            icon: <Thermometer className="w-8 h-8 text-blue-400" />,
            tips: [
                "Wash hands frequently with soap and water",
                "Avoid touching face with unwashed hands",
                "Stay away from people who are sick",
                "Get adequate sleep and rest",
                "Maintain good nutrition and hydration"
            ]
        },
        {
            title: "Influenza (Flu)",
            icon: <Activity className="w-8 h-8 text-red-500" />,
            tips: [
                "Get annual flu vaccination",
                "Practice good respiratory hygiene",
                "Avoid close contact with sick people",
                "Stay home when you're sick",
                "Clean and disinfect frequently touched surfaces"
            ]
        },
        {
            title: "Heart Disease",
            icon: <Heart className="w-8 h-8 text-rose-600" />,
            tips: [
                "Maintain a healthy diet low in saturated fats",
                "Exercise regularly (30 minutes daily)",
                "Control blood pressure and cholesterol",
                "Quit smoking and limit alcohol",
                "Manage stress through relaxation techniques"
            ]
        },
        {
            title: "Diabetes",
            icon: <Utensils className="w-8 h-8 text-orange-500" />,
            tips: [
                "Maintain a healthy weight",
                "Follow a balanced diet",
                "Regular physical activity",
                "Monitor blood sugar levels",
                "Avoid excessive sugar intake"
            ]
        },
        {
            title: "Hypertension",
            icon: <Heart className="w-8 h-8 text-red-600 animate-pulse" />,
            tips: [
                "Reduce salt intake",
                "Regular exercise",
                "Maintain healthy weight",
                "Limit alcohol consumption",
                "Practice stress management"
            ]
        },
        {
            title: "COVID-19",
            icon: <ShieldAlert className="w-8 h-8 text-purple-500" />,
            tips: [
                "Get vaccinated and boosted",
                "Wear masks in crowded places",
                "Maintain social distancing",
                "Practice good hand hygiene",
                "Ensure proper ventilation"
            ]
        },
        {
            title: "Asthma",
            icon: <Zap className="w-8 h-8 text-yellow-400" />,
            tips: [
                "Identify and avoid triggers",
                "Keep indoor air clean",
                "Use air purifiers",
                "Regular exercise",
                "Follow medication schedule"
            ]
        },
        {
            title: "Osteoporosis",
            icon: <Bone className="w-8 h-8 text-slate-300" />,
            tips: [
                "Adequate calcium intake",
                "Vitamin D supplementation",
                "Weight-bearing exercises",
                "Avoid smoking",
                "Limit alcohol consumption"
            ]
        },
        {
            title: "Depression",
            icon: <Brain className="w-8 h-8 text-indigo-400" />,
            tips: [
                "Regular exercise",
                "Maintain social connections",
                "Practice stress management",
                "Get adequate sleep",
                "Seek professional help when needed"
            ]
        }
    ];

    const generalTips = [
        {
            id: "healthy-diet",
            title: "Healthy Diet",
            icon: <Apple className="w-8 h-8 text-green-500" />,
            text: "Eat a balanced diet rich in fruits, vegetables, whole grains, and lean proteins.",
            description: "A well-balanced diet is the cornerstone of good health. The right foods fuel your body, strengthen your immune system, and reduce the risk of chronic diseases including heart disease, diabetes, and certain cancers.",
            steps: [
                "Fill half your plate with colorful fruits and vegetables at every meal.",
                "Choose whole grains (brown rice, oats, whole wheat) over refined carbohydrates.",
                "Include lean proteins such as fish, chicken, legumes, and nuts daily.",
                "Limit added sugars, processed foods, and saturated fats to occasional treats.",
            ],
            video: "https://www.youtube.com/embed/dBnniua6-oM?rel=0&modestbranding=1"
        },
        {
            id: "regular-exercise",
            title: "Regular Exercise",
            icon: <Activity className="w-8 h-8 text-blue-500" />,
            text: "Aim for at least 30 minutes of moderate physical activity daily.",
            description: "Consistent physical activity improves cardiovascular health, boosts mood, maintains a healthy weight, and lowers the risk of many chronic conditions. Even light movement every day makes a measurable difference.",
            steps: [
                "Start with a 5-minute warm-up (brisk walking or light stretching).",
                "Aim for at least 150 minutes of moderate aerobic activity per week.",
                "Add strength training exercises (bodyweight or weights) at least twice a week.",
                "Break up long sitting periods with short movement breaks every hour.",
            ],
            video: "https://www.youtube.com/embed/cbKkB3POqaY?rel=0&modestbranding=1"
        },
        {
            id: "adequate-sleep",
            title: "Adequate Sleep",
            icon: <Moon className="w-8 h-8 text-indigo-400" />,
            text: "Get 7-9 hours of quality sleep each night for optimal health.",
            description: "Quality sleep is essential for physical recovery, memory consolidation, hormonal balance, and immune function. Chronic sleep deprivation is linked to obesity, heart disease, and impaired cognitive performance.",
            steps: [
                "Maintain a consistent sleep schedule — same bedtime and wake time every day.",
                "Create a dark, cool, and quiet sleep environment for optimal rest.",
                "Avoid screens (phones, tablets, TV) at least 1 hour before bedtime.",
                "Limit caffeine after 2 PM and avoid heavy meals close to bedtime.",
            ],
            video: "https://www.youtube.com/embed/nm1TxQj9IsQ?rel=0&modestbranding=1"
        },
        {
            id: "stress-management",
            title: "Stress Management",
            icon: <Brain className="w-8 h-8 text-purple-500" />,
            text: "Practice relaxation techniques like meditation, yoga, or deep breathing exercises.",
            description: "Chronic stress elevates cortisol, weakens immunity, and increases the risk of heart disease and mental health disorders. Developing a consistent stress-management routine protects both mind and body.",
            steps: [
                "Practice deep diaphragmatic breathing for 5-10 minutes daily.",
                "Incorporate mindfulness meditation or guided relaxation into your morning routine.",
                "Schedule regular physical activity — it's one of the most effective stress relievers.",
                "Set clear boundaries between work and rest time to prevent burnout.",
            ],
            video: "https://www.youtube.com/embed/LiUnFJ8P4gM?rel=0&modestbranding=1"
        },
        {
            id: "hygiene",
            title: "Hygiene",
            icon: <Hand className="w-8 h-8 text-cyan-400" />,
            text: "Maintain good personal hygiene to prevent infections.",
            description: "Proper hygiene practices are one of the simplest and most effective ways to prevent the spread of infections and diseases. Good hygiene protects both you and the people around you.",
            steps: [
                "Wash hands with soap and water for at least 20 seconds before eating and after using the bathroom.",
                "Brush teeth twice daily and floss once daily to prevent oral disease.",
                "Shower regularly and keep clothing clean to prevent skin infections.",
                "Cover your mouth and nose when sneezing or coughing; dispose of tissues immediately.",
            ],
            video: "https://www.youtube.com/embed/3PmVJQUCm4E?rel=0&modestbranding=1"
        },
        {
            id: "regular-checkups",
            title: "Regular Check-ups",
            icon: <ShieldAlert className="w-8 h-8 text-medical-blue" />,
            text: "Visit your healthcare provider regularly for preventive screenings and health monitoring.",
            description: "Routine health check-ups allow early detection of conditions before symptoms appear. Regular screenings for blood pressure, cholesterol, blood sugar, and cancer can be life-saving and lead to better treatment outcomes.",
            steps: [
                "Schedule a comprehensive physical exam at least once a year with your primary care doctor.",
                "Follow age-appropriate screening guidelines for blood pressure, cholesterol, and blood sugar.",
                "Keep your vaccinations up to date — they protect against serious preventable diseases.",
                "Maintain a personal health record of medications, allergies, and past diagnoses to share with providers.",
            ],
            video: "https://www.youtube.com/embed/kLrScGovNAs?rel=0&modestbranding=1"
        }
    ];

    const exercises = [
        {
            title: "Cardiovascular Exercises",
            icon: <Heart className="w-8 h-8 text-rose-500" />,
            description: "Improves heart health, lung capacity, and overall stamina. Essential for long-term endurance.",
            steps: [
                "Start with a 5-minute warm-up (e.g., light jogging or brisk walking).",
                "Maintain a steady, moderate intensity for 20-30 minutes.",
                "Incorporate activities like running, cycling, or swimming.",
                "Finish with a 5-minute cool-down to carefully lower your heart rate."
            ],
            video: "https://www.youtube.com/embed/ml6cT4AZdqI?rel=0&controls=0&showinfo=0&modestbranding=1"
        },
        {
            title: "Strength & Resistance Training",
            icon: <Zap className="w-8 h-8 text-yellow-500" />,
            description: "Builds muscle mass, increases resting metabolic rate, and improves bone density.",
            steps: [
                "Warm up your joints and muscles with dynamic stretching.",
                "Focus on major muscle groups: chest, back, legs, and core.",
                "Perform 3 sets of 10-15 repetitions for each targeted exercise.",
                "Always prioritize proper form over heavy weights to avoid injuries."
            ],
            video: "https://www.youtube.com/embed/U0bhE67HuDY?rel=0&controls=0&showinfo=0&modestbranding=1"
        },
        {
            title: "Flexibility & Yoga",
            icon: <Activity className="w-8 h-8 text-emerald-500" />,
            description: "Enhances mobility, prevents stiffness, and acts as an excellent stress-relief mechanism.",
            steps: [
                "Find a quiet, distraction-free space and roll out a comfortable mat.",
                "Focus entirely on deep, controlled diaphragmatic breathing.",
                "Hold static stretches for 15-30 seconds without bouncing.",
                "Incorporate standard poses like Downward Dog, Child's Pose, and Cobra."
            ],
            video: "https://www.youtube.com/embed/sTANio_2E0Q?rel=0&controls=0&showinfo=0&modestbranding=1"
        }
    ];

    // Refs for each expanded tip detail section
    const tipRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollToTip = (id: string) => {
        const el = tipRefs.current[id];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 bg-gradient-to-b from-background via-medical-blue/5 to-medical-purple/5">
            <div className="container mx-auto max-w-7xl space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-4 pt-8">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple">
                        Disease Prevention Tips
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Stay healthy with our comprehensive guide to preventing common diseases
                    </p>
                </div>

                {/* Introductory Images */}
                <div className="relative py-12">
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 rounded-3xl overflow-hidden"
                        style={{ backgroundImage: 'url("/photo/bg-prevention.jpg")' }}
                    />
                    <div className="relative z-10 flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all duration-500">
                        <div className="relative w-48 h-48 md:w-64 md:h-64 hover:scale-105 transition-transform duration-300">
                            <Image src="/photo/photo-11.png" alt="Prevention 1" fill className="object-contain" />
                        </div>
                        <div className="relative w-64 h-64 md:w-80 md:h-80 hover:scale-110 transition-transform duration-300">
                            <Image src="/photo/photo-10.png" alt="Prevention 2" fill className="object-contain" />
                        </div>
                        <div className="relative w-48 h-48 md:w-64 md:h-64 hover:scale-105 transition-transform duration-300">
                            <Image src="/photo/photo-12.png" alt="Prevention 3" fill className="object-contain" />
                        </div>
                    </div>
                </div>

                {/* Diseases Grid */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                        <ShieldAlert className="text-medical-blue" />
                        Specific Conditions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {diseases.map((disease, idx) => (
                            <GlassCard key={idx} className="h-full group hover:border-medical-blue/50 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                            {disease.icon}
                                        </div>
                                        <CardTitle className="text-xl">{disease.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {disease.tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </GlassCard>
                        ))}
                    </div>
                </section>

                {/* General Health Tips — clickable cards scroll to detail below */}
                <section>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="text-green-500" />
                        General Health Tips
                    </h2>
                    <p className="text-muted-foreground mb-8">Click a card to jump to its detailed guide and video below.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generalTips.map((tip) => (
                            <button
                                key={tip.id}
                                onClick={() => scrollToTip(tip.id)}
                                className="text-left w-full focus:outline-none focus:ring-2 focus:ring-medical-blue/50 rounded-2xl"
                            >
                                <GlassCard className="h-full flex items-center justify-center text-center p-6 hover:border-medical-blue/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-white/5 rounded-full">
                                            {tip.icon}
                                        </div>
                                        <h3 className="text-xl font-semibold">{tip.title}</h3>
                                        <p className="text-muted-foreground text-sm">{tip.text}</p>
                                        <span className="text-xs text-medical-blue/80 font-medium mt-1 flex items-center gap-1">
                                            ↓ View guide & video
                                        </span>
                                    </div>
                                </GlassCard>
                            </button>
                        ))}
                    </div>
                </section>

                {/* General Health Tips — Expanded detail sections with steps + video */}
                <section className="space-y-12 pb-4">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <Pill className="text-medical-purple" />
                        Detailed Health Guides
                    </h2>
                    <div className="space-y-12">
                        {generalTips.map((tip) => (
                            <div
                                key={tip.id}
                                ref={(el) => { tipRefs.current[tip.id] = el; }}
                                id={tip.id}
                                className="scroll-mt-32"
                            >
                                <GlassCard className="overflow-hidden group hover:border-medical-blue/30 transition-all duration-300">
                                    <div className="grid md:grid-cols-2 gap-0 md:gap-6 items-stretch">
                                        {/* Left: Description + Steps */}
                                        <div className="p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                                    {tip.icon}
                                                </div>
                                                <h3 className="text-2xl font-bold">{tip.title}</h3>
                                            </div>
                                            <p className="text-muted-foreground mb-6 text-lg">
                                                {tip.description}
                                            </p>
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-white/90 uppercase tracking-wider text-sm">Step-by-Step Guide:</h4>
                                                <ul className="space-y-3">
                                                    {tip.steps.map((step, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-medical-blue/20 text-medical-blue flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                                                                {i + 1}
                                                            </div>
                                                            <span className="text-gray-300">{step}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Right: Video with hover-reveal overlay */}
                                        <div className="relative aspect-video md:aspect-auto h-64 md:h-auto overflow-hidden">
                                            {/* Overlay: visible by default, hidden when cursor is on the video */}
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none">
                                                <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center backdrop-blur-md bg-black/30">
                                                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
                                                </div>
                                            </div>
                                            <iframe
                                                className="w-full h-full min-h-[300px]"
                                                src={tip.video}
                                                title={`Guide Video - ${tip.title}`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Exercises Section */}
                <section className="pb-12">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                        <Zap className="text-yellow-500" />
                        Exercises for Better Health
                    </h2>
                    <div className="space-y-12">
                        {exercises.map((exercise, idx) => (
                            <GlassCard key={idx} className="overflow-hidden group hover:border-medical-blue/30 transition-all duration-300">
                                <div className="grid md:grid-cols-2 gap-0 md:gap-6 items-stretch">
                                    <div className="p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                                {exercise.icon}
                                            </div>
                                            <h3 className="text-2xl font-bold">{exercise.title}</h3>
                                        </div>
                                        <p className="text-muted-foreground mb-6 text-lg">
                                            {exercise.description}
                                        </p>
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-white/90 uppercase tracking-wider text-sm">Step-by-Step Guide:</h4>
                                            <ul className="space-y-3">
                                                {exercise.steps.map((step, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-medical-blue/20 text-medical-blue flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-gray-300">{step}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="relative aspect-video md:aspect-auto h-64 md:h-auto overflow-hidden">
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none">
                                            <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center backdrop-blur-md">
                                                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
                                            </div>
                                        </div>
                                        <iframe
                                            className="w-full h-full min-h-[300px]"
                                            src={exercise.video}
                                            title={`Exercise Video - ${exercise.title}`}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
