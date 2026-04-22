"use client";
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function GlassFilter() {
    return (
        <svg className="hidden">
            <defs>
                <filter
                    id="radio-glass"
                    x="0%"
                    y="0%"
                    width="100%"
                    height="100%"
                    colorInterpolationFilters="sRGB"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05 0.05"
                        numOctaves="1"
                        seed="1"
                        result="turbulence"
                    />
                    <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="blurredNoise"
                        scale="30"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        result="displaced"
                    />
                    <feGaussianBlur in="displaced" stdDeviation="2" result="finalBlur" />
                    <feComposite in="finalBlur" in2="finalBlur" operator="over" />
                </filter>
            </defs>
        </svg>
    );
}

interface LiquidRadioProps {
    value: string;
    onValueChange: (value: string) => void;
    className?: string; // Allow passing external styles
}

export function LiquidRadio({ value, onValueChange, className }: LiquidRadioProps) {
    return (
        <div className={`inline-flex h-12 rounded-lg bg-white/5 backdrop-blur-md p-0.5 border border-white/10 ${className || ''}`}>
            <RadioGroup
                value={value}
                onValueChange={onValueChange}
                className="group relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:bg-medical-blue/80 after:shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=myself]:after:translate-x-0 data-[state=other]:after:translate-x-full"
                data-state={value}
            >
                <div
                    className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md opacity-50"
                    style={{ filter: 'url("#radio-glass")' }}
                />
                <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-6 transition-colors text-white/50 group-data-[state=myself]:text-white">
                    Myself
                    <RadioGroupItem id="opt-myself" value="myself" className="sr-only" />
                </label>
                <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-6 transition-colors text-white/50 group-data-[state=other]:text-white">
                    Someone else
                    <RadioGroupItem id="opt-other" value="other" className="sr-only" />
                </label>
                <GlassFilter />
            </RadioGroup>
        </div>
    );
}
