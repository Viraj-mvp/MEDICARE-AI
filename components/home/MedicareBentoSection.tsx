"use client";

import * as React from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BentoGridShowcase } from "@/components/ui/bento-grid";
import {
    HeartPulse,
    Plus,
    Search,
    Brain,
    Shield,
    Users,
    Stethoscope,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Helper Components for the Demo ---

const IntegrationsCard = () => (
    <Card className="relative h-full overflow-hidden">
        {/* Background photo-1.png with overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
            <img src="/photo/photo-1.png" alt="" className="w-full h-[150%] object-cover object-center opacity-40 dark:opacity-30 mix-blend-overlay absolute -top-1/4" />
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
        </div>
        <CardHeader className="relative z-10">
            <CardTitle className="text-lg">Core Features</CardTitle>
            <CardDescription>
                Seamlessly access MediCare AI's primary intelligence modules.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-4 pt-2">
            <TooltipProvider delayDuration={100}>
                {/* 1. Intelligent Hospital Search */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/hospitals" className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 hover:bg-blue-500/40 transition-all border border-blue-500/40 hover:scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] backdrop-blur-md">
                            <Search className="h-6 w-6 text-blue-500 group-hover:text-white dark:text-blue-300 dark:group-hover:text-white transition-colors drop-shadow-md" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Intelligent Hospital Search</p>
                    </TooltipContent>
                </Tooltip>

                {/* 2. AI Disease Prediction */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/predict" className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/20 hover:bg-purple-500/40 transition-all border border-purple-500/40 hover:scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] backdrop-blur-md">
                            <Brain className="h-6 w-6 text-purple-500 group-hover:text-white dark:text-purple-300 dark:group-hover:text-white transition-colors drop-shadow-md" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>AI Disease Risk Prediction</p>
                    </TooltipContent>
                </Tooltip>

                {/* 3. Prevention & Health Tips */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/prevention" className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 hover:bg-green-500/40 transition-all border border-green-500/40 hover:scale-110 shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.8)] backdrop-blur-md">
                            <Shield className="h-6 w-6 text-green-500 group-hover:text-white dark:text-green-300 dark:group-hover:text-white transition-colors drop-shadow-md" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Prevention & Medical Remedies</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </CardContent>
    </Card>
);

const FeatureTagsCard = () => (
    <Card className="relative h-full overflow-hidden">
        {/* Background OM.png with overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
            <img src="/photo/OM.webp" alt="" className="w-full h-[200%] object-cover object-center opacity-50 dark:opacity-40 absolute -top-1/2" />
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
        </div>
        <CardContent className="relative z-10 flex h-full flex-col justify-center gap-3 p-6">
            <Badge
                variant="outline"
                className="w-fit items-center gap-1.5 border-blue-400 py-1.5 px-3 text-blue-700 dark:border-blue-700 dark:text-blue-300 shadow-sm"
            >
                AI-Powered Prediction <Plus className="h-3 w-3" />
            </Badge>
            <Badge
                variant="secondary"
                className="w-fit items-center gap-1.5 bg-blue-100 py-1.5 px-3 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm"
            >
                Zero-Knowledge Privacy
            </Badge>
            <Badge
                variant="outline"
                className="w-fit items-center gap-1.5 border-blue-400 py-1.5 px-3 text-blue-700 dark:border-blue-700 dark:text-blue-300 shadow-sm"
            >
                High Clinical Accuracy <Plus className="h-3 w-3" />
            </Badge>
        </CardContent>
    </Card>
);

const MainFeatureCard = () => (
    <Card className="relative h-full w-full overflow-hidden">
        <div className="absolute top-6 left-6 z-10 rounded-lg bg-background/80 p-3 backdrop-blur-md border border-white/10 shadow-sm">
            <p className="text-xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                MediCare AI Next-Gen System.
            </p>
        </div>
        <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"
            alt="Doctor using digital tablet in modern hospital"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
    </Card>
);

const StatCard = () => (
    <Card className="relative h-full flex flex-col justify-between bg-sky-100/90 p-6 dark:bg-sky-950/90 border-sky-200 dark:border-sky-900 overflow-hidden">
        <HeartPulse className="h-8 w-8 text-sky-700 dark:text-sky-400 relative z-10" />

        <div className="relative z-10 mt-auto">
            <p className="text-6xl font-bold text-sky-900 dark:text-sky-100 tracking-tighter">98%</p>
            <p className="text-sm font-medium text-sky-800 dark:text-sky-300 mt-1">
                Diagnostic accuracy across thousands of clinical multi-symptom AI predictions globally.
            </p>
        </div>
    </Card>
);

const SecondaryFeatureCard = () => (
    <Card className="relative h-full w-full overflow-hidden">
        <img
            src="/photo/HS1.webp"
            alt="Intelligent global hospital network map"
            className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 right-6 z-10">
            <p className="text-xl font-bold text-foreground [text-shadow:_0_1px_10px_rgb(255_255_255_/_40%)] dark:[text-shadow:_0_1px_10px_rgb(0_0_0_/_80%)]">
                Global intelligent networking.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
                Instantly match logic-tested diagnostics with the nearest 900+ partnered health facilities.
            </p>
        </div>
    </Card>
);

const UsersCard = () => (
    <Card className="relative h-full w-full overflow-hidden p-6 bg-gradient-to-br from-background to-muted/50 border-blue-100 dark:border-blue-900/30">
        <CardTitle className="text-lg text-blue-700 dark:text-blue-400">Global Patient Network</CardTitle>
        <CardDescription className="mt-1">
            Empowering a rapidly growing community with accessible, AI-driven healthcare insights and curated hospital data.
        </CardDescription>

        <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <p className="text-lg font-bold leading-none">50,000+</p>
                    <p className="text-sm text-muted-foreground mt-1">Lives Impacted</p>
                </div>
            </div>

            <div className="flex items-center gap-3 z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-800">
                    <Stethoscope className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                    <p className="text-lg font-bold leading-none">900+</p>
                    <p className="text-sm text-muted-foreground mt-1">Partner Hospitals</p>
                </div>
            </div>
        </div>

        {/* Minimalist abstract users background element */}
        <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
            <Users className="h-48 w-48 text-blue-600 dark:text-blue-400" />
        </div>
    </Card>
);

// --- The Medicare Bento Grid Section ---
export default function MedicareBentoSection() {
    return (
        <div className="w-full">
            <BentoGridShowcase
                integrations={<IntegrationsCard />}
                featureTags={<FeatureTagsCard />}
                mainFeature={<MainFeatureCard />}
                secondaryFeature={<SecondaryFeatureCard />}
                statistic={<StatCard />}
                journey={<UsersCard />}
            />
        </div>
    );
}
