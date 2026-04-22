"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/effects/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming we have textarea or need to use Input as textarea
import { Send, MessageSquare } from "lucide-react";

export function FeedbackSection() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <section className="py-20 relative">
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <GlassCard className="p-8 md:p-12 border-medical-purple/20 bg-gradient-to-br from-medical-purple/5 to-medical-blue/5">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                            <MessageSquare className="w-6 h-6 text-medical-purple" /> Your Feedback Matters
                        </h2>
                        <p className="text-muted-foreground">
                            Help us improve MediCare AI by sharing your thoughts
                        </p>
                    </div>

                    {submitted ? (
                        <div className="text-center py-12 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold">Thank You!</h3>
                            <p className="text-muted-foreground mt-2">Your feedback has been received.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input placeholder="John Doe" required className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" placeholder="john@example.com" required className="bg-background/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Tell us about your experience..."
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-medical-blue to-medical-purple hover:opacity-90 transition-opacity h-12 text-lg">
                                Submit Feedback
                            </Button>
                        </form>
                    )}
                </GlassCard>
            </div>
        </section>
    );
}
