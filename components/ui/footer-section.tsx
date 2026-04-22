'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Facebook, Instagram, Linkedin, Youtube,
    Twitter, Github, Activity, Shield,
    Mail, Phone, MapPin
} from 'lucide-react';

interface FooterLink {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
    label: string;
    links: FooterLink[];
}

const footerLinks: FooterSection[] = [
    {
        label: 'Platform',
        links: [
            { title: 'Home', href: '/' },
            { title: 'Disease Prediction', href: '/predict' },
            { title: 'Find Hospitals', href: '/hospitals' },
            { title: 'Prevention Guide', href: '/prevention' },
        ],
    },
    {
        label: 'Company',
        links: [
            { title: 'About Us', href: '/about' },
            { title: 'Privacy Policy', href: '/legal#privacy' },
            { title: 'Terms of Service', href: '/legal#terms' },
            { title: 'Contact Support', href: '/legal#support' },
        ],
    },
    {
        label: 'Connect',
        links: [
            { title: 'Twitter', href: '#', icon: Twitter },
            { title: 'GitHub', href: '#', icon: Github },
            { title: 'LinkedIn', href: '#', icon: Linkedin },
            { title: 'Instagram', href: '#', icon: Instagram },
        ],
    },
    {
        label: 'Contact',
        links: [
            { title: 'MediCare@gmail.com', href: 'mailto:MediCare@gmail.com', icon: Mail },
            { title: '+91 1234567890', href: 'tel:+911234567890', icon: Phone },
            { title: 'Gandhinagar, Gujarat', href: '#', icon: MapPin },
        ]
    }
];

export function Footer() {
    return (
        <footer className="md:rounded-t-[3rem] relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center rounded-t-[2rem] border-t border-white/10 bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/5%),transparent)] px-6 py-12 lg:py-16 mt-20 backdrop-blur-sm">
            <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur bg-medical-blue/50" />

            <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
                <AnimatedContainer className="space-y-4 flex flex-col items-start">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Medicare AI Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        <span className="text-2xl font-bold text-gradient">Medicare AI</span>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Next-generation healthcare platform powered by advanced AI for accurate disease prediction and medical assistance.
                    </p>
                    <p className="text-muted-foreground mt-8 text-sm md:mt-0">
                        © {new Date().getFullYear()} Medicare AI. All rights reserved.
                    </p>
                </AnimatedContainer>

                <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
                    {footerLinks.map((section, index) => (
                        <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                            <div className="mb-10 md:mb-0">
                                <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
                                <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
                                    {section.links.map((link) => (
                                        <li key={link.title}>
                                            <Link
                                                href={link.href}
                                                className="hover:text-medical-blue inline-flex items-center transition-all duration-300 gap-2"
                                            >
                                                {link.icon && <link.icon className="size-4" />}
                                                {link.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedContainer>
                    ))}
                </div>
            </div>
        </footer>
    );
};

type ViewAnimationProps = {
    delay?: number;
    className?: ComponentProps<typeof motion.div>['className'];
    children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
