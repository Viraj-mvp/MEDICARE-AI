import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, AlertTriangle, ChevronRight, MapPin, Phone, Star, ArrowRight, Navigation2 } from 'lucide-react';
import { symptoms } from '@/data/symptoms';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ConfidenceArc } from '@/components/predict/ConfidenceArc';
import { FeedbackBar } from '@/components/predict/FeedbackBar';

export interface Disease {
    id: string;
    name: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendations: string[];
    home_remedies?: string[];
    video_search_query?: string;
    precautions?: string[];
    specialist: string;
    visual_aid_keyword?: string;
    useful_links?: { title: string; url: string }[];
    // Extended fields
    icd11_code?: string;
    confidence_rationale?: string;
    differential_diagnoses?: {
        name: string;
        probability: number;
        distinguishing_factor: string;
    }[];
    red_flags?: string[];
    emergency_reason?: string | null;
    specialist_urgency?: string;
    lifestyle_modifications?: string[];
    follow_up_symptoms?: string[];
}

export interface PubMedArticle {
    pmid: string;
    title: string;
    authors: string;
    journal: string;
    year: string;
    url: string;
}

interface Hospital {
    _id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    rating?: number;
    specialty?: string[];
    coordinates: { lat: number; lng: number };
}

interface PredictionResultsProps {
    predictions: { disease: Disease; confidence: number; matchedSymptoms: string[] }[];
    onFindHospitals: () => void;
    selectedSymptoms: string[]; // IDs
    severities: Record<string, number>;
}

