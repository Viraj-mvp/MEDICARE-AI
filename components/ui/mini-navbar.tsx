"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    // ... (unchanged)
    const defaultTextColor = 'text-gray-300';
    const hoverTextColor = 'text-white';
    const textSizeClass = 'text-sm';

    return (
        <Link href={href} className={`group relative inline-block overflow-hidden h-5 ${textSizeClass}`}>
            <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
                <span className={`${defaultTextColor} h-5 flex items-center`}>{children}</span>
                <span className={`${hoverTextColor} h-5 flex items-center`}>{children}</span>
            </div>
        </Link>
    );
};

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const checkAuth = async () => {
            // Use localStorage only as a quick hint to know if we might be logged in.
            // Never trust localStorage for the display name — always fetch from server
            // so that each tab reflects its own JWT cookie, not another tab's localStorage write.
            const userStr = sessionStorage.getItem("user");

            if (!userStr) {
                setIsLoggedIn(false);
                setUserName('');
                return;
            }

            try {
                // Always verify session AND get authoritative name from the server cookie
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        const name = data.user.name || data.user.email?.split('@')[0] || 'Profile';
                        setIsLoggedIn(true);
                        setUserName(name);
                    } else {
                        // User is null (not logged in)
                        sessionStorage.removeItem("user");
                        setIsLoggedIn(false);
                        setUserName('');
                    }
                } else {
                    // Cookie expired or invalid — clear stale sessionStorage too
                    sessionStorage.removeItem("user");
                    setIsLoggedIn(false);
                    setUserName('');
                }
            } catch (e) {
                // Network error — fall back to localStorage name, stay logged in
                try {
                    const user = JSON.parse(userStr);
                    setIsLoggedIn(true);
                    setUserName(user.name || user.email?.split('@')[0] || 'Profile');
                } catch {
                    setIsLoggedIn(false);
                    setUserName('');
                }
            }
        };
        checkAuth();
        // NOTE: We intentionally do NOT listen to the 'storage' event.
        // The storage event fires in OTHER tabs (not the current one), so adding it causes
        // Tab A to react to Tab B's login and show the wrong user name.
        // Each tab independently verifies its own session on mount and path change.
    }, [pathname]); // Re-run check on path change

    useEffect(() => {
        if (shapeTimeoutRef.current) {
            clearTimeout(shapeTimeoutRef.current);
        }

        if (isOpen) {
            setHeaderShapeClass('rounded-xl');
        } else {
            shapeTimeoutRef.current = setTimeout(() => {
                setHeaderShapeClass('rounded-full');
            }, 300);
        }

        return () => {
            if (shapeTimeoutRef.current) {
                clearTimeout(shapeTimeoutRef.current);
            }
        };
    }, [isOpen]);

    const logoElement = (
        <Link href="/" className="relative w-8 h-8 flex items-center justify-center">
            <Image
                src="/logo.png"
                alt="Medicare AI Logo"
                fill
                sizes="32px"
                className="object-contain"
            />
        </Link>
    );

    const navLinksData = [
        { label: 'Home', href: '/' },
        { label: 'Predict', href: '/predict' },
        { label: 'Hospitals', href: '/hospitals' },
        { label: 'Prevention', href: '/prevention' },
        { label: 'About', href: '/about' },
    ];

    const loginButtonElement = (
        <Link href="/auth">
            <button className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-white/10 bg-white/5 text-gray-300 rounded-full hover:bg-white/10 hover:text-white transition-colors duration-200 w-full sm:w-auto">
                LogIn
            </button>
        </Link>
    );

    const signupButtonElement = (
        <Link href="/auth?m=register" className="relative group w-full sm:w-auto block">
            <div className="absolute inset-0 -m-2 rounded-full
                     hidden sm:block
                     bg-gray-100
                     opacity-20 filter blur-lg pointer-events-none
                     transition-all duration-300 ease-out
                     group-hover:opacity-40 group-hover:blur-xl group-hover:-m-3"></div>
            <button className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-all duration-200 w-full sm:w-auto">
                Signup
            </button>
        </Link>
    );

    const profileButtonElement = (
        <Link href="/profile">
            <button className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-white/10 bg-white/5 text-gray-300 rounded-full hover:bg-white/10 hover:text-white transition-colors duration-200 w-full sm:w-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {userName}
            </button>
        </Link>
    );

    // Move conditional return after all hooks
    if (pathname?.startsWith('/developer')) return null;

    return (
        <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]
                       flex flex-col items-center
                       pl-6 pr-6 py-3 backdrop-blur-md
                       ${headerShapeClass}
                       border border-white/5 bg-black/20
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-0 ease-in-out whitespace-nowrap shadow-lg shadow-black/10`}>

            <div className="flex items-center justify-between w-full gap-x-8 sm:gap-x-12">
                <div className="flex items-center">
                    {logoElement}
                </div>

                <nav className="hidden sm:flex items-center space-x-6 sm:space-x-8 text-sm">
                    {navLinksData.map((link) => (
                        <AnimatedNavLink key={link.href} href={link.href}>
                            {link.label}
                        </AnimatedNavLink>
                    ))}
                </nav>

                <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                    {!isLoggedIn ? (
                        <>
                            {loginButtonElement}
                            {signupButtonElement}
                        </>
                    ) : (
                        profileButtonElement
                    )}
                </div>

                <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
                <nav className="flex flex-col items-center space-y-4 text-base w-full">
                    {navLinksData.map((link) => (
                        <Link key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors w-full text-center">
                            {link.label}
                        </Link>
                    ))}
                    {isLoggedIn && (
                        <Link href="/profile" className="text-gray-300 hover:text-white transition-colors w-full text-center">
                            {userName}
                        </Link>
                    )}
                </nav>
                {!isLoggedIn ? (
                    <div className="flex flex-col items-center space-y-4 mt-4 w-full">
                        {loginButtonElement}
                        {signupButtonElement}
                    </div>
                ) : null}
            </div>
        </header>
    );
}
