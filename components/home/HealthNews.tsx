"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/effects/GlassCard";
import { Newspaper, ExternalLink, Calendar } from "lucide-react";
import Image from "next/image";

interface Article {
    source: { name: string };
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    author: string;
}

export function HealthNews() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Determine protocol to avoid mixed content if deploying to https (localhost is fine)
                // Using the key provided by user. Note: NewsAPI free tier only works on localhost or limited requests.
                const response = await fetch('/api/news?q=health+medicine&limit=6');

                const data = await response.json();
                if (data.articles) {
                    setArticles(data.articles.filter((a: Article) => a.title && a.description && a.urlToImage));
                } else {
                    throw new Error("No articles found");
                }
            } catch (err) {
                console.error("Failed to fetch news", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (error) return null; // Hide section on error

    return (
        <section className="py-20 bg-background relative z-10 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/photo/LHN.webp"
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
            </div>
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple flex items-center justify-center gap-3">
                        <Newspaper className="w-8 h-8 text-medical-blue" /> Latest Health News
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Top headlines from the medical world
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 rounded-3xl bg-muted/20 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article, idx) => (
                            <GlassCard key={idx} className="flex flex-col h-full overflow-hidden hover:scale-105 transition-transform duration-300" hover={true}>
                                <div className="relative h-48 w-full shrink-0">
                                    <Image
                                        src={article.urlToImage || '/photo/photo-1.png'}
                                        alt={article.title}
                                        fill
                                        className="object-cover"
                                        unoptimized // NewsAPI images are external
                                    />
                                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        {article.source.name}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(article.publishedAt).toLocaleDateString()}
                                    </div>
                                    <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                                        {article.description}
                                    </p>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-auto inline-flex items-center text-sm font-semibold text-medical-blue hover:underline"
                                    >
                                        Read Full Article <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