export const PredictionResults = ({
    predictions,
    onFindHospitals,
    selectedSymptoms,
    severities,
}: PredictionResultsProps) => {
    const router = useRouter();
    const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [specialistSlug, setSpecialistSlug] = useState('');
    const [videos, setVideos] = useState<any[]>([]);
    const [evidence, setEvidence] = useState<PubMedArticle[]>([]);
    const [displayedName, setDisplayedName] = useState('');
    const [activeTab, setActiveTab] = useState<'diagnosis' | 'remedies' | 'evidence'>('diagnosis');

    const containerVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.2 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
    };

    // Normalize specialist name to a URL-friendly slug matching our SPECIALTIES list
    const normalizeSpecialist = (specialist: string): string => {
        const term = specialist.toLowerCase();
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
        return term; // fallback
    };

    useEffect(() => {
        const firstPrediction = predictions[0];
        if (firstPrediction) {
            const disease = firstPrediction.disease;
            
            const specialist = disease.specialist;
            const slug = normalizeSpecialist(specialist);
            setSpecialistSlug(slug);
            fetchRecommendedHospitals(slug);

            const query = disease.video_search_query;
            if (query) {
                fetch(`/api/youtube?q=${encodeURIComponent(query)}`)
                    .then(r => r.json())
                    .then(d => setVideos(d.videos || []))
                    .catch(err => console.error("Error fetching videos:", err));
            }

            if (disease.name) {
                // Typewriter effect
                let i = 0;
                setDisplayedName('');
                const timer = setInterval(() => {
                    setDisplayedName(disease.name.slice(0, i + 1));
                    i++;
                    if (i >= disease.name.length) clearInterval(timer);
                }, 40);

                fetch(`/api/medical-evidence?diagnosis=${encodeURIComponent(disease.name)}`)
                    .then(r => r.json())
                    .then(d => setEvidence(d.articles ?? []))
                    .catch(err => console.error("Error fetching evidence:", err));
                    
                return () => clearInterval(timer);
            }
        }
    }, [predictions]);

    const fetchRecommendedHospitals = async (specialty: string) => {
        setLoadingHospitals(true);
        try {
            let lat = '', lng = '';
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                    );
                    lat = pos.coords.latitude.toString();
                    lng = pos.coords.longitude.toString();
                    setLocationEnabled(true);
                } catch (e) { setLocationEnabled(false); }
            }

            const query = new URLSearchParams({ specialty, limit: '3' });
            if (lat && lng) {
                query.append('lat', lat);
                query.append('lng', lng);
                query.append('radius', '50');
            }

            const res = await fetch(`/api/hospitals?${query.toString()}`);
            const data = await res.json();
            if (data.hospitals) setNearbyHospitals(data.hospitals);
        } catch (error) {
            console.error('Failed to fetch hospitals', error);
        } finally {
            setLoadingHospitals(false);
        }
    };

    const getConfidenceColor = (confidence: number): string => {
        if (confidence >= 70) return 'from-emerald-500 to-teal-400';
        if (confidence >= 50) return 'from-yellow-500 to-amber-400';
        return 'from-red-500 to-orange-400';
    };

    const getSeverityLabel = (level: string): { bg: string; text: string } => {
        switch (level) {
            case 'critical': return { bg: 'bg-red-500/20', text: 'text-red-500' };
            case 'high': return { bg: 'bg-orange-500/20', text: 'text-orange-500' };
            case 'medium': return { bg: 'bg-yellow-500/20', text: 'text-yellow-500' };
            default: return { bg: 'bg-emerald-500/20', text: 'text-emerald-500' };
        }
    };

    const generatePDF = async (): Promise<Blob | null> => {
        try {
            // 1. First, attempt to fetch the passport data for authenticated users
            let passportData: any = null;
            try {
                const res = await fetch('/api/user/passport');
                if (res.ok) {
                    const data = await res.json();
                    if (data.passport) {
                        passportData = data.passport;
                    }
                }
            } catch (e) {
                console.error("Could not fetch passport details from API, generating local override.", e);
            }

            // 2. Fallback for guests / unauthenticated users
            if (!passportData) {
                passportData = {
                    patientName: "Guest Patient",
                    age: "N/A",
                    bloodGroup: 'Not Specified',
                    currentMedications: [],
                    recentDiagnoses: predictions.map(p => ({
                        date: new Date().toISOString(),
                        diagnosis: p.disease.name,
                        confidence: p.confidence,
                        specialist: p.disease.specialist,
                        symptoms: p.matchedSymptoms.map((s) => symptoms.find(sym => sym.id === s)?.name || s)
                    })),
                    generatedAt: new Date().toISOString()
                };
            }

            // 3. Dynamically import jsPDF
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            // --- HEADER ---
            doc.setFillColor(15, 23, 42); // Slate 900 bg
            doc.rect(0, 0, 210, 45, 'F');
            
            doc.setTextColor(255, 255, 255); // White text
            doc.setFontSize(24);
            doc.text('HEALTH PASSPORT', 20, 25);
            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184); // Slate 400
            doc.text('Medicare AI Official Record', 20, 33);

            // --- DYNAMIC QR CODE ---
            // Fetch and attach QR code linking to History page so doctors can scan for full timeline
            try {
                const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(window.location.origin + "/dashboard");
                const qrRes = await fetch(qrUrl);
                const qrBlob = await qrRes.blob();
                const qrDataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(qrBlob);
                });
                // Place QR code in top right corner
                doc.addImage(qrDataUrl, 'PNG', 165, 7, 30, 30);
            } catch(e) { console.error("QR Code rendering failed", e); }

            // --- PATIENT PROFILE ---
            doc.setTextColor(15, 23, 42); // Slate 900
            doc.setFontSize(16);
            doc.text('Patient Profile', 20, 60);
            
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.line(20, 63, 190, 63);
            
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105); // Slate 600
            
            const profileY = 75;
            doc.setFont("helvetica", "bold");
            doc.text('Name:', 20, profileY);
            doc.setFont("helvetica", "normal");
            doc.text(`${passportData.patientName}`, 40, profileY);
            
            doc.setFont("helvetica", "bold");
            doc.text('Age:', 20, profileY + 10);
            doc.setFont("helvetica", "normal");
            doc.text(`${passportData.age}`, 40, profileY + 10);

            doc.setFont("helvetica", "bold");
            doc.text('Blood Grp:', 100, profileY);
            doc.setFont("helvetica", "normal");
            doc.text(`${passportData.bloodGroup}`, 125, profileY);

            doc.setFont("helvetica", "bold");
            doc.text('Meds:', 100, profileY + 10);
            doc.setFont("helvetica", "normal");
            const meds = (passportData.currentMedications && passportData.currentMedications.length > 0) 
                 ? passportData.currentMedications.join(', ') 
                 : 'None Reported';
            const medLines = doc.splitTextToSize(meds, 65);
            doc.text(medLines, 125, profileY + 10);

            // --- DIAGNOSES TIMELINE ---
            const shiftY = medLines.length > 1 ? (medLines.length - 1) * 5 : 0;
            const historyY = 100 + shiftY;

            doc.setTextColor(15, 23, 42);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text('Diagnostic Timeline', 20, historyY);
            
            doc.setDrawColor(226, 232, 240);
            doc.line(20, historyY + 3, 190, historyY + 3);

            let yPos = historyY + 15;
            
            if (passportData.recentDiagnoses && passportData.recentDiagnoses.length > 0) {
                passportData.recentDiagnoses.forEach((diag: any) => {
                    if (yPos > 250) {
                        doc.addPage();
                        yPos = 30;
                    }

                    // Card Background
                    doc.setFillColor(248, 250, 252); // Slate 50
                    doc.roundedRect(20, yPos - 5, 170, 35, 3, 3, 'F');
                    doc.setDrawColor(203, 213, 225); // Slate 300
                    doc.roundedRect(20, yPos - 5, 170, 35, 3, 3, 'S');

                    const dDate = new Date(diag.date).toLocaleDateString();
                    
                    doc.setFontSize(12);
                    doc.setTextColor(220, 38, 38); // Red 600 for condition string
                    doc.setFont("helvetica", "bold");
                    doc.text(diag.diagnosis, 25, yPos + 3);
                    
                    doc.setFontSize(10);
                    doc.setTextColor(100, 116, 139); // Slate 500
                    doc.setFont("helvetica", "normal");
                    doc.text(`Date: ${dDate}`, 150, yPos + 3);

                    const sympTrimmed = diag.symptoms?.join(', ') || 'N/A';
                    doc.text(`Symptoms: ${sympTrimmed}`, 25, yPos + 12);
                    
                    doc.setTextColor(37, 99, 235); // Blue 600
                    doc.text(`Suggested Specialist: ${diag.specialist} (AI Confidence: ${diag.confidence}%)`, 25, yPos + 21);

                    yPos += 45;
                });
            } else {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(100, 116, 139);
                doc.text("No previous diagnostic history on record.", 20, yPos);
            }

            // --- FOOTER & DISCLAIMER ---
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(passportData.disclaimer || 'DISCLAIMER: This report is AI-generated. Not a substitute for professional medical advice.', 105, 285, { align: 'center' });
            
            const timestamp = new Date(passportData.generatedAt).toLocaleString();
            doc.text(`Generated securely at ${timestamp}`, 105, 290, { align: 'center' });

            return doc.output('blob');
        } catch (error) {
            console.error("Health Passport PDF Generation Exception", error);
            return null;
        }
    };

    const handleDownloadReport = async () => {
        const blob = await generatePDF();
        if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `medicare-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleShareWhatsApp = async () => {
        const topPrediction = predictions[0];
        if (!topPrediction) return;
        
        const blob = await generatePDF();

        if (blob) {
            const file = new File([blob], `Medicare-Report.pdf`, { type: 'application/pdf' });

            // Try native sharing first (Mobile)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Medicare Health Report',
                        text: `Here is my health assessment report for ${topPrediction.disease.name}.`
                    });
                    return;
                } catch (err) {
                    console.log('Share failed or cancelled', err);
                }
            }

            // Fallback: Download file AND open WhatsApp
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `medicare-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Give a small delay before opening WhatsApp to ensure download starts
            setTimeout(() => {
                const message = encodeURIComponent(
                    `🏥 Medicare Health Assessment\n\n` +
                    `Primary Assessment: ${topPrediction.disease.name}\n` +
                    `Confidence: ${topPrediction.confidence}%\n\n` +
                    `*Attached is the detailed PDF report.*`
                );
                window.open(`https://wa.me/?text=${message}`, '_blank');
                alert("PDF Report downloaded! \n\nPlease attach the downloaded file to the WhatsApp chat.");
            }, 500);
            return;
        }

        // If blob generation failed completely
        alert("Could not generate report to share.");
    };

    if (predictions.length === 0 || !predictions[0]) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground">
                    We couldn't find any conditions matching your symptoms.
                    Please consult a healthcare provider for proper diagnosis.
                </p>
            </div>
        );
    }

    const topPrediction = predictions[0];
    const differentialDiagnoses = predictions.slice(1);

    return (
        <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="space-y-8"
        >
            {/* Primary Prediction */}
            <motion.div variants={itemVariants} className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden shadow-2xl">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />

                <div className="relative">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Primary Assessment</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityLabel(topPrediction.disease.severity).bg} ${getSeverityLabel(topPrediction.disease.severity).text} border-opacity-20`}>
                                    {topPrediction.disease.severity.toUpperCase()} PRIORITY
                                </span>
                            </div>

                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-4 min-h-[40px]">
                                {displayedName}
                                {topPrediction.disease.icd11_code && topPrediction.disease.icd11_code !== 'Unknown' && (
                                    <span className="ml-3 text-xs font-mono text-blue-400/60 border border-blue-400/20 px-2 py-0.5 rounded align-middle">
                                        ICD-11: {topPrediction.disease.icd11_code}
                                    </span>
                                )}
                                <motion.span initial={{opacity:0}} animate={{opacity:1}} transition={{repeat: Infinity, duration: 0.8}} className="text-white/50 ml-1">|</motion.span>
                            </h2>
                            <motion.p variants={itemVariants} className="text-lg text-gray-300 leading-relaxed border-l-4 border-blue-500/50 pl-4 mt-4">
                                {topPrediction.disease.description}
                            </motion.p>
                            {topPrediction.disease.confidence_rationale && (
                                <p className="mt-2 text-xs text-muted-foreground italic pl-5">
                                    Rationale: {topPrediction.disease.confidence_rationale}
                                </p>
                            )}
                        </div>
                        <div className="flex-shrink-0 self-center md:self-auto pt-4 md:pt-0">
                            <ConfidenceArc confidence={topPrediction.confidence} />
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <motion.div variants={itemVariants} className="flex bg-white/5 p-1 rounded-xl mb-6 w-full md:w-fit overflow-x-auto smooth-scrollbar">
                        {['diagnosis', 'remedies', 'evidence'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab 
                                        ? 'bg-medical-blue text-white shadow-lg' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[300px]"
                        >
                            {activeTab === 'diagnosis' && (
                                <div className="space-y-8">
                                    {/* Matched Symptoms */}
                                    <div className="mb-8">
                                        <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                            Matched Symptoms
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {topPrediction.matchedSymptoms.map((symptomId, idx) => {
                                                const symptom = symptoms.find(s => s.id === symptomId) || { name: symptomId, icon: '🔍' };
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-2"
                                                    >
                                                        <span>{symptom.icon}</span>
                                                        {symptom.name}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Clinical Explanation */}
                                        <div className="p-5 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                                Recommendations
                                            </h4>
                                            <ul className="space-y-3">
                                                {topPrediction.disease.recommendations.map((rec, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <ChevronRight className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                                        <span className="text-gray-300 text-sm">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Specialist & Action */}
                                        <div className="p-5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold mb-2 text-white flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                    Consult with
                                                </h4>
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-xl font-bold text-white">{topPrediction.disease.specialist}</p>
                                                    {topPrediction.disease.specialist_urgency && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                            topPrediction.disease.specialist_urgency === 'immediate' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                            topPrediction.disease.specialist_urgency === 'within_48h' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                        }`}>
                                                            {topPrediction.disease.specialist_urgency.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={onFindHospitals}
                                                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                Find Nearby Specialists
                                            </button>
                                        </div>
                                    </div>

                                    {/* Red Flags & Safety */}
                                    {(topPrediction.disease.red_flags && topPrediction.disease.red_flags.length > 0) && (
                                        <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
                                            <h4 className="font-semibold mb-4 text-red-400 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Emergency Red Flags
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {topPrediction.disease.red_flags.map((flag, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-sm text-red-200/70 bg-red-500/10 px-3 py-2 rounded-lg">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                                        {flag}
                                                    </div>
                                                ))}
                                            </div>
                                            {topPrediction.disease.emergency_reason && (
                                                <p className="mt-4 text-xs text-red-300 italic bg-red-500/10 p-3 rounded-lg border border-red-500/10">
                                                    Reason: {topPrediction.disease.emergency_reason}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Lifestyle & Follow-up */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {topPrediction.disease.lifestyle_modifications && topPrediction.disease.lifestyle_modifications.length > 0 && (
                                            <div className="p-5 rounded-xl bg-white/5 border border-white/5">
                                                <h4 className="font-semibold mb-4 text-white flex items-center gap-2 text-sm">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                    Lifestyle Modifications
                                                </h4>
                                                <ul className="space-y-2">
                                                    {topPrediction.disease.lifestyle_modifications.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs text-gray-400">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {topPrediction.disease.follow_up_symptoms && topPrediction.disease.follow_up_symptoms.length > 0 && (
                                            <div className="p-5 rounded-xl bg-white/5 border border-white/5">
                                                <h4 className="font-semibold mb-4 text-white flex items-center gap-2 text-sm">
                                                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                                    Follow-up Symptoms
                                                </h4>
                                                <ul className="space-y-2">
                                                    {topPrediction.disease.follow_up_symptoms.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs text-gray-400">
                                                            <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'remedies' && (
                                <div className="space-y-8">
                                    {/* Home Remedies + Precautions Section */}
                                    {topPrediction.disease.home_remedies && topPrediction.disease.home_remedies.length > 0 ? (
                                        <div className="mb-8 rounded-xl overflow-hidden border border-orange-500/20">
                                            {/* Home Remedies */}
                                            <div className="p-5 bg-orange-500/10">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold mb-4 text-orange-400 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                                                            🌿 Home Remedies
                                                        </h4>
                                                        <ul className="space-y-2.5">
                                                            {topPrediction.disease.home_remedies.map((remedy, i) => (
                                                                <li key={i} className="flex items-start gap-3">
                                                                    <ChevronRight className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                                                                    <span className="text-gray-300 text-sm">{remedy}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    {topPrediction.disease.video_search_query && videos.length === 0 && (
                                                        <div className="flex-shrink-0 w-full md:w-auto">
                                                            <button
                                                                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topPrediction.disease.video_search_query || '')}`, '_blank')}
                                                                className="w-full md:w-auto py-3 px-6 rounded-lg bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-5 h-5 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                                </svg>
                                                                Watch on YouTube
                                                            </button>
                                                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                                                "{topPrediction.disease.video_search_query}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                {topPrediction.disease.video_search_query && videos.length > 0 && (
                                                    <div className="mt-6 w-full border-t border-orange-500/10 pt-4">
                                                        <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                                                            <svg className="w-5 h-5 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                            </svg>
                                                            Helpful Videos
                                                        </h4>
                                                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x smooth-scrollbar">
                                                            {videos.map((vid: any) => (
                                                                <div key={vid.id} className="min-w-[280px] md:min-w-[320px] rounded-xl overflow-hidden border border-white/10 bg-black/40 snap-start shrink-0">
                                                                    <iframe 
                                                                        className="w-full aspect-video"
                                                                        src={vid.embedUrl}
                                                                        title={vid.title}
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                    ></iframe>
                                                                    <div className="p-3">
                                                                        <p className="text-sm text-white font-medium line-clamp-2" title={vid.title}>{vid.title}</p>
                                                                        <p className="text-xs text-gray-400 mt-1">{vid.channel}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Precautions */}
                                            {topPrediction.disease.precautions && topPrediction.disease.precautions.length > 0 && (
                                                <div className="px-5 py-4 bg-yellow-500/5 border-t border-orange-500/10">
                                                    <h4 className="font-semibold mb-3 text-yellow-400 flex items-center gap-2 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                                        ⚠️ Precautions
                                                    </h4>
                                                    <ul className="space-y-1.5">
                                                        {topPrediction.disease.precautions.map((p, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-xs text-yellow-200/70">
                                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-400 flex-shrink-0" />
                                                                {p}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 text-gray-400 bg-white/5 rounded-xl border border-white/5">
                                            No specific home remedies available for this condition. Please follow medical advice.
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'evidence' && (
                                <div className="space-y-8">
                                    {/* Clinical Evidence from PubMed */}
                                    {evidence.length > 0 ? (
                                        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
                                            <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                            Clinical Evidence (PubMed)
                                            </h4>
                                            <div className="space-y-3">
                                                {evidence.map(a => (
                                                <a
                                                    key={a.pmid}
                                                    href={a.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all text-sm group"
                                                >
                                                    <div className="text-blue-400 group-hover:text-blue-300 font-medium leading-snug mb-1">
                                                        [{a.year}] {a.title}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center justify-between">
                                                        <span className="truncate mr-4">{a.authors}</span>
                                                        <span className="italic shrink-0">{a.journal}</span>
                                                    </div>
                                                </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 text-gray-400 bg-white/5 rounded-xl border border-white/5">
                                            No recent clinical evidence found on PubMed for this specific terminology.
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <FeedbackBar 
                        diseaseName={topPrediction.disease.name} 
                        predictionId={`pred-${topPrediction.disease.id}-${Date.now()}`}
                    />
                </div>
            </motion.div>

            {/* Differential Diagnosis */}
            {differentialDiagnoses.length > 0 && (
                <motion.div variants={itemVariants}>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        Other Possibilities
                    </h3>

                    <div className="grid gap-3">
                        {differentialDiagnoses.map((prediction, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-white group-hover:text-blue-300 transition-colors">{prediction.disease.name}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityLabel(prediction.disease.severity).bg} ${getSeverityLabel(prediction.disease.severity).text}`}>
                                            {prediction.disease.severity}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 max-w-xs">
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${prediction.confidence}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(prediction.confidence)}`}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {prediction.confidence}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recommended Hospitals */}
            {(loadingHospitals || nearbyHospitals.length > 0) && (
                <motion.div variants={itemVariants}>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            Recommended Hospitals
                            {/* Location badge */}
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${locationEnabled
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}>
                                {locationEnabled ? '📍 Near You' : '⭐ Most Popular'}
                            </span>
                        </h3>
                        {/* View All redirect */}
                        {specialistSlug && (
                            <button
                                onClick={() => router.push(`/hospitals?specialty=${encodeURIComponent(specialistSlug)}`)}
                                className="flex items-center gap-1.5 text-sm text-medical-blue hover:text-blue-300 transition-colors font-medium group"
                            >
                                View All
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>

                    {/* Skeleton loader */}
                    {loadingHospitals ? (
                        <div className="grid md:grid-cols-3 gap-5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 animate-pulse space-y-3">
                                    <div className="h-5 bg-white/10 rounded w-3/4" />
                                    <div className="h-3 bg-white/10 rounded w-full" />
                                    <div className="h-3 bg-white/10 rounded w-1/2" />
                                    <div className="flex gap-2 mt-4">
                                        <div className="h-8 bg-white/10 rounded flex-1" />
                                        <div className="h-8 bg-blue-600/20 rounded flex-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-5">
                            {nearbyHospitals.map((hospital, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group relative overflow-hidden">
                                    {/* Subtle glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <h4 className="font-bold text-base text-white mb-1 truncate relative" title={hospital.name}>
                                        {hospital.name}
                                    </h4>

                                    {/* Specialties chips */}
                                    {hospital.specialty && hospital.specialty.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {hospital.specialty.slice(0, 2).map((sp: string, si: number) => (
                                                <span key={si} className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                                    {sp}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-1.5 text-sm text-gray-400 mb-4 relative">
                                        <p className="flex items-start gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2 text-xs">{hospital.address}, {hospital.city}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                            <span className="text-xs">{hospital.phone}</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 relative">
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-white/10 hover:bg-white/20 text-xs h-8"
                                            onClick={() => window.open(`tel:${hospital.phone}`, '_self')}
                                        >
                                            <Phone className="w-3 h-3 mr-1" /> Call
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`, '_blank')}
                                        >
                                            <Navigation2 className="w-3 h-3 mr-1" /> Directions
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA to see all hospitals for this specialty */}
                    {!loadingHospitals && specialistSlug && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => router.push(`/hospitals?specialty=${encodeURIComponent(specialistSlug)}`)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-medical-blue/30 transition-all text-sm text-white/70 hover:text-white group"
                            >
                                <span>View all {specialistSlug.charAt(0).toUpperCase() + specialistSlug.slice(1)} hospitals</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-medical-blue" />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                <button
                    onClick={handleDownloadReport}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-medium text-gray-300 hover:text-white"
                >
                    <Download className="w-5 h-5 text-blue-400" />
                    Download Report
                </button>
                <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-medium text-gray-300 hover:text-white"
                >
                    <Share2 className="w-5 h-5 text-green-400" />
                    Share on WhatsApp
                </button>
            </motion.div>

            {/* Disclaimer */}
            <motion.div variants={itemVariants} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-yellow-500 mb-1">Medical Disclaimer</h4>
                    <p className="text-sm text-yellow-200/70">
                        This assessment is AI-generated and for informational purposes only. It is not a substitute for professional medical diagnosis or treatment.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
