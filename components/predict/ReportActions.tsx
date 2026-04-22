import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Disease } from './PredictionResults';

interface ReportActionsProps {
    result: Disease; // The primary prediction
    userDetails: { name: string; age: string; gender: string; phone: string };
    symptoms: string[];
}

export function ReportActions({ result, userDetails, symptoms }: ReportActionsProps) {

    const handleWhatsAppShare = () => {
        const text = `*Medicare AI Health Assessment System*\n\n` +
            `*Diagnosis*: ${result.name}\n` +
            `*Confidence*: High\n` +
            `*Recommendation*: ${result.recommendations[0]}\n\n` +
            `Get your checkup at Medicare!`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 102, 204); // Medical Blue
        doc.text("Medicare AI - Health Report", 20, 20);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

        // Patient Info
        doc.setDrawColor(200);
        doc.line(20, 35, 190, 35);
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Patient Profile", 20, 45);
        doc.setFontSize(11);
        doc.text(`Name: ${userDetails.name}`, 20, 55);
        doc.text(`Age: ${userDetails.age} | Gender: ${userDetails.gender}`, 20, 62);

        // Symptoms
        doc.setFontSize(14);
        doc.text("Reported Symptoms", 20, 75);
        doc.setFontSize(11);
        doc.text(symptoms.join(", "), 20, 85, { maxWidth: 170 });

        // Diagnosis
        doc.setFillColor(240, 248, 255);
        doc.rect(20, 95, 170, 40, 'F');
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204);
        doc.text("Primary Diagnosis", 30, 110);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(result.name, 30, 120);
        doc.setFont("helvetica", "normal");

        // Explanation
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Analysis:", 20, 150);
        doc.setFontSize(11);
        doc.text(result.description, 20, 160, { maxWidth: 170 });

        // Recommendations
        doc.setFontSize(12);
        doc.text("Recommended Actions:", 20, 185);
        let y = 195;
        result.recommendations.forEach((rec) => {
            doc.text(`• ${rec}`, 25, y);
            y += 7;
        });

        // Disclaimer
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("DISCLAIMER: This is an AI-generated assessment and not a professional medical diagnosis. Please consult a doctor.", 20, 280);

        doc.save(`Medicare_Report_${userDetails.name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="flex gap-4 mt-6">
            <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 gap-2 border-medical-blue/30 hover:bg-medical-blue/10">
                <Download className="w-4 h-4" /> Download Report
            </Button>
            <Button onClick={handleWhatsAppShare} variant="glass" className="flex-1 gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border-[#25D366]/50">
                <Share2 className="w-4 h-4 text-[#25D366]" /> Share on WhatsApp
            </Button>
        </div>
    );
}
