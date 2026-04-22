import GlassmorphismTrustHero from '@/components/ui/glassmorphism-trust-hero';
import { MissionStats } from '@/components/home/MissionStats';
import { SeasonalAlerts } from '@/components/home/SeasonalAlerts';
import { EmergencyContacts } from '@/components/home/EmergencyContacts';
import { HealthNews } from '@/components/home/HealthNews';
import { HealthEducationVideos } from '@/components/home/HealthEducationVideos';
import { BMICalculator } from '@/components/home/BMICalculator';
import { FeedbackSection } from '@/components/home/FeedbackSection';

import { GlobalDiseaseMap } from '@/components/home/GlobalDiseaseMap';
import { LiveDiagnosticWave } from '@/components/home/LiveDiagnosticWave';

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <GlassmorphismTrustHero />

            <div className="relative z-10 space-y-0">
                <MissionStats />
                <div className="relative py-12 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/photo/HS1.webp"
                            alt="Background"
                            className="w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
                    </div>
                    <div className="container mx-auto max-w-7xl px-4 relative z-10">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 space-y-6">
                                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
                                    Intelligent Hospital Search
                                </h2>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Our advanced neural search connects you with over 900+ healthcare providers instantly.
                                    Visualized by our live wave-data engine, monitoring system status and availability in real-time.
                                </p>
                            </div>
                            <div className="flex-1 w-full relative z-10">
                                <LiveDiagnosticWave />
                            </div>
                        </div>
                    </div>
                </div>
                <EmergencyContacts />
                <SeasonalAlerts />
                <BMICalculator />
                <HealthNews />
                <HealthEducationVideos />
                <GlobalDiseaseMap />
                <FeedbackSection />
            </div>

            {/* Background Gradient Mesh for seamless flow */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
            </div>
        </main>
    );
}
