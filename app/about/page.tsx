'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/effects/GlassCard';
import {
    Activity, Globe,
    Brain, MapPin, Shield,
    Mail, Phone,
    Cpu, Sparkles, Database,
    Github, Linkedin, Twitter
} from 'lucide-react';
import { TeamCarousel } from '@/components/ui/profile-card-testimonial-carousel';
import MedicareBentoSection from '@/components/home/MedicareBentoSection';
import Image from 'next/image';

const milestones = [
    {
        year: "2026 Q1",
        title: "Multi-Provider AI Core",
        description: "Integrated Groq (Llama 3.3-70B) for 300+ tokens/sec inference and Gemini 1.5 Flash for deep medical reasoning.",
        icon: Cpu
    },
    {
        year: "2026 Q2",
        title: "Platform Security Audit",
        description: "Removed legacy vulnerabilities and hardcoded keys. Implemented a zero-knowledge architecture for the Health Passport.",
        icon: Shield
    },
    {
        year: "2026 Q2",
        title: "Medi Assistant v2.0",
        description: "Launched a context-aware AI chat system with multi-turn conversation support and page-specific intelligence.",
        icon: Sparkles
    },
    {
        year: "2026 Q3",
        title: "Geo-Spatial Optimization",
        description: "Migrated hospital search to MongoDB $geoNear server-side aggregation, delivering 70% faster location results.",
        icon: Database
    }
];

