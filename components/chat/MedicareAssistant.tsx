'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Minimize2, Activity, Heart, Shield, Sparkles, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const MediAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-medical-blue to-purple-500 flex items-center justify-center text-white relative shadow-lg">
        <Activity className="w-6 h-6 animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0f0f0f] rounded-full" />
    </div>
);

export default function MedicareAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm Medi, your personal MEDICARE-AI health assistant. How are you feeling today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Prevent background scroll when hovering chat
    const handleMouseEnter = () => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
    };

    const handleMouseLeave = () => {
        document.body.style.overflow = '';
    };

    // Reset overflow on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Persist chat history
    useEffect(() => {
        const saved = sessionStorage.getItem('medicare_chat_history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load chat history', e);
            }
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('medicare_chat_history', JSON.stringify(messages));
    }, [messages]);

    // Context-based suggestions
    const getSuggestions = () => {
        if (pathname.includes('/predict')) {
            return ["How accurate is the prediction?", "What symptoms should I add?", "Explain severity levels"];
        }
        if (pathname.includes('/hospitals')) {
            return ["Find hospitals near me", "What are specialized departments?", "Check hospital ratings"];
        }
        if (pathname.includes('/about')) {
            return ["Who created Medicare AI?", "What are the future plans?", "Is my data secure?"];
        }
        if (pathname.includes('/prevention')) {
            return ["Healthy heart tips", "Importance of sleep", "Mental health advice"];
        }
        if (pathname.includes('/profile')) {
            return ["How to update my profile?", "View my health passport", "Change my password"];
        }
        return ["What is MEDICARE-AI?", "Check my symptoms", "Emergency assistance"];
    };

    const clearHistory = () => {
        const initialMessage: Message[] = [
            { role: 'assistant', content: "Hi! I'm Medi, your personal MEDICARE-AI health assistant. History cleared. How can I help you now?" }
        ];
        setMessages(initialMessage);
        sessionStorage.removeItem('medicare_chat_history');
    };

    const handleSend = async (text: string = input) => {
        const messageText = text.trim();
        if (!messageText || isLoading) return;

        const userMessage: Message = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [...messages, userMessage],
                    context: {
                        page: pathname,
                        title: document.title,
                        timestamp: new Date().toISOString()
                    },
                    analytics: {
                        source: 'web_widget'
                    }
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'I am sorry, I am having trouble connecting right now. Please try again later.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'It seems there is a connection issue. Please check your internet.' }]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const isVisible = !pathname.startsWith('/developer') && !pathname.startsWith('/auth');

    return (
        <div className={cn("fixed bottom-28 right-6 z-50 pointer-events-none", !isVisible && "hidden")}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => e.stopPropagation()}
                        className="pointer-events-auto absolute bottom-20 right-0 w-[calc(100vw-48px)] sm:w-[380px] h-[550px] max-h-[calc(100vh-120px)] bg-[#0f0f0f]/90 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-medical-blue/20 to-purple-500/10 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MediAvatar />
                                <div>
                                    <h3 className="font-bold text-base text-white">Medi Assistant</h3>
                                    <span className="text-[10px] text-medical-blue uppercase tracking-widest font-bold">AI Powered</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 1 && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-gray-400 hover:text-red-400 rounded-full hover:bg-white/10"
                                        onClick={clearHistory}
                                        title="Clear History"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                        >
                            {messages.map((m, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "flex gap-3 max-w-[90%]",
                                        m.role === 'user' ? "ml-auto flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                            <Activity className="w-4 h-4 text-medical-blue" />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <div 
                                            className={cn(
                                                "p-4 rounded-2xl text-sm leading-relaxed shadow-lg whitespace-pre-wrap",
                                                m.role === 'user' 
                                                    ? "bg-medical-blue text-white rounded-tr-none shadow-medical-blue/10" 
                                                    : "bg-white/5 text-gray-300 rounded-tl-none border border-white/10 shadow-black/40"
                                            )}
                                        >
                                            {m.content}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] text-gray-500 px-1",
                                            m.role === 'user' ? "text-right" : "text-left"
                                        )}>
                                            {m.role === 'user' ? 'You' : 'Medi'}
                                        </span>
                                    </div>
                                    {m.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-medical-blue/10 border border-medical-blue/20 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-medical-blue" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Activity className="w-4 h-4 text-medical-blue" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                        <div className="w-1 h-1 bg-medical-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1 h-1 bg-medical-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1 h-1 bg-medical-blue rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions */}
                        {!isLoading && !isTyping && messages.length < 10 && (
                            <div className="px-5 pb-2 flex flex-wrap gap-2">
                                {getSuggestions().map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="text-[11px] bg-white/5 hover:bg-medical-blue/20 border border-white/10 hover:border-medical-blue/30 text-gray-400 hover:text-medical-blue px-3 py-1.5 rounded-full transition-all duration-300"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-5 bg-black/40 backdrop-blur-md border-t border-white/10">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2"
                            >
                                <Input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your health question..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-2xl focus-visible:ring-medical-blue transition-all"
                                />
                                <Button 
                                    type="submit" 
                                    variant="medical" 
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="h-12 w-12 rounded-2xl shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                            <p className="text-[9px] text-gray-600 mt-3 text-center flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
                                <Shield className="w-2 h-2" /> Medical Disclaimer: AI Assistant
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05, y: -2, rotate: 5 }}
                whileTap={{ scale: 0.95, rotate: -5 }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "pointer-events-auto w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all relative group",
                    isOpen ? "bg-white/10 text-white" : "bg-gradient-to-tr from-medical-blue to-purple-600 text-white shadow-medical-blue/30"
                )}
            >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <X className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                            className="flex items-center justify-center"
                        >
                            <MessageCircle className="w-7 h-7" />
                            {/* Notification Dot */}
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-[#0f0f0f] rounded-full animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
