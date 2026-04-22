'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
}

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                'glass-card p-6',
                hover && 'hover-lift cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
