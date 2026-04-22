import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/mini-navbar";
import { ClientFooter } from "@/components/layout/ClientFooter";
import EmergencyButton from "@/components/emergency/EmergencyButton";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { LoadingOrbit } from "@/components/effects/LoadingOrbit";
import MedicareAssistant from "@/components/chat/MedicareAssistant";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Medicare AI - Next-Gen Healthcare Platform",
  description: "AI-powered disease prediction and healthcare assistance platform",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster position="top-right" richColors closeButton />
        <Navbar />
        <div className="min-h-screen">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><LoadingOrbit /></div>}>
            {children}
          </Suspense>
        </div>
        <ClientFooter />
        {/* Global Emergency Button - visible on all pages */}
        <EmergencyButton />
        
        {/* Main Website AI Assistant */}
        <Suspense fallback={null}>
          <MedicareAssistant />
        </Suspense>
      </body>
    </html>
  );
}
