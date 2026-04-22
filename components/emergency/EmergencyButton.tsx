"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import EmergencyModal from "./EmergencyModal";



export default function EmergencyButton() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Hide button on developer/admin routes to avoid UI clutter
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/developer")) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9990]">
            <motion.button
                id="emergency-button"
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open Emergency Assistance"
                className="relative w-16 h-16 rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.5)] group"
            >
                {/* Heartbeat ping ring 1 */}
                <span className="absolute inset-0 rounded-full bg-[#ff3b30] animate-ping opacity-30" style={{ animationDuration: '2s' }} />
                {/* Heartbeat ping ring 2 */}
                <span className="absolute inset-0 rounded-full bg-[#ff3b30] animate-ping opacity-20" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 relative z-10"
                >
                    <path d="M12 5v14M5 12h14" />
                </svg>

                <span className="absolute right-[110%] mr-2 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md text-white/90 text-[13px] font-medium px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-white/10 shadow-xl">
                    Emergency SOS
                </span>
            </motion.button>

            {/* Modal — only rendered when open */}
            <AnimatePresence>
                {open && <EmergencyModal onClose={() => setOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}
