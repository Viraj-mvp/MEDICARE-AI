'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/effects/GlassCard';
import { Shield, FileText, LifeBuoy, AlertTriangle, CheckCircle, Activity, Lock, Cpu } from 'lucide-react';

const legalSections = [
    {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: Shield,
        content: `Your privacy is our priority. At MEDICARE-AI, we are committed to protecting your personal and medical data. 
        We use industry-standard encryption and follow strict HIPAA-aligned guidelines to ensure your information remains confidential. 
        We do not sell your data to third parties.`
    },
    {
        id: 'terms',
        title: 'Terms of Service',
        icon: FileText,
        content: `By using MEDICARE-AI, you agree to our terms. This platform is designed to provide AI-powered health insights. 
        Users are responsible for the accuracy of the information they provide. The insights generated are for informational 
        purposes and do not replace professional medical advice.`
    },
    {
        id: 'support',
        title: 'Contact Support',
        icon: LifeBuoy,
        content: `Need help? Our support team is here for you 24/7. Whether you have questions about your account, 
        our AI predictions, or hospital listings, feel free to reach out via email at support@medicare-ai.com 
        or use the chat assistant.`
    }
];

const diagnosticItems = [
    {
        title: "Security & AI Cleanup",
        status: "Solved",
        description: "Removed hardcoded API keys and deleted unused/deprecated AI provider scripts (OpenAI, DeepSeek) to eliminate security vulnerabilities.",
        icon: Lock
    },
    {
        title: "Database Optimization",
        status: "Solved",
        description: "Optimized the Hospital Search API by replacing in-memory sorting with MongoDB server-side aggregation for faster response times.",
        icon: Activity
    },
    {
        title: "Architecture Refinement",
        status: "Solved",
        description: "Consolidated documentation and unified project structure by moving utility scripts to a dedicated directory.",
        icon: Cpu
    },
    {
        title: "Chatbot Context Awareness",
        status: "Solved",
        description: "Enhanced the AI assistant with multi-turn conversation support and page-specific intelligent suggestions.",
        icon: CheckCircle
    }
];

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient">Legal & Diagnostics</h1>
                    <p className="text-muted-foreground text-lg">
                        Transparency, Security, and Continuous Improvement at MEDICARE-AI.
                    </p>
                </motion.div>

                {/* Legal Sections */}
                <div className="grid gap-8">
                    {legalSections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            id={section.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="p-8 space-y-4 border-white/5">
                                <div className="flex items-center gap-4 text-medical-blue">
                                    <div className="p-3 rounded-2xl bg-medical-blue/10">
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                                </div>
                                <p className="text-gray-400 leading-relaxed">
                                    {section.content}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Problems & Diagnostics Section */}
                <motion.div 
                    id="problems_and_diagnostics"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="pt-10"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">Problems & Diagnostics</h2>
                            <p className="text-muted-foreground">Recent system audits and solved issues.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {diagnosticItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className="p-6 h-full border-white/5 hover:border-medical-blue/30 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 rounded-lg bg-white/5 text-medical-blue">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                            {item.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {item.description}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Medical Disclaimer */}
                <GlassCard className="p-6 bg-red-500/5 border-red-500/10">
                    <p className="text-xs text-red-400/80 text-center uppercase tracking-tighter">
                        Medical Disclaimer: MEDICARE-AI provides health risk assessments based on AI models. 
                        It is NOT a replacement for professional medical diagnosis, treatment, or advice. 
                        Always consult with a qualified healthcare provider for medical concerns.
                    </p>
                </GlassCard>
            </div>
        </div>
    );
}