const futureEnhancements = [
    {
        badge: "01",
        title: "Emergency Alert System",
        description: "Real-time Email/SMS notifications for high-risk diagnoses and priority queues bypassing rate limits for critical alerts."
    },
    {
        badge: "02",
        title: "Advanced AI",
        description: "Medical history context, chronic condition tracking, voice input, and multi-language support (Hindi, Gujarati)."
    },
    {
        badge: "03",
        title: "Mobile Experience",
        description: "Progressive Web App (PWA) with offline mode, push notifications, and Apple Health / Google Fit sync."
    },
    {
        badge: "04",
        title: "Provider Integration",
        description: "Dedicated doctor portal, appointment booking, telemedicine video consultations, and EHR integration."
    },
    {
        badge: "v3.0",
        title: "Planned for v3.0",
        description: "Real-time chat with professionals, AI medication interaction checker, and mental health assessment module."
    }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-background">
            <div className="container mx-auto max-w-7xl space-y-24">

                {/* Hero Section */}
                <section className="text-center space-y-6 pt-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-medical-blue/10 border border-medical-blue/20 text-medical-blue text-xs tracking-widest font-bold mb-4"
                    >
                        EST. 2026
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold font-display text-gradient leading-tight"
                    >
                        Revolutionizing Healthcare
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    >
                        Bridging the gap between advanced AI technology and compassionate human care.
                    </motion.p>
                </section>

                {/* Platform Evolution / Milestones */}
                <section className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold">Platform Evolution</h2>
                        <p className="text-muted-foreground">Our journey towards a more secure and intelligent healthcare platform.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {milestones.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className="p-6 h-full border-white/5 hover:border-medical-blue/20 transition-all">
                                    <span className="text-[10px] font-bold text-medical-blue bg-medical-blue/10 px-2 py-1 rounded-full mb-4 inline-block tracking-tighter">
                                        {item.year}
                                    </span>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-white/5 text-medical-blue">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-white text-sm">{item.title}</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Platform in Action - Bento Grid */}
                <section>
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <div className="h-px w-12 bg-white/10" />
                        <h2 className="text-3xl font-bold text-center">Platform in Action</h2>
                        <div className="h-px w-12 bg-white/10" />
                    </div>
                    <MedicareBentoSection />
                </section>

                {/* Mission & Impact */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <GlassCard className="p-8 h-full flex flex-col justify-center">
                        <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                            We are on a mission to democratize healthcare. By leveraging the power of 2026's most advanced Generative AI, we provide hospital-grade preliminary diagnosis accessible to anyone with an internet connection.
                        </p>
                        <div className="flex items-center gap-4 text-sm font-bold text-medical-blue tracking-widest uppercase">
                            <Globe className="w-5 h-5" />
                            <span>Serving patients globally</span>
                        </div>
                    </GlassCard>

                    <div className="grid grid-cols-2 gap-4">
                        <GlassCard className="p-6 flex flex-col items-center justify-center text-center bg-medical-blue/5 border-medical-blue/20 group hover:border-medical-blue/50 transition-all">
                            <h3 className="text-4xl font-bold text-white mb-2">50k+</h3>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Lives Impacted</p>
                        </GlassCard>
                        <GlassCard className="p-6 flex flex-col items-center justify-center text-center bg-purple-500/5 border-purple-500/20 group hover:border-purple-500/50 transition-all">
                            <h3 className="text-4xl font-bold text-white mb-2">98%</h3>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Diagnostic Accuracy</p>
                        </GlassCard>
                        <GlassCard className="p-6 flex flex-col items-center justify-center text-center bg-green-500/5 border-green-500/20 group hover:border-green-500/50 transition-all">
                            <h3 className="text-4xl font-bold text-white mb-2">1000+</h3>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Verified Hospitals</p>
                        </GlassCard>
                        <GlassCard className="p-6 flex flex-col items-center justify-center text-center bg-cyan-500/5 border-cyan-500/20 group hover:border-cyan-500/50 transition-all">
                            <h3 className="text-4xl font-bold text-white mb-2">24/7</h3>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">AI Availability</p>
                        </GlassCard>
                    </div>
                </section>

                {/* Technology Deep Dive */}
                <section>
                    <GlassCard className="p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-medical-blue/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-12 text-center">Powered by 2026 AI Architecture</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="space-y-4 group">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all">
                                        <Brain className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Neural Processing</h3>
                                    <p className="text-muted-foreground leading-relaxed">Our 4th Gen models process 500+ symptom data points simultaneously using Groq's Llama 3.3-70B engine.</p>
                                </div>
                                <div className="space-y-4 group">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all">
                                        <Shield className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Zero-Knowledge Privacy</h3>
                                    <p className="text-muted-foreground leading-relaxed">Your medical data is encrypted instantly. We use client-side hashing and 'jose' for secure, private health records.</p>
                                </div>
                                <div className="space-y-4 group">
                                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-all">
                                        <Activity className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Real-Time Vitals</h3>
                                    <p className="text-muted-foreground leading-relaxed">Direct integration with MongoDB $geoNear for instant hospital sorting and real-time medical context.</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </section>

                {/* Future Enhancements */}
                <section className="space-y-12">
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-white/10" />
                        <h2 className="text-3xl font-bold text-center">Future Roadmap</h2>
                        <div className="h-px w-12 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {futureEnhancements.map((item, index) => (
                            <GlassCard key={index} className={`p-8 relative overflow-hidden group hover:border-medical-blue/40 transition-all ${item.badge === 'v3.0' ? 'md:col-span-2 border-medical-blue/30 bg-medical-blue/5' : ''}`}>
                                <div className="relative z-10 flex gap-6">
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-xs text-medical-blue border border-white/10">
                                        {item.badge}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold group-hover:text-medical-blue transition-colors">{item.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold">Meet The Founders</h2>
                        <p className="text-muted-foreground">The visionaries behind MEDICARE-AI's next-gen health ecosystem.</p>
                    </div>
                    
                    <TeamCarousel />
                </section>

                {/* Contact Section */}
                <section className="text-center pb-12 space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold">Get in Touch</h2>
                        <p className="text-muted-foreground">Available 24/7 for support and collaboration.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <GlassCard className="p-8 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group">
                            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Email Support</h3>
                                <p className="text-muted-foreground text-sm">MediCare@gmail.com</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="p-8 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group">
                            <div className="p-4 rounded-2xl bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-all">
                                <Phone className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Phone Line</h3>
                                <p className="text-muted-foreground text-sm">+91 1234567890</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="p-8 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group">
                            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-all">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">HQ Address</h3>
                                <p className="text-muted-foreground text-sm">Sector-15, L.D.R.P, Gandhinagar<br />Gujarat, India</p>
                            </div>
                        </GlassCard>
                    </div>
                </section>

            </div>
        </div>
    );
}
