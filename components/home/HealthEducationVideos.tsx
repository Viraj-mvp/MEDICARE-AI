'use client';

import React from 'react';
import { PlayCircle } from 'lucide-react';

const videos = [
    {
        src: "https://www.youtube.com/embed/8c_UJwLq8PI?rel=0&controls=1&showinfo=0&modestbranding=1",
        title: "Health Education Video 1"
    },
    {
        src: "https://www.youtube.com/embed/zJgHbifIx-Q?rel=0&controls=1&showinfo=0&modestbranding=1",
        title: "Health Education Video 2"
    },
    {
        src: "https://www.youtube.com/embed/fK1_SH3X2ek?rel=0&controls=1&showinfo=0&modestbranding=1",
        title: "Health Education Video 3"
    },
    {
        src: "https://www.youtube.com/embed/Fixp7OAYFfA?rel=0&controls=1&showinfo=0&modestbranding=1",
        title: "Health Education Video 4"
    },
    {
        src: "https://www.youtube.com/embed/GymXjJJ7Ugo?rel=0&controls=1&showinfo=0&modestbranding=1",
        title: "Health Education Video 5"
    },
    {
        src: "https://www.youtube.com/embed/c06dTj0v0sM?rel=0&controls=1&showinfo=0&modestbranding=1",
        title: "Health Education Video 6"
    },
];

export function HealthEducationVideos() {
    return (
        <section className="py-20 bg-background relative z-10 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple flex items-center justify-center gap-3">
                        <PlayCircle className="w-8 h-8 text-medical-blue" />
                        Health Education Videos
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Watch expert-curated videos on staying healthy and preventing disease
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map((video, idx) => (
                        <div
                            key={idx}
                            className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 group"
                        >
                            {/* Overlay: visible by default, hidden on cursor hover */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none">
                                <div className="w-14 h-14 rounded-full border-2 border-white/80 flex items-center justify-center backdrop-blur-sm bg-black/30">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                </div>
                            </div>
                            <iframe
                                className="w-full h-full"
                                src={video.src}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; compute-pressure"
                                allowFullScreen
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
