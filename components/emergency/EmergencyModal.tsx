"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Loader2, Navigation, Phone, CheckCircle2, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import type { NearestHospital } from "@/lib/db/schemas";

// Lazy-load Leaflet map
const EmergencyMap = dynamic(() => import("./EmergencyMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-zinc-900 animate-pulse rounded-xl flex items-center justify-center text-zinc-500 text-sm">Loading Map...</div>
});

interface Props {
    onClose: () => void;
}

type Step = "loading" | "auth" | "form" | "confirm" | "locating" | "active";

export default function EmergencyModal({ onClose }: Props) {
    const [step, setStep] = useState<Step>("loading");

    // User/Location Data
    const [userName, setUserName] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [emergencyType, setEmergencyType] = useState<string>("Other");
    const [customMessage, setCustomMessage] = useState("");
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [hospitals, setHospitals] = useState<NearestHospital[]>([]);

    // UI State
    const [error, setError] = useState("");
    const [canceling, setCanceling] = useState(false);

    // Countdown
    const [countdown, setCountdown] = useState(3);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    // Fetch profile on mount to pre-fill the form
    useEffect(() => {
        const fetchProfile = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            try {
                const profileRes = await fetch("/api/auth/me", { signal: controller.signal });
                clearTimeout(timeoutId);

                if (profileRes.ok) {
                    const data = await profileRes.json();
                    if (data?.user) {
                        setUserName(data.user.name || "");
                        setUserPhone(data.user.phone || "");
                        setStep("form");
                        return;
                    }
                }
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    console.warn("Profile fetch timed out");
                }
            } finally {
                clearTimeout(timeoutId);
            }
            // Not logged in, error, or timeout
            setStep("auth");
        };
        fetchProfile();
    }, []);

    // ─── Step 1: Confirmation Countdown ───
    useEffect(() => {
        if (step !== "confirm") return;

        let count = 3;
        countdownRef.current = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count <= 0) {
                if (countdownRef.current) clearInterval(countdownRef.current);
                executeEmergencySOS();
            }
        }, 1000);

        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const handleCancel = () => {
        setCanceling(true);
        if (countdownRef.current) clearInterval(countdownRef.current);
        setTimeout(onClose, 300); // Wait for exit animation
    };

    // ─── Step 2: Locating & Firing API ───
    const executeEmergencySOS = async () => {
        setStep("locating");
        setError("");

        try {
            // 1. Get Geolocation
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocation is not supported by your browser. Please call 112 directly."));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000
                });
            });

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Fallback address; backend will resolve fully via reverse geocode.
            let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setLocation({ lat, lng, address });

            // Fire Emergency API
            const alertRes = await fetch("/api/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: userName || "Unknown User",
                    phone: userPhone || "N/A",
                    latitude: lat,
                    longitude: lng,
                    address,
                    emergencyType,
                    message: customMessage
                }),
            });

            const alertData = await alertRes.json();

            if (!alertRes.ok) {
                throw new Error(alertData.error || "Failed to alert hospitals.");
            }

            setHospitals(alertData.nearestHospitals || []);
            if (alertData.address) {
                setLocation({ lat, lng, address: alertData.address });
            }
            setStep("active");

        } catch (err: any) {
            // GeolocationPositionError has a `.code` property but may have an empty `.message`
            // Code 1 = PERMISSION_DENIED, Code 2 = POSITION_UNAVAILABLE, Code 3 = TIMEOUT
            let friendlyMessage = "Could not retrieve location or send alert. Please call 112 directly.";

            if (err && typeof err.code === "number") {
                // This is a GeolocationPositionError
                switch (err.code) {
                    case 1:
                        friendlyMessage = "Location access was denied. Please allow location permissions in your browser settings and try again, or call 112 directly.";
                        break;
                    case 2:
                        friendlyMessage = "Your location could not be determined. Please check your GPS/network and try again, or call 112 directly.";
                        break;
                    case 3:
                        friendlyMessage = "Location request timed out. Please try again or call 112 directly.";
                        break;
                }
                console.error(`GeolocationPositionError (code ${err.code}): ${err.message || "(no message)"}`);
            } else {
                console.error("EmergencyModal error:", err?.message || err);
                if (err?.message) friendlyMessage = err.message;
            }

            setError(friendlyMessage);
            // Keep them on the locating screen to read the error
        }
    };

    // ─── Transitions ───
    const slideUp = {
        hidden: { y: "100%", opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
        exit: { y: "100%", opacity: 0, transition: { duration: 0.2 } }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {!canceling && (
                <motion.div
                    initial={{ clipPath: "circle(0% at calc(100% - 3.5rem) calc(100% - 3.5rem))", opacity: 0 }}
                    animate={{ clipPath: "circle(150% at calc(100% - 3.5rem) calc(100% - 3.5rem))", opacity: 1 }}
                    exit={{ clipPath: "circle(0% at calc(100% - 3.5rem) calc(100% - 3.5rem))", opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[10000] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl overflow-hidden"
                    style={{ perspective: 1500 }}
                >
                    {/* Concentric rings pulse outward */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
                        <div className="absolute w-[150vw] h-[150vw] rounded-full border border-red-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <div className="absolute w-[100vw] h-[100vw] rounded-full border border-red-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
                        <div className="absolute w-[50vw] h-[50vw] rounded-full border border-red-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
                    </div>
                    {/* Decorative Blur Blobs */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-red-500/10 blur-[80px] z-0 pointer-events-none" />
                    
                    {/* Animated glow spots */}
                    <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse opacity-40 z-0 pointer-events-none" />
                    <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40 z-0 pointer-events-none" />

                    <motion.div
                        variants={slideUp}
                        className="w-full sm:max-w-md bg-black/40 backdrop-blur-xl border border-white/[0.1] text-white rounded-t-3xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative group/modal"
                        style={{ height: step === "active" ? '90vh' : 'auto', maxHeight: '900px' }}
                    >
                                {/* Subtle inner grid pattern from auth card */}
                                <div className="absolute inset-0 opacity-[0.03]"
                                    style={{
                                        backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                        backgroundSize: '30px 30px'
                                    }}
                                />
                                
                                {/* Light beam effects container */}
                                <div className="absolute -inset-[1px] rounded-3xl overflow-hidden pointer-events-none z-0">
                                    <motion.div
                                        className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"
                                        initial={{ filter: "blur(2px)" }}
                                        animate={{
                                            left: ["-50%", "100%"],
                                            opacity: [0.3, 0.7, 0.3],
                                            filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                        }}
                                        transition={{
                                            left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                                            opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                                        }}
                                    />
                                </div>

                        {/* Red glow effect specific to emergency */}
                        <motion.div
                            className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover/modal:opacity-30 transition-opacity duration-700 pointer-events-none"
                            animate={{
                                boxShadow: [
                                    "0 0 10px 2px rgba(220,38,38,0.1)",
                                    "0 0 20px 5px rgba(220,38,38,0.2)",
                                    "0 0 10px 2px rgba(220,38,38,0.1)"
                                ],
                                opacity: [0.1, 0.3, 0.1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "mirror"
                            }}
                        />

                        {/* ─── STEP -1: LOADING ─── */}
                        {step === "loading" && (
                            <motion.div variants={fadeIn} className="p-12 flex flex-col items-center justify-center space-y-4 relative">
                                <button type="button" onClick={handleCancel} className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors z-50 cursor-pointer">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                                <p className="text-zinc-400 text-sm font-medium animate-pulse">Initializing Secure SOS...</p>
                            </motion.div>
                        )}

                        {/* ─── STEP 0.5: AUTH CHOICE ─── */}
                        {step === "auth" && (
                            <motion.div variants={fadeIn} className="p-8 flex flex-col items-center text-center space-y-6 relative">
                                <button type="button" onClick={handleCancel} className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors z-50 cursor-pointer">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/30">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Emergency Assistance</h2>
                                    <p className="text-zinc-400 text-sm">You are not logged in. Log in for auto-filled details and faster response, or continue immediately as a guest.</p>
                                </div>
                                <div className="w-full space-y-3 pt-2 relative z-50">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setStep("form");
                                        }}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                    >
                                        Directly Enter Details
                                    </button>
                                    <a
                                        href="/auth"
                                        className="flex items-center justify-center w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold transition-colors"
                                    >
                                        Sign In
                                    </a>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── STEP 1: FORM ─── */}
                        {step === "form" && (
                            <motion.div variants={fadeIn} className="p-6 flex flex-col w-full text-left space-y-6">
                                <div className="flex justify-between items-center bg-red-600/10 p-4 rounded-2xl -mx-2 -mt-2 relative z-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                                            <AlertCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight text-red-500">Emergency Details</h2>
                                            <p className="text-xs text-red-400">Verify information before sending</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleCancel} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors relative z-50 cursor-pointer">
                                        <X className="w-5 h-5 text-zinc-400" />
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Patient Name</label>
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/30 focus:bg-white/10"
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Number</label>
                                        <input
                                            type="tel"
                                            value={userPhone}
                                            onChange={(e) => {
                                                const num = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setUserPhone(num);
                                            }}
                                            maxLength={10}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/30 focus:bg-white/10"
                                            placeholder="10-digit emergency contact number"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Emergency Type</label>
                                        <select
                                            value={emergencyType}
                                            onChange={(e) => setEmergencyType(e.target.value as any)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors appearance-none focus:bg-white/10"
                                        >
                                            <option value="Heart Attack" className="bg-zinc-900 text-white">Heart Attack</option>
                                            <option value="Accident / Trauma" className="bg-zinc-900 text-white">Accident / Trauma</option>
                                            <option value="Breathing Problem" className="bg-zinc-900 text-white">Breathing Problem</option>
                                            <option value="Poisoning" className="bg-zinc-900 text-white">Poisoning</option>
                                            <option value="Severe Bleeding" className="bg-zinc-900 text-white">Severe Bleeding</option>
                                            <option value="Severe Pain" className="bg-zinc-900 text-white">Severe Pain</option>
                                            <option value="Other" className="bg-zinc-900 text-white">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Additional Message (Optional)</label>
                                        <textarea
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none custom-scrollbar placeholder:text-white/30 focus:bg-white/10"
                                            placeholder="Any critical details..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 relative z-10">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setStep("confirm");
                                        }}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                    >
                                        Proceed to SOS
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── STEP 1: CONFIRM ─── */}
                        {step === "confirm" && (
                            <motion.div variants={fadeIn} className="p-8 flex flex-col items-center text-center space-y-8">
                                <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                                    <AlertCircle className="w-12 h-12 text-white" />
                                </div>

                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight mb-2">Emergency SOS</h2>
                                    <p className="text-zinc-400">Sending your location and profile to nearby hospitals and emergency contacts in...</p>
                                </div>

                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={countdown} // Force re-render animation each second
                                    transition={{ type: 'spring', damping: 10, mass: 0.5 }}
                                    className="text-[10rem] font-black text-white tabular-nums tracking-tighter relative z-10 leading-none drop-shadow-[0_0_50px_rgba(220,38,38,0.8)]"
                                >
                                    {countdown}
                                </motion.div>

                                <div className="w-full space-y-3 pt-4 relative z-50">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 active:bg-white/20 text-white rounded-2xl font-semibold text-lg transition-colors relative z-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── STEP 2: LOCATING ─── */}
                        {step === "locating" && (
                            <motion.div variants={fadeIn} className="p-8 flex flex-col items-center text-center space-y-6 py-12 relative z-10">
                                <div className="relative w-20 h-20">
                                    <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                                    <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Initiating SOS...</h2>
                                    <p className="text-zinc-400 text-sm">Ping nearest hospitals • Acquire GPS lock • Dispatch alert</p>
                                </div>

                                {error && (
                                    <div className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mt-4">
                                        <p className="font-semibold mb-2">SOS Failed</p>
                                        <p>{error}</p>
                                        <div className="pt-4 flex gap-2 relative z-50">
                                            <a href="tel:112" className="flex-1 flex justify-center py-3 bg-red-600 text-white rounded-lg font-bold items-center">Call 112</a>
                                            <button type="button" onClick={handleCancel} className="flex-1 py-3 bg-zinc-800 text-white rounded-lg font-bold relative z-50 cursor-pointer">Dismiss</button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ─── STEP 3: ACTIVE ─── */}
                        {step === "active" && (
                            <motion.div variants={fadeIn} className="flex flex-col h-full">
                                {/* Header */}
                                <div className="bg-black/20 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-sm relative z-50">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        <div>
                                            <h2 className="font-bold text-white leading-tight">SOS Sent</h2>
                                            <p className="text-xs text-green-400">Emergency units notified</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleCancel} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors relative z-50 cursor-pointer">
                                        <X className="w-5 h-5 text-zinc-400" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative z-10">
                                    {/* Patient Info */}
                                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center opacity-70">
                                            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Transmitted Info</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                                            <div>
                                                <p className="text-zinc-500 text-xs mb-1">Name</p>
                                                <p className="font-medium text-white">{userName}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500 text-xs mb-1">Phone</p>
                                                <p className="font-medium text-white">{userPhone}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-zinc-500 text-xs mb-1">Emergency Type</p>
                                                <p className="font-semibold text-red-400">{emergencyType}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-zinc-500 text-xs mb-1">Location</p>
                                                <p className="font-medium text-white leading-snug">{location?.address}</p>
                                            </div>
                                            {customMessage && (
                                                <div className="col-span-2">
                                                    <p className="text-zinc-500 text-xs mb-1">Message</p>
                                                    <p className="font-medium text-white italic">"{customMessage}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Map Fly-in */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Nearby Response</h3>
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                                            className="h-48 w-full rounded-2xl overflow-hidden border border-zinc-500/30 shadow-[0_0_20px_rgba(220,38,38,0.2)] relative z-0"
                                        >
                                            {/* Particle simulation layer over map */}
                                            <div className="absolute inset-0 pointer-events-none z-10 custom-particles opacity-30 bg-[url('/noise.png')]" />

                                            {location && (
                                                <EmergencyMap
                                                    userLat={location.lat}
                                                    userLng={location.lng}
                                                    hospitals={hospitals}
                                                />
                                            )}
                                        </motion.div>
                                    </div>

                                    {/* Nearest Hospitals List */}
                                    <div className="space-y-3 pb-6 relative z-10">
                                        {hospitals.map((h, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 60, y: 60 }}
                                                animate={{ opacity: 1, x: 0, y: 0 }}
                                                transition={{ type: 'spring', damping: 18, delay: 0.3 + (i * 0.15) }}
                                                key={i} 
                                                className="bg-black/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 relative overflow-hidden group/card"
                                            >
                                                {/* Light beam on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-[150%] group-hover/card:translate-x-[150%] transition-transform duration-700 ease-in-out" />

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white truncate text-base">{h.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-zinc-400 text-xs">
                                                        <Navigation className="w-3 h-3 text-red-400" />
                                                        <span>{h.distanceKm.toFixed(1)} km</span>
                                                        <span>•</span>
                                                        <span>~{h.etaMinutes} min</span>
                                                    </div>
                                                </div>
                                                {h.phone && h.phone !== "N/A" && (
                                                    <a href={`tel:${h.phone}`} className="shrink-0 w-10 h-10 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center transition-colors">
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </motion.div>
                                        ))}
                                        {hospitals.length === 0 && (
                                            <div className="text-center p-4 text-zinc-400 text-sm bg-black/30 border border-white/5 rounded-2xl">
                                                No hospitals found in immediate vicinity. Emergency operators will route the nearest available unit.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
