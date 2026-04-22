'use client';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import React from 'react';

interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export function FlowButton({
    text = "Modern Button",
    icon: Icon,
    className,
    direction = "right",
    ...props
}: FlowButtonProps & { direction?: "left" | "right" }) {
    const isRight = direction === "right";
    const ArrowIcon = isRight ? ArrowRight : ArrowLeft;

    return (
        <button
            className={`group relative flex items-center gap-1 overflow-hidden rounded-[100px] border border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold text-medical-blue drop-shadow-[0_2px_4px_rgba(0,150,255,0.3)] backdrop-blur-md cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/20 hover:border-white/30 hover:rounded-[12px] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20 ${className}`}
            {...props}
        >
            {/* Entering Arrow */}
            <ArrowIcon
                className={`absolute w-4 h-4 stroke-current fill-none z-[9] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isRight
                    ? "left-[-25%] group-hover:left-4"
                    : "right-[-25%] group-hover:right-4"
                    }`}
            />

            {/* Text */}
            <span className={`relative z-[1] transition-all duration-[800ms] ease-out flex items-center gap-2 ${isRight
                ? "-translate-x-3 group-hover:translate-x-3"
                : "translate-x-3 group-hover:-translate-x-3"
                }`}>
                {Icon && <Icon className="w-4 h-4" />}
                {text}
            </span>

            {/* Hover Background Layer Removed to Preserve Text Visibility */}

            {/* Exiting Arrow */}
            <ArrowIcon
                className={`absolute w-4 h-4 stroke-current fill-none z-[9] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isRight
                    ? "right-4 group-hover:right-[-25%]"
                    : "left-4 group-hover:left-[-25%]"
                    }`}
            />
        </button>
    );
}
