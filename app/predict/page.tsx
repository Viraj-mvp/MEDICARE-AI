'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { EcgLoading } from '@/components/predict/EcgLoading';
import { LoadingOrbit } from '@/components/effects/LoadingOrbit';
import { Input } from '@/components/ui/input';
import { FlowButton } from '@/components/ui/flow-button';
import {
    Activity, Search, Plus, X, AlertCircle,
    TrendingUp, ArrowLeft, CheckCircle, User, Phone, ArrowRight, Users
} from 'lucide-react';
import { symptoms, categories } from '@/data/symptoms';
import { DynamicQuestionnaire } from '@/components/predict/DynamicQuestionnaire';
import { SeverityAssessment } from '@/components/predict/SeverityAssessment';
import { PredictionResults, Disease } from '@/components/predict/PredictionResults';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle as AlertIcon } from 'lucide-react';
import { LiquidRadio } from '@/components/ui/liquid-radio';

interface SymptomInput {
    name: string;
    severity: number;
    source: 'static' | 'custom';
    id?: string;
}

interface UserDetails {
    name: string;
    age: string;
    gender: string;
    phone: string;
}

export default function PredictPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Auth & User Details
    const [hasAuth, setHasAuth] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails>({
        name: '', age: '', gender: '', phone: ''
    });

    // Relationship State
    const [predictionSource, setPredictionSource] = useState('myself');
    const [relationship, setRelationship] = useState('');
    const [originalUser, setOriginalUser] = useState<UserDetails | null>(null); // Store logged-in user details

    // Prediction State
    const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomInput[]>([]);
    const [customSymptom, setCustomSymptom] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [result, setResult] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    // Clear error when symptoms change
    useEffect(() => {
        if (error) setError(null);
    }, [selectedSymptoms.length]);

    // Auth Check via API
    useEffect(() => {
        const checkAuth = async () => {
            // If we already have user details in memory or local state, we might skip full refetch,
            // but checking validity is good.
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (!data.user) {
                        router.push('/auth?redirect=/predict');
                        return;
                    }
                    setHasAuth(true);
                    let finalUser = {
                        name: data.user.name || '',
                        age: data.user.age || '',
                        gender: data.user.gender || '',
                        phone: data.user.phone || ''
                    };
                    
                    const cachedProfile = sessionStorage.getItem('medicare_patient_profile');
                    if (cachedProfile) {
                        try {
                            const parsed = JSON.parse(cachedProfile);
                            if (parsed.age) finalUser.age = parsed.age;
                            if (parsed.gender) finalUser.gender = parsed.gender;
                            if (parsed.phone) finalUser.phone = parsed.phone;
                        } catch(e) {}
                    }
                    
                    setUserDetails(finalUser);
                    setOriginalUser(finalUser as any);
                } else {
                    router.push('/auth?redirect=/predict');
                }
            } catch (e) {
                console.error("Auth check failed", e);
                router.push('/auth');
            }
        };

        checkAuth();
    }, [router]);

    // ...

    const validateStep1 = () => {
        if (!userDetails.name.trim()) return false;
        if (!userDetails.age || parseInt(userDetails.age) < 0 || parseInt(userDetails.age) > 120) return false;
        if (!userDetails.gender) return false;
        if (userDetails.phone.length !== 10) return false;
        return true;
    };

    const handleNextStep1 = () => {
        if (validateStep1()) {
            sessionStorage.setItem('medicare_patient_profile', JSON.stringify(userDetails));
            if (hasAuth && predictionSource === 'myself') {
                // Auto-sync profile to db so it sticks across devices
                fetch('/api/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: userDetails.name,
                        phone: userDetails.phone,
                        age: userDetails.age,
                        gender: userDetails.gender
                    })
                }).catch(e => console.error("Profile sync failed", e));
            }
            setStep(2);
        } else {
            alert("Please fill all fields correctly");
        }
    };

    // Derived State
    const severitiesRecord = selectedSymptoms.reduce((acc, curr) => {
        acc[curr.id || curr.name] = curr.severity;
        return acc;
    }, {} as Record<string, number>);

    const filteredSymptoms = symptoms.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Handle Source Change
    const handleSourceChange = (value: string) => {
        setPredictionSource(value);
        if (value === 'myself') {
            if (originalUser) {
                // Revert to logged-in user
                setUserDetails(prev => ({
                    ...prev,
                    name: originalUser.name,
                    phone: originalUser.phone
                }));
            }
            setRelationship('');
        } else {
            // Clear for new entry
            setUserDetails({ name: '', age: '', gender: '', phone: '' });
            setRelationship('');
        }
    };

    // Prevent rendering until auth checked
    if (!hasAuth) return <div className="min-h-screen pt-52 flex justify-center"><LoadingOrbit /></div>;

    // Handlers
    const handleUserDetailChange = (field: keyof UserDetails, value: string) => {
        if (field === 'phone') {
            const num = value.replace(/\D/g, '').slice(0, 10);
            setUserDetails(prev => ({ ...prev, phone: num }));
        } else {
            setUserDetails(prev => ({ ...prev, [field]: value }));
        }
    };



    const toggleSymptom = (symptom: typeof symptoms[0]) => {
        const exists = selectedSymptoms.find(s => s.name === symptom.name);
        if (exists) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s.name !== symptom.name));
        } else {
            if (selectedSymptoms.length >= 3) {
                setError('Maximum 3 symptoms allowed for precise analysis');
                return;
            }
            setSelectedSymptoms([...selectedSymptoms, {
                name: symptom.name,
                severity: 3,
                source: 'static',
                id: symptom.id
            }]);
        }
    };

    const addCustomSymptom = () => {
        if (!customSymptom.trim()) return;
        if (selectedSymptoms.length >= 3) {
            setError('Maximum 3 symptoms allowed for precise analysis');
            return;
        }

        setSelectedSymptoms([...selectedSymptoms, {
            name: customSymptom.trim(),
            severity: 3,
            source: 'custom',
            id: `custom_${Date.now()}`
        }]);
        setCustomSymptom('');
    };

    const updateSeverity = (symptomId: string, severity: number) => {
        setSelectedSymptoms(prev => prev.map(s =>
            (s.id === symptomId || s.name === symptomId) ? { ...s, severity } : s
        ));
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handlePredict = async () => {
        // Double check validation before sending
        if (!userDetails.name || !userDetails.age || !userDetails.gender) {
            alert("Please complete your profile details first.");
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userDetails,
                    symptoms: selectedSymptoms,
                    answers,
                    relationship: predictionSource === 'other' ? relationship : 'Myself'
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setResult(data);
            setStep(5);
        } catch (error: any) {
            alert(error.message || 'Prediction failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-40 pb-20 flex items-center justify-center animate-in fade-in duration-500">
                <EcgLoading />
            </div>
        );
    }

    if (step === 5 && result) {
        // Normalize specialist to a slug matching the SPECIALTIES list in the hospitals page
        const normalizeSpecialist = (specialist: string): string => {
            const term = (specialist || '').toLowerCase();
            if (term.includes('cardio')) return 'cardiology';
            if (term.includes('neuro') || term.includes('brain')) return 'neurology';
            if (term.includes('ortho')) return 'orthopedics';
            if (term.includes('derma')) return 'dermatology';
            if (term.includes('onco') || term.includes('cancer')) return 'oncology';
            if (term.includes('pedia')) return 'pediatrics';
            if (term.includes('psych')) return 'psychiatry';
            if (term.includes('ent') || term.includes('ear') || term.includes('nose') || term.includes('throat')) return 'ent';
            if (term.includes('gyne') || term.includes('obste')) return 'gynecology';
            if (term.includes('urol')) return 'urology';
            if (term.includes('gastro')) return 'gastroenterology';
            if (term.includes('ophthal') || term.includes('eye')) return 'ophthalmology';
            if (term.includes('pulmo') || term.includes('respir') || term.includes('lung')) return 'pulmonology';
            if (term.includes('nephro') || term.includes('kidney')) return 'nephrology';
            return term;
        };

        const specialistSlug = normalizeSpecialist(result.result.specialist || '');

        // Map API result to PredictionResults format
        const predictions = [{
            disease: {
                id: 'res_1',
                name: result.result.primary_diagnosis,
                severity: result.result.emergency_alert ? 'critical' : 'medium',
                description: result.result.explanation || "Based on your symptoms, this is the most likely condition.",
                recommendations: result.result.recommendations || ['Consult a specialist immediately for further diagnosis.'],
                home_remedies: result.result.home_remedies || [],
                video_search_query: result.result.video_search_query || '',
                precautions: result.result.precautions || [],
                specialist: result.result.specialist || 'General Practitioner',
                // New Fields
                icd11_code: result.result.icd11_code,
                confidence_rationale: result.result.confidence_rationale,
                differential_diagnoses: result.result.differential_diagnoses,
                red_flags: result.result.red_flags,
                emergency_reason: result.result.emergency_reason,
                specialist_urgency: result.result.specialist_urgency,
                lifestyle_modifications: result.result.lifestyle_modifications,
                follow_up_symptoms: result.result.follow_up_symptoms
            },
            confidence: result.result.confidence,
            matchedSymptoms: selectedSymptoms.map(s => s.id || s.name)
        }].concat(
            (result.result.differential_diagnoses || []).map((diff: any, i: number) => ({
                disease: {
                    id: `diff_${i}`,
                    name: diff.name,
                    severity: 'low',
                    description: diff.distinguishing_factor || 'Alternative possibility.',
                    recommendations: ['Monitor symptoms'],
                    specialist: result.result.specialist || 'General Physician'
                },
                confidence: diff.probability,
                matchedSymptoms: []
            }))
        ).concat(
            // Fallback for legacy alternatives if differential_diagnoses is missing
            (!result.result.differential_diagnoses && result.result.alternatives || []).map((alt: string, i: number) => ({
                disease: {
                    id: `alt_${i}`,
                    name: alt,
                    severity: 'low',
                    description: 'Alternative possibility.',
                    recommendations: ['Monitor symptoms'],
                    specialist: 'General Physician'
                },
                confidence: Math.max(10, result.result.confidence - 20 - (i * 10)),
                matchedSymptoms: []
            }))
        ) as unknown as { disease: Disease; confidence: number; matchedSymptoms: string[] }[];

        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex justify-between items-center mb-6 pt-52">
                        <Button onClick={() => setStep(4)} variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Review Questions
                        </Button>
                        <FlowButton
                            text="New Prediction"
                            onClick={() => window.location.reload()}
                        />
                    </div>

                    <PredictionResults
                        predictions={predictions}
                        onFindHospitals={() => router.push(
                            specialistSlug
                                ? `/hospitals?specialty=${encodeURIComponent(specialistSlug)}`
                                : '/hospitals'
                        )}
                        selectedSymptoms={selectedSymptoms.map(s => s.id || s.name)}
                        severities={severitiesRecord}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-24 pt-52 pb-32">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gradient mb-2">AI Health Assessment System</h1>
                    <p className="text-muted-foreground">Complete the steps below for a detailed analysis</p>

                    {/* Stepper */}
                    <div className="flex justify-center mt-8 gap-2 md:gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center gap-2 flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-medical-blue text-white shadow-glow' : 'bg-white/10 text-muted-foreground'
                                    }`}>
                                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                                </div>
                                <span className={`text-sm hidden md:inline ${step >= s ? 'text-white' : 'text-muted-foreground'}`}>
                                    {s === 1 ? 'Profile' : s === 2 ? 'Symptoms' : s === 3 ? 'Severity' : 'Analysis'}
                                </span>
                                {s < 4 && <div className="w-8 h-[1px] bg-white/10 mx-2 hidden md:block" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: User Details */}
                {step === 1 && (
                    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">

                        {/* Who is this for? */}
                        <div className="flex justify-center mb-8">
                            <LiquidRadio value={predictionSource} onValueChange={handleSourceChange} />
                        </div>

                        <GlassCard className="p-8 pb-24">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <User className="text-medical-blue" />
                                {predictionSource === 'myself' ? 'My Details' : 'Patient Details'}
                            </h3>

                            <div className="grid gap-6">
                                {predictionSource === 'other' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-sm font-medium">Relationship to you</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="e.g. Mother, Son, Friend"
                                                value={relationship}
                                                onChange={(e) => setRelationship(e.target.value)}
                                                className="pl-9 bg-black/20 border-white/10 focus:border-medical-blue"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        placeholder="Enter your name"
                                        value={userDetails.name}
                                        onChange={(e) => handleUserDetailChange('name', e.target.value)}
                                        className="bg-black/20 border-white/10 focus:border-medical-blue"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Age</label>
                                        <Input
                                            type="number"
                                            placeholder="Years"
                                            value={userDetails.age}
                                            onChange={(e) => handleUserDetailChange('age', e.target.value)}
                                            className="bg-black/20 border-white/10 focus:border-medical-blue"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Gender</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-white/10 bg-black/20 text-sm text-white focus:outline-none focus:ring-1 focus:ring-medical-blue"
                                            value={userDetails.gender}
                                            onChange={(e) => handleUserDetailChange('gender', e.target.value)}
                                        >
                                            <option value="" className="bg-gray-900">Select Gender</option>
                                            <option value="Male" className="bg-gray-900">Male</option>
                                            <option value="Female" className="bg-gray-900">Female</option>
                                            <option value="Other" className="bg-gray-900">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9 bg-black/20 border-white/10 focus:border-medical-blue"
                                            placeholder="10-digit mobile number"
                                            value={userDetails.phone}
                                            onChange={(e) => handleUserDetailChange('phone', e.target.value)}
                                            maxLength={10}
                                        />
                                    </div>
                                    {userDetails.phone && userDetails.phone.length !== 10 && (
                                        <p className="text-xs text-destructive">Must be exactly 10 digits</p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        <div className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-transparent">
                            <div className="container mx-auto max-w-6xl flex justify-end">
                                <FlowButton
                                    text="Symptoms"
                                    onClick={handleNextStep1}
                                    disabled={!validateStep1()}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Symptoms Selection */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        {/* Counter and Limit Info */}
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-lg font-bold">Select Symptoms</h3>
                                <p className="text-xs text-muted-foreground">Choose up to 3 symptoms for analysis</p>
                            </div>
                            <div className={`text-sm font-bold px-3 py-1 rounded-full border ${
                                selectedSymptoms.length >= 3 
                                ? 'bg-destructive/10 border-destructive text-destructive' 
                                : 'bg-medical-blue/10 border-medical-blue text-medical-blue'
                            }`}>
                                {selectedSymptoms.length} / 3 Selected
                            </div>
                        </div>

                        {/* Search & Custom Symptom */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search symptoms..."
                                    className="pl-10 bg-black/20 border-white/10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-1">
                                <Input
                                    placeholder="Add custom symptom..."
                                    value={customSymptom}
                                    onChange={(e) => setCustomSymptom(e.target.value)}
                                    className="bg-black/20 border-white/10"
                                    disabled={selectedSymptoms.length >= 3}
                                />
                                <Button 
                                    onClick={addCustomSymptom} 
                                    variant="glass"
                                    disabled={selectedSymptoms.length >= 3 || !customSymptom.trim()}
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Selected Pills */}
                        {selectedSymptoms.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {selectedSymptoms.map((s, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-medical-blue/20 border border-medical-blue/30 text-sm flex items-center gap-2 animate-in zoom-in duration-300">
                                        {s.name}
                                        <button onClick={() => toggleSymptom({ name: s.name } as any)}>
                                            <X className="w-3 h-3 hover:text-white" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
                            <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-medical-blue text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>All</button>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-medical-blue text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>{cat}</button>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredSymptoms.map((symptom) => {
                                const isSelected = selectedSymptoms.some(s => s.name === symptom.name);
                                const isLimitReached = selectedSymptoms.length >= 3 && !isSelected;
                                return (
                                    <button
                                        key={symptom.id}
                                        onClick={() => toggleSymptom(symptom)}
                                        disabled={isLimitReached}
                                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                                            isSelected 
                                            ? 'border-medical-blue bg-medical-blue/20' 
                                            : isLimitReached
                                            ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                                            : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3 relative z-10">
                                            <span className="text-2xl">{symptom.icon}</span>
                                            <div>
                                                <div className="font-semibold text-sm">{symptom.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{symptom.category}</div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
                            <div className="container mx-auto max-w-6xl flex flex-col gap-4">
                                {error && (
                                    <Alert variant="error" className="animate-in slide-in-from-bottom-2">
                                        <AlertIcon className="h-4 w-4" />
                                        <AlertTitle>Selection Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="flex justify-between items-center w-full">
                                    <FlowButton text="Back" onClick={() => setStep(1)} direction="left" />
                                    <FlowButton
                                        text="Severity"
                                        onClick={() => {
                                            if (selectedSymptoms.length < 2) {
                                                setError("Please select at least 2 symptoms to proceed");
                                                return;
                                            }
                                            setStep(3);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Severity Assessment */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <SeverityAssessment
                            selectedSymptoms={selectedSymptoms}
                            severities={severitiesRecord}
                            onSeverityChange={updateSeverity}
                        />

                        {/* Add Missing Symptom */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Missed a symptom? Add it here:</h4>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g. Dizziness"
                                    value={customSymptom}
                                    onChange={(e) => setCustomSymptom(e.target.value)}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-medical-blue transition-colors"
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomSymptom()}
                                />
                                <Button onClick={addCustomSymptom} variant="secondary" className="bg-medical-blue/20 hover:bg-medical-blue/30 text-medical-blue border border-medical-blue/50">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
                            <div className="container mx-auto flex justify-between max-w-6xl">
                                <FlowButton text="Back" onClick={() => setStep(2)} direction="left" />
                                <FlowButton
                                    text="Analysis"
                                    onClick={() => setStep(4)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Questions */}
                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-4">Detailed Analysis</h3>
                            <DynamicQuestionnaire
                                selectedSymptoms={selectedSymptoms.map(s => s.id || s.name)}
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                            />
                        </GlassCard>

                        <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
                            <div className="container mx-auto flex justify-between max-w-6xl">
                                <FlowButton
                                    text="Back"
                                    onClick={() => setStep(3)}
                                    direction="left"
                                />
                                <FlowButton
                                    text="Generate Prediction"
                                    onClick={handlePredict}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
