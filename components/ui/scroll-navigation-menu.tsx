"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, User, Activity, Hospital, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MenuItem {
    id: number
    title: string
    url: string
    icon: React.ReactNode
}

interface ScrollNavbarProps {
    menuItems?: MenuItem[]
    className?: string
}

const defaultMenuItems: MenuItem[] = [
    {
        id: 1,
        title: "Home",
        url: "/",
        icon: <Home className="w-5 h-5" />
    },
    {
        id: 2,
        title: "Predict",
        url: "/predict",
        icon: <Activity className="w-5 h-5" />
    },
    {
        id: 3,
        title: "Hospitals",
        url: "/hospitals",
        icon: <Hospital className="w-5 h-5" />
    },
    {
        id: 4,
        title: "About",
        url: "/about",
        icon: <Info className="w-5 h-5" />
    },
    {
        id: 5,
        title: "Sign In",
        url: "/auth",
        icon: <User className="w-5 h-5" />
    }
]

export const ScrollNavigation: React.FC<ScrollNavbarProps> = ({
    menuItems = defaultMenuItems,
    className = ""
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<number | null>(null)
    const [navItems, setNavItems] = useState(menuItems)

    React.useEffect(() => {
        // Check authentication status
        const checkAuth = () => {
            const token = sessionStorage.getItem("token") || sessionStorage.getItem("user");
            if (token) {
                setNavItems(prev => prev.map(item =>
                    item.title === "Sign In"
                        ? { ...item, title: "Profile", url: "/profile", icon: <User className="w-5 h-5" /> }
                        : item
                ));
            } else {
                setNavItems(menuItems);
            }
        };

        checkAuth();

        // Optional: Listen for storage changes or custom events if needed
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [menuItems]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    // Variant 5 for the popup menu
    const menuVariants = {
        closed: {
            opacity: 0,
            scale: 0.8,
            y: -50,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                when: "afterChildren",
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        },
        open: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        closed: {
            y: 20,
            opacity: 0,
            scale: 0.8
        },
        open: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        }
    }

    return (
        <>
            {/* Full Navbar - always visible */}
            <motion.nav
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 ${className}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            className="flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href="/" className="flex items-center gap-2">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/logo.png"
                                        alt="Medicare AI Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-blue to-medical-purple">
                                    Medicare AI
                                </span>
                            </Link>
                        </motion.div>

                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        className="relative"
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            href={item.url}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-medical-blue transition-colors"
                                        >
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                        {hoveredItem === item.id && (
                                            <motion.div
                                                layoutId="navbar-hover"
                                                className="absolute inset-0 bg-medical-blue/10 rounded-md -z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <motion.button
                                onClick={toggleMenu}
                                className="p-2 rounded-md text-foreground hover:text-medical-blue focus:outline-none"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Menu className="w-6 h-6" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile/Floating Menu Overlay (only needed for mobile or if we still want a popup menu on click, but strictly speaking user just wanted nav bar only. I'll keep the mobile menu functionality for responsiveness but remove the floating button trigger) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                            onClick={toggleMenu}
                        />

                        {/* Menu Container */}
                        <motion.div
                            variants={menuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]"
                            style={{ margin: 0 }}
                        >
                            <div className="relative bg-background/90 border border-border rounded-3xl p-8 shadow-2xl min-w-[320px] backdrop-blur-xl flex flex-col items-center">
                                {/* Close Button */}
                                <motion.button
                                    onClick={toggleMenu}
                                    className="absolute top-4 right-4 p-2 text-foreground hover:text-medical-blue rounded-full hover:bg-muted"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>

                                {/* Menu Items */}
                                <div className="space-y-4 mt-8 w-full">
                                    {navItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.05, x: 10 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Link
                                                href={item.url}
                                                onClick={toggleMenu}
                                                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-medical-blue/10 transition-colors group w-full"
                                            >
                                                <motion.div
                                                    className="text-medical-blue"
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {item.icon}
                                                </motion.div>
                                                <span className="text-lg font-medium text-foreground group-hover:text-medical-blue">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
