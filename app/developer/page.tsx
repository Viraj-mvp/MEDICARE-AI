'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
export interface ActivityItem {
    id: string;
    icon: any;
    message: React.ReactNode;
    timestamp: string;
    iconColorClass?: string;
}

import {
    LayoutDashboard, Users, Activity, MessageSquare, LogOut,
    RefreshCw, Shield, Clock, UserPlus, FileText, AlertOctagon
} from 'lucide-react';
import Image from 'next/image';

// Import management components
const HospitalManagement = dynamic(() => import('@/components/admin/HospitalManagement'), { ssr: false });
const DiseaseManagement = dynamic(() => import('@/components/admin/DiseaseManagement'), { ssr: false });
const SymptomManagement = dynamic(() => import('@/components/admin/SymptomManagement'), { ssr: false });
const AdminAIAssistant = dynamic(() => import('@/components/admin/AdminAIAssistant'), { ssr: false });

// Client-side only clock component to avoid hydration errors
const ClientClock = () => {
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        setTime(new Date().toLocaleTimeString());
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return <span className="opacity-0">00:00:00 AM</span>; // Placeholder to prevent layout shift

    return <>{time}</>;
};

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        users: 0,
        predictions: 0,
        feedback: 0,
        activeSessions: 0,
        emergencies: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentPredictions, setRecentPredictions] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [emergencies, setEmergencies] = useState<any[]>([]);
    const [dashboardActivities, setDashboardActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        if (!userStr) {
            router.push('/auth');
            return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== 'admin' && user.role !== 'developer') {
            router.push('/profile');
            return;
        }

        // Load initial data
        fetchAllData();
    }, [router]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            // Fetch all data concurrently
            const [statsRes, usersRes, predsRes, feedbackRes, activityRes, emergencyRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/users'),
                fetch('/api/admin/predictions'),
                fetch('/api/admin/feedback'),
                fetch('/api/admin/activity?page=0&limit=25'),
                fetch('/api/admin/emergencies')
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(prev => ({ ...prev, ...data }));
            }

            if (usersRes.ok) {
                const data = await usersRes.json();
                setRecentUsers(data.users || []);
            }

            if (predsRes.ok) {
                const data = await predsRes.json();
                setRecentPredictions(data.predictions || []);
            }

            if (feedbackRes.ok) {
                const data = await feedbackRes.json();
                setFeedbacks(data.feedbacks || []);
            }

            if (activityRes.ok) {
                const data = await activityRes.json();
                setActivityLogs(data.activityLogs || []);
            }

            if (emergencyRes.ok) {
                const data = await emergencyRes.json();
                setEmergencies(data.emergencies || []);
                setStats(prev => ({ ...prev, emergencies: data.emergencies?.length || 0 }));
            }
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Transform data into activity feed format
    useEffect(() => {
        const activities: ActivityItem[] = [];

        // Add recent users
        recentUsers.slice(0, 3).forEach(user => {
            activities.push({
                id: `user-${user.id}`,
                icon: UserPlus,
                message: <>New user <span className="font-bold text-foreground">{user.name}</span> registered.</>,
                timestamp: user.date,
                iconColorClass: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50"
            });
        });

        // Add recent predictions
        recentPredictions.slice(0, 3).forEach(pred => {
            activities.push({
                id: `pred-${pred.id}`,
                icon: Activity,
                message: <>{pred.user} diagnosed with <span className="font-bold text-foreground">{pred.result}</span> ({pred.confidence}% confidence).</>,
                timestamp: pred.date,
                iconColorClass: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50"
            });
        });

        // Add feedback
        feedbacks.slice(0, 2).forEach(feedback => {
            activities.push({
                id: `feedback-${feedback.id}`,
                icon: MessageSquare,
                message: <>Feedback from <span className="font-bold text-foreground">{feedback.user}</span>: "{feedback.message.slice(0, 40)}..."</>,
                timestamp: feedback.date,
                iconColorClass: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50"
            });
        });

        // Sort by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Add recent emergencies (pin to top if recent enough, else sort)
        const recentEmergencies = emergencies.slice(0, 3).map(em => ({
            id: `em-${em.id}`,
            icon: AlertOctagon,
            message: <>Emergency Alert: <span className="font-bold text-foreground">{em.type}</span> from {em.name}</>,
            timestamp: em.date,
            iconColorClass: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50"
        }));

        setDashboardActivities([...recentEmergencies, ...activities].slice(0, 8).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, [recentUsers, recentPredictions, feedbacks, emergencies]);

    const handleRefresh = () => {
        fetchAllData();
    };

    const handleLogout = async () => {
        sessionStorage.removeItem('user');
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id
                ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/25'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </button>
    );

    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <GlassCard className="p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon className="w-16 h-16" />
            </div>
            <div className="relative z-10">
                <p className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
        </GlassCard>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row font-sans text-white">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-black/40 border-r border-white/10 flex-shrink-0">
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Logo" fill sizes="32px" className="object-contain" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">MediCare<span className="text-medical-blue">Admin</span></h2>
                            <p className="text-xs text-gray-500">v2.0.0 Panel</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem id="emergencies" icon={AlertOctagon} label="Emergencies" />
                        <SidebarItem id="users" icon={Users} label="Users" />
                        <SidebarItem id="predictions" icon={Activity} label="Diseases Predictions" />
                        <SidebarItem id="hospitals" icon={Shield} label="Hospitals" />
                        <SidebarItem id="diseases" icon={FileText} label="Diseases" />
                        <SidebarItem id="symptoms" icon={Activity} label="Symptoms" />
                        <SidebarItem id="activity" icon={Clock} label="Activity Logs" />
                        <SidebarItem id="feedbacks" icon={MessageSquare} label="Feedbacks" />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 px-4 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-medical-blue to-purple-500 flex items-center justify-center font-bold text-xs">
                                AD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">System Admin</p>
                                <p className="text-xs text-gray-500 truncate">admin@medicare.ai</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {activeTab === 'dashboard' && 'Overview'}
                                {activeTab === 'emergencies' && 'Emergency Alerts'}
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'predictions' && 'Disease Predictions'}
                                {activeTab === 'hospitals' && 'Hospital Management'}
                                {activeTab === 'diseases' && 'Disease Management'}
                                {activeTab === 'symptoms' && 'Symptom Management'}
                                {activeTab === 'activity' && 'Activity Logs'}
                                {activeTab === 'feedbacks' && 'User Feedback'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
                        </div>
                        <div className="flex gap-3">
                            <GlassCard className="px-4 py-2 flex items-center gap-2 !rounded-lg cursor-pointer hover:bg-white/5">
                                <Clock className="w-4 h-4 text-medical-blue" />
                                <span className="text-sm font-mono text-gray-300">
                                    {/* Client-side only time to prevent hydration mismatch */}
                                    <ClientClock />
                                </span>
                            </GlassCard>
                            <Button variant="glass" onClick={handleRefresh} disabled={isLoading}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </header>

                    {/* Dashboard Tab Content */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <StatCard label="Total Users" value={stats.users} icon={Users} color="text-blue-500" />
                                <StatCard label="Emergencies" value={stats.emergencies} icon={AlertOctagon} color="text-red-500" />
                                <StatCard label="Predictions" value={stats.predictions} icon={Activity} color="text-purple-500" />
                                <StatCard label="Total Feedback" value={stats.feedback} icon={MessageSquare} color="text-green-500" />
                                <StatCard label="Active Sessions" value={stats.activeSessions} icon={Shield} color="text-orange-500" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg">Recent User Activity</h3>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>View All</Button>
                                    </div>
                                    <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-gray-400 bg-white/5 uppercase border-b border-white/10">
                                                    <tr>
                                                        <th className="px-6 py-4">User</th>
                                                        <th className="px-6 py-4">Role</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4 text-right">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {recentUsers.slice(0, 3).map((u, i) => (
                                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                                                        {u.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">{u.name}</div>
                                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.role}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-green-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>{u.status}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">{u.date}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg">Recent Activity</h3>
                                    </div>
                                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                                        <ul className="space-y-4">
                                            {dashboardActivities.map((activity) => (
                                                <li key={activity.id} className="flex gap-3 text-sm items-start">
                                                    <div className={`mt-0.5 p-2 rounded-full ${activity.iconColorClass || 'bg-white/10 text-white'}`}>
                                                        <activity.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-300">{activity.message}</p>
                                                        <span className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Tabs */}
                    {activeTab !== 'dashboard' && (
                        <div className="text-center py-20 animate-in fade-in duration-500">
                            <div className="inline-flex p-6 rounded-full bg-white/5 mb-6">
                                {activeTab === 'emergencies' && <AlertOctagon className="w-12 h-12 text-red-500" />}
                                {activeTab === 'users' && <Users className="w-12 h-12 text-gray-600" />}
                                {activeTab === 'predictions' && <Activity className="w-12 h-12 text-gray-600" />}
                                {activeTab === 'feedbacks' && <MessageSquare className="w-12 h-12 text-gray-600" />}
                            </div>
                            <h2 className="text-xl font-bold mb-2">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module Loaded
                            </h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Real data loaded from database...
                            </p>

                            {/* Emergencies Tab */}
                            {activeTab === 'emergencies' && (
                                <div className="mt-8 max-w-6xl mx-auto bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="p-4 bg-white/5 border-b border-white/10">
                                        <h3 className="font-bold">Total Emergencies: {emergencies.length}</h3>
                                    </div>
                                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white/5 text-gray-400 sticky top-0">
                                                <tr>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Patient Info</th>
                                                    <th className="px-6 py-4">Emergency Type</th>
                                                    <th className="px-6 py-4">Location</th>
                                                    <th className="px-6 py-4 text-right">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {emergencies.map((e, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${e.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {e.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-white">{e.name}</div>
                                                            <div className="text-xs text-gray-500">{e.phone}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-red-400 font-bold">{e.type}</span>
                                                            {e.message && <div className="text-xs text-gray-500 italic mt-1">"{e.message}"</div>}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs max-w-xs">{e.address}</td>
                                                        <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                                                            {new Date(e.date).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {emergencies.length === 0 && (
                                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No emergency alerts found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div className="mt-8 max-w-4xl mx-auto bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/5 text-gray-400"><tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Date</th></tr></thead>
                                        <tbody>
                                            {recentUsers.map((u, i) => (
                                                <tr key={i} className="border-t border-white/5"><td className="px-6 py-4">{u.name}<br /><span className="text-xs text-gray-500">{u.email}</span></td><td className="px-6 py-4">{u.role}</td><td className="px-6 py-4 text-right">{u.date}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Predictions Tab */}
                            {activeTab === 'predictions' && (
                                <div className="mt-8 max-w-5xl mx-auto bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/5 text-gray-400"><tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Result</th><th className="px-6 py4">Confidence</th><th className="px-6 py-4 text-right">Time</th></tr></thead>
                                        <tbody>
                                            {recentPredictions.map((p, i) => (
                                                <tr key={i} className="border-t border-white/5"><td className="px-6 py-4">{p.user}</td><td className="px-6 py-4">{p.result}</td><td className="px-6 py-4">{p.confidence}%</td><td className="px-6 py-4 text-right text-gray-500 text-xs">{p.date}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Feedbacks Tab */}
                            {activeTab === 'feedbacks' && feedbacks.length > 0 && (
                                <div className="mt-8 max-w-4xl mx-auto space-y-4">
                                    {feedbacks.map((f, i) => (
                                        <GlassCard key={i} className="p-6 text-left">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${f.type === 'Bug Report' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{f.type}</span>
                                                <span className="text-xs text-gray-500">{f.date}</span>
                                            </div>
                                            <p className="text-gray-300 mb-3">"{f.message}"</p>
                                            <p className="text-sm text-gray-500">From: {f.user}</p>
                                        </GlassCard>
                                    ))}
                                </div>
                            )}

                            {/* Hospitals Tab */}
                            {activeTab === 'hospitals' && (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <HospitalManagement />
                                </div>
                            )}

                            {/* Diseases Tab */}
                            {activeTab === 'diseases' && (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <DiseaseManagement />
                                </div>
                            )}

                            {/* Symptoms Tab */}
                            {activeTab === 'symptoms' && (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <SymptomManagement />
                                </div>
                            )}

                            {/* Activity Logs Tab */}
                            {activeTab === 'activity' && (
                                <div className="mt-8 max-w-6xl mx-auto bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="p-4 bg-white/5 border-b border-white/10">
                                        <h3 className="font-bold">Recent Activity Logs ({activityLogs.length})</h3>
                                    </div>
                                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white/5 text-gray-400 sticky top-0">
                                                <tr>
                                                    <th className="px-6 py-4">Action</th>
                                                    <th className="px-6 py-4">User ID</th>
                                                    <th className="px-6 py-4">Details</th>
                                                    <th className="px-6 py-4">IP Address</th>
                                                    <th className="px-6 py-4 text-right">Timestamp</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {activityLogs.map((log, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.action === 'login' ? 'bg-green-500/20 text-green-400' :
                                                                    log.action === 'logout' ? 'bg-red-500/20 text-red-400' :
                                                                        log.action === 'prediction' ? 'bg-blue-500/20 text-blue-400' :
                                                                            log.action === 'hospital_search' ? 'bg-purple-500/20 text-purple-400' :
                                                                                'bg-yellow-500/20 text-yellow-400'
                                                                }`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                                            {log.userId ? String(log.userId).slice(-8) : 'anonymous'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs max-w-xs truncate">
                                                            {log.details ? JSON.stringify(log.details).slice(0, 50) + '...' : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                                                            {log.ipAddress || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            
            {/* AI Assistant for Admin */}
            <AdminAIAssistant />
        </div>
    );
}
