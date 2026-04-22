'use client';
import React, { useState } from 'react';
import Image from 'next/image'; // For background images
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from 'lucide-react';
import { cn } from "@/lib/utils";

// Custom Input using the provided style
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-white", // Added text-white for visibility
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

interface ModernAuthCardProps {
    isLogin: boolean;
    setIsLogin: (value: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
}

export function ModernAuthCard({ isLogin, setIsLogin, formData, setFormData, onSubmit, loading, error }: ModernAuthCardProps) {
    const [showPassword, setShowPassword] = useState(false);
    // Focus state
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // For 3D card effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center pt-24 pb-8">
            {/* Dynamic Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={isLogin ? "/auth/login.png" : "/auth/sign.png"}
                    alt="Background"
                    fill
                    className="object-cover opacity-60"
                    quality={100}
                    priority
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" /> {/* Overlay for better text contrast */}
            </div>

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light z-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Decorative Blur Blobs */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/10 blur-[80px] z-0 pointer-events-none" />

            {/* Animated glow spots */}
            <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-medical-blue/10 rounded-full blur-[100px] animate-pulse opacity-40 z-0 pointer-events-none" />
            <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-medical-purple/10 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40 z-0 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10 px-4"
                style={{ perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={{ rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ z: 10 }}
                >
                    <div className="relative group">
                        {/* Card glow effect */}
                        <motion.div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    "0 0 10px 2px rgba(255,255,255,0.03)",
                                    "0 0 15px 5px rgba(255,255,255,0.05)",
                                    "0 0 10px 2px rgba(255,255,255,0.03)"
                                ],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "mirror"
                            }}
                        />

                        {/* Light beam effects container */}
                        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                            {/* Top light beam */}
                            <motion.div
                                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
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

                        {/* Glass card background */}
                        <div className="relative bg-black/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl overflow-hidden">
                            {/* Subtle card inner patterns */}
                            <div className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                    backgroundSize: '30px 30px'
                                }}
                            />

                            {/* Logo and header */}
                            <div className="text-center space-y-1 mb-6">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden mb-3"
                                >
                                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                                    {/* Inner lighting effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70"
                                >
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-sm"
                                >
                                    {isLogin ? 'Sign in to access your dashboard' : 'Join Medicare AI today'}
                                </motion.p>
                            </div>

                            {/* Login form */}
                            <form onSubmit={onSubmit} className="space-y-4 relative z-10">
                                <motion.div className="space-y-4">

                                    {/* Full Name Input (Signup Only) */}
                                    <AnimatePresence>
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`relative ${focusedInput === "name" ? 'z-10' : ''}`}
                                            >
                                                <div className="relative flex items-center overflow-hidden rounded-lg group/input">
                                                    <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "name" ? 'text-white' : 'text-white/40'
                                                        }`} />

                                                    <Input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        onFocus={() => setFocusedInput("name")}
                                                        onBlur={() => setFocusedInput(null)}
                                                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-11 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                                        required={!isLogin}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Phone input (Signup Only) */}
                                    <AnimatePresence>
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`relative ${focusedInput === "phone" ? 'z-10' : ''}`}
                                            >
                                                <div className="relative flex items-center overflow-hidden rounded-lg group/input">
                                                    <Phone className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "phone" ? 'text-white' : 'text-white/40'
                                                        }`} />

                                                    <Input
                                                        type="tel"
                                                        placeholder="Phone Number (10 digits)"
                                                        value={formData.phone || ''}
                                                        onChange={(e) => {
                                                            const num = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                            setFormData({ ...formData, phone: num })
                                                        }}
                                                        onFocus={() => setFocusedInput("phone")}
                                                        onBlur={() => setFocusedInput(null)}
                                                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-11 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                                        required={!isLogin}
                                                        maxLength={10}
                                                        minLength={10}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Email input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.01 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg group/input">
                                            <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'
                                                }`} />

                                            <Input
                                                type="email"
                                                placeholder="Email address"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                onFocus={() => setFocusedInput("email")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-11 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Password input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.01 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg group/input">
                                            <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'
                                                }`} />

                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                onFocus={() => setFocusedInput("password")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-11 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                                required
                                            />

                                            {/* Toggle password visibility */}
                                            <div
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 cursor-pointer p-1"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Password Strength Indicator (Signup Only) */}
                                {!isLogin && formData.password.length > 0 && (
                                    <div className="flex gap-1 h-1 mt-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full transition-colors duration-300 ${formData.password.length >= i * 2
                                                    ? formData.password.length >= 8 ? 'bg-green-500' : 'bg-yellow-500'
                                                    : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Sign in button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group/button mt-4"
                                >
                                    {/* Button glow effect */}
                                    <div className="absolute inset-0 bg-white/20 rounded-lg blur-lg opacity-0 group-hover/button:opacity-50 transition-opacity duration-300" />

                                    <div className="relative overflow-hidden bg-white text-black font-semibold h-11 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="w-5 h-5 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="button-text"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center gap-2"
                                                >
                                                    {isLogin ? 'Sign In' : 'Create Account'}
                                                    <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.button>

                                <div className="relative my-4 flex items-center">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="mx-3 text-xs text-white/40">or</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                {/* Google Sign In */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    className="w-full relative group/google"
                                >
                                    <div className="absolute inset-0 bg-white/5 rounded-lg blur opacity-0 group-hover/google:opacity-70 transition-opacity duration-300" />

                                    <div className="relative overflow-hidden bg-white/5 text-white font-medium h-10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 flex items-center justify-center text-white/80 group-hover/google:text-white transition-colors duration-300">G</div>

                                        <span className="text-white/80 group-hover/google:text-white transition-colors text-xs">
                                            Sign in with Google
                                        </span>

                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{
                                                duration: 1,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </div>
                                </motion.button>

                                {/* Sign up link */}
                                <motion.div
                                    className="text-center text-sm text-white/60"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => { setIsLogin(!isLogin); setFormData({ ...formData, name: '' }); }} // Clear name on toggle
                                        className="relative inline-block group/signup hover:text-white transition-colors"
                                    >
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                        <span className="font-semibold text-white underline decoration-white/30 underline-offset-4 group-hover/signup:decoration-white transition-all">
                                            {isLogin ? "Sign up" : "Sign in"}
                                        </span>
                                    </button>
                                </motion.div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
