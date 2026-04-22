"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";

interface FeedbackBarProps {
    predictionId?: string; // We might not have a strict ID yet, but can pass disease name or correlation ID
    diseaseName: string;
}

export const FeedbackBar = ({ predictionId, diseaseName }: FeedbackBarProps) => {
    const [vote, setVote] = useState<'up' | 'down' | null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleVote = async (selectedVote: 'up' | 'down') => {
        setVote(selectedVote);
        if (selectedVote === 'up') {
            // Immediate submit for positive feedback
            submitFeedback(selectedVote, "");
        }
    };

    const submitFeedback = async (finalVote: 'up' | 'down', feedbackText: string) => {
        setIsSubmitting(true);
        try {
            await fetch('/api/predictions/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    diseaseName,
                    vote: finalVote,
                    comment: feedbackText,
                    predictionId: predictionId || `temp_${Date.now()}`
                })
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Failed to submit feedback", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center justify-center text-center space-y-2"
            >
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <p className="text-green-300 font-medium">Thank you for your feedback!</p>
                <p className="text-xs text-green-400/70">Your input helps improve our AI accuracy.</p>
            </motion.div>
        );
    }

    return (
        <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                    <h4 className="text-white font-medium">Was this assessment accurate?</h4>
                    <p className="text-xs text-gray-400 mt-1">Help us improve the diagnostic model.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleVote('up')}
                        disabled={isSubmitting}
                        className={`p-3 rounded-full transition-all ${
                            vote === 'up' 
                            ? 'bg-green-500/20 ring-2 ring-green-500 text-green-400' 
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-green-400'
                        }`}
                    >
                        <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleVote('down')}
                        disabled={isSubmitting}
                        className={`p-3 rounded-full transition-all ${
                            vote === 'down' 
                            ? 'bg-red-500/20 ring-2 ring-red-500 text-red-400' 
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400'
                        }`}
                    >
                        <ThumbsDown className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {vote === 'down' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                    >
                        <div className="p-4 rounded-xl bg-black/20 border border-red-500/20">
                            <label className="block text-sm font-medium text-red-300 mb-2">
                                What did we get wrong? (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="E.g. The suggested condition doesn't match my symptoms..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-24"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={() => submitFeedback('down', comment)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
