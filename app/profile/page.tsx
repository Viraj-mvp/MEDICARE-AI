'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, FileText, LogOut, User, Mail, Shield, Calendar, Bell, Lock, Phone } from 'lucide-react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AuthorFormCard } from "@/components/ui/author-form-card";
import { toast } from 'sonner';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // 1. Fetch User Data
                const userRes = await fetch('/api/auth/me');
                if (!userRes.ok) throw new Error('Not authenticated');
                const userData = await userRes.json();
                setUser(userData.user);

                // 2. Fetch History (Cookie is sent automatically)
                const histRes = await fetch('/api/predictions');
                if (histRes.ok) {
                    const histData = await histRes.json();
                    setPredictions(histData.predictions || []);
                }
            } catch (error) {
                console.error("Profile load failed", error);
                router.push('/auth');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [router]);


    const handleLogout = async () => {
        // Clear sessionStorage first to ensure immediate UI update
        sessionStorage.removeItem('user');

        // Call logout API to clear HttpOnly cookie
        await fetch('/api/auth/logout', { method: 'POST' });

        // Redirect to home page
        router.push('/');
        router.refresh();
    };

    const handleProfileUpdate = async (data: { name: string; title: string, phone?: string, imageUrl?: string }) => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    phone: data.phone,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            // Update local state immediately for snappy UI
            setUser((prev: any) => ({ ...prev, name: data.name, phone: data.phone }));
            setIsProfileOpen(false);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-medical-blue">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 bg-gradient-to-b from-background to-medical-blue/5">
            <div className="container mx-auto max-w-7xl">
                {/* Profile Header */}
                <GlassCard className="mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-medical-blue/20 bg-medical-blue/10 flex items-center justify-center">
                            {/* User Avatar Placeholder */}
                            <User className="w-16 h-16 text-medical-blue/50" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple">
                                {user?.name}
                            </h1>
                            <div className="flex flex-col md:flex-row gap-4 mt-2 text-muted-foreground justify-center md:justify-start">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {user?.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span className="capitalize">{user?.role} Account</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {user.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button onClick={handleLogout} variant="destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <GlassCard hover={false} className="bg-medical-blue/5 border-medical-blue/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-medical-blue/20 rounded-lg">
                                <Activity className="w-6 h-6 text-medical-blue" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Predictions</p>
                                <p className="text-3xl font-bold text-medical-blue">{predictions.length}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard hover={false} className="bg-medical-purple/5 border-medical-purple/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-medical-purple/20 rounded-lg">
                                <Calendar className="w-6 h-6 text-medical-purple" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Member Since</p>
                                <p className="text-xl font-bold">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                                        : 'Jan 2026'}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard hover={false} className="bg-green-500/5 border-green-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <Shield className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-xl font-bold text-green-500">Active</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Predictions */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Activity className="text-medical-blue" />
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {predictions.length === 0 ? (
                                <GlassCard>
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No health predictions yet.</p>
                                        <Button onClick={() => router.push('/predict')} variant="glass">
                                            Start Analysis
                                        </Button>
                                    </div>
                                </GlassCard>
                            ) : (
                                predictions.slice(0, 5).map((pred, i) => (
                                    <GlassCard key={i} className="group cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg text-medical-blue group-hover:underline">
                                                    {pred.result.primary_diagnosis}
                                                    {pred.relationship && pred.relationship !== 'Myself' && (
                                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                            (for {pred.relationship})
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(pred.createdAt).toLocaleDateString()} • {new Date(pred.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">{pred.result.confidence}%</div>
                                                <div className="text-xs text-muted-foreground">Confidence</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {pred.symptoms.map((s: any, idx: number) => (
                                                <span key={idx} className="text-xs px-2 py-1 bg-white/5 rounded-full border border-white/10">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <User className="text-medical-purple" />
                            Account
                        </h2>
                        <div className="space-y-4">
                            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                                <DialogTrigger asChild>
                                    <GlassCard className="cursor-pointer hover:bg-white/5 group">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold mb-1 group-hover:text-medical-blue transition-colors">Personal Information</h3>
                                                <p className="text-sm text-muted-foreground">Update your profile details</p>
                                            </div>
                                            <User className="w-5 h-5 text-muted-foreground group-hover:text-medical-blue transition-colors" />
                                        </div>
                                    </GlassCard>
                                </DialogTrigger>
                                <DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-lg" aria-describedby="profile-dialog-desc">
                                    <DialogTitle className="sr-only">Update Profile</DialogTitle>
                                    <DialogDescription id="profile-dialog-desc" className="sr-only">Update your name and phone number.</DialogDescription>
                                    <AuthorFormCard
                                        initialData={{
                                            name: user?.name,
                                            title: user?.email,
                                            phone: user?.phone,
                                        }}
                                        onSubmit={handleProfileUpdate}
                                        onCancel={() => setIsProfileOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <GlassCard className="cursor-pointer hover:bg-white/5 group">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold mb-1 group-hover:text-medical-purple transition-colors">Security Settings</h3>
                                                <p className="text-sm text-muted-foreground">Change password & 2FA</p>
                                            </div>
                                            <Lock className="w-5 h-5 text-muted-foreground group-hover:text-medical-purple transition-colors" />
                                        </div>
                                    </GlassCard>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Security Settings</DialogTitle>
                                        <DialogDescription>
                                            Manage your password and two-factor authentication settings.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <p className="text-muted-foreground text-center italic">Development Mode: Security settings coming soon.</p>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <GlassCard className="cursor-pointer hover:bg-white/5 group">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold mb-1 group-hover:text-green-500 transition-colors">Notification Preferences</h3>
                                                <p className="text-sm text-muted-foreground">Manage email alerts</p>
                                            </div>
                                            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                                        </div>
                                    </GlassCard>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Notification Preferences</DialogTitle>
                                        <DialogDescription>
                                            Choose which notifications you want to receive.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <p className="text-muted-foreground text-center italic">Development Mode: Notification settings coming soon.</p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
