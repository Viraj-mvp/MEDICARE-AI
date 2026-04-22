'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Minimize2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AdminAIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello Admin! I am your AI assistant for MEDICARE-AI. How can I help you manage the medical database today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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

    // Persist chat in session storage
    useEffect(() => {
        const saved = sessionStorage.getItem('admin_chat_history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load chat history', e);
            }
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('admin_chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Could not reach the AI assistant.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => e.stopPropagation()}
                        className="pointer-events-auto absolute bottom-20 right-0 w-[calc(100vw-48px)] sm:w-[380px] h-[550px] max-h-[calc(100vh-120px)] bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-medical-blue/20 text-medical-blue">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-white">Admin AI Assistant</h3>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] text-gray-400">Online & Ready</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-gray-400 hover:text-white"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
                        >
                            {messages.map((m, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "flex flex-col max-w-[85%]",
                                        m.role === 'user' ? "ml-auto items-end" : "items-start"
                                    )}
                                >
                                    <div 
                                        className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed",
                                            m.role === 'user' 
                                                ? "bg-medical-blue text-white rounded-tr-none shadow-lg shadow-medical-blue/10" 
                                                : "bg-white/5 text-gray-300 rounded-tl-none border border-white/10"
                                        )}
                                    >
                                        {m.content}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 px-1">
                                        {m.role === 'user' ? 'You' : 'Assistant'}
                                    </span>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-gray-500 text-xs px-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>AI is thinking...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2"
                            >
                                <Input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything about admin panel..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10 rounded-xl focus-visible:ring-medical-blue"
                                    autoFocus
                                />
                                <Button 
                                    type="submit" 
                                    variant="medical" 
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="h-10 w-10 rounded-xl shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                            <p className="text-[9px] text-gray-600 mt-2 text-center">
                                AI responses should be verified. MEDICARE-AI Assistant v1.0
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="pointer-events-auto w-14 h-14 rounded-full bg-medical-blue shadow-xl shadow-medical-blue/30 flex items-center justify-center text-white transition-all relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            className="flex items-center justify-center"
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
