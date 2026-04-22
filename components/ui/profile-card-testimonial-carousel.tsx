"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Twitter,
  Linkedin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/effects/GlassCard";

interface TeamMember {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
}

const team: TeamMember[] = [
  {
    name: "Viraj Solanki",
    title: "Full Stack Developer & Security Specialist",
    description: "Bridging the gap between complex medical logic and user-centric design. Focused on building end-to-end features that democratize healthcare access.Ensuring the security and privacy of patient data.",
    imageUrl: "/photo/viraj.jpeg",
    githubUrl: "#",
    twitterUrl: "#",
    linkedinUrl: "#",
  },
   {
    name: "Harsh Sojitra",
    title: "Frontend Architect",
    description: "Expert in creating immersive, high-performance web experiences. Crafting the seamless, responsive interfaces that power our patient-first platform.",
    imageUrl: "/photo/harsh.jpeg",
    githubUrl: "#",
    twitterUrl: "#",
    linkedinUrl: "#",
  },

  {
    name: "Yogesh Patel",
    title: "Backend Developer",
    description: "Specialist in Scalable Backend Systems. Leading the development of MEDICARE-AI's high-performance diagnostic core.",
    imageUrl: "/photo/yogesh.jpeg",
    githubUrl: "#",
    twitterUrl: "#",
    linkedinUrl: "#",
  },
 
  {
    name: "Tanishq Sichaniya",
    title: "UI/UX & Product Designer",
    description: "Crafting intuitive digital health interfaces for global users. Ensuring that every interaction with MEDICARE-AI is simple, accessible, and inclusive.",
    imageUrl: "/photo/tanishq.jpeg",
    githubUrl: "#",
    twitterUrl: "#",
    linkedinUrl: "#",
  },
];

export interface TeamCarouselProps {
  className?: string;
}

export function TeamCarousel({ className }: TeamCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () =>
    setCurrentIndex((index) => (index + 1) % team.length);
  const handlePrevious = () =>
    setCurrentIndex(
      (index) => (index - 1 + team.length) % team.length
    );

  const currentMember = team[currentIndex];

  if (!currentMember) return null;

  const socialIcons = [
    { icon: Github, url: currentMember.githubUrl, label: "GitHub" },
    { icon: Twitter, url: currentMember.twitterUrl, label: "Twitter" },
    { icon: Linkedin, url: currentMember.linkedinUrl, label: "LinkedIn" },
  ];

  return (
    <div className={cn("w-full max-w-5xl mx-auto px-4", className)}>
      {/* Desktop layout */}
      <div className='hidden md:flex relative items-center'>
        {/* Avatar */}
        <div className='w-[470px] h-[470px] rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 relative group'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentMember.imageUrl}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className='w-full h-full'
            >
              <Image
                src={currentMember.imageUrl}
                alt={currentMember.name}
                width={470}
                height={470}
                className='w-full h-full object-cover transition-all duration-700'
                draggable={false}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card */}
        <GlassCard className='p-10 ml-[-80px] z-10 max-w-xl flex-1 border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentMember.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className='mb-6'>
                <h2 className='text-3xl font-bold text-white mb-2 font-display'>
                  {currentMember.name}
                </h2>

                <p className='text-xs font-bold text-medical-blue uppercase tracking-[0.2em]'>
                  {currentMember.title}
                </p>
              </div>

              <p className='text-gray-300 text-lg leading-relaxed mb-8 italic font-light'>
                "{currentMember.description}"
              </p>

              <div className='flex space-x-4'>
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                  <Link
                    key={label}
                    href={url || "#"}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center transition-all hover:bg-medical-blue/20 hover:border-medical-blue/50 hover:scale-110 cursor-pointer group'
                    aria-label={label}
                  >
                    <IconComponent className='w-5 h-5 text-gray-400 group-hover:text-white transition-colors' />
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Mobile layout */}
      <div className='md:hidden max-w-sm mx-auto text-center'>
        {/* Avatar */}
        <div className='w-full aspect-square bg-white/5 rounded-3xl overflow-hidden mb-6 border border-white/10 relative'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentMember.imageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className='w-full h-full'
            >
              <Image
                src={currentMember.imageUrl}
                alt={currentMember.name}
                width={400}
                height={400}
                className='w-full h-full object-cover'
                draggable={false}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-40" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card content */}
        <GlassCard className='p-6 border-white/10'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentMember.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <h2 className='text-2xl font-bold text-white mb-2'>
                {currentMember.name}
              </h2>
               
              <p className='text-[10px] font-bold text-medical-blue uppercase tracking-widest mb-4'>
                {currentMember.title}
              </p>
               
              <p className='text-gray-400 text-sm leading-relaxed mb-6 italic'>
                "{currentMember.description}"
              </p>
               
              <div className='flex justify-center space-x-4'>
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                  <Link
                    key={label}
                    href={url || "#"}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-11 h-11 bg-white/5 border border-white/10 rounded-full flex items-center justify-center transition-colors hover:bg-medical-blue/20 cursor-pointer'
                    aria-label={label}
                  >
                    <IconComponent className='w-5 h-5 text-gray-400 hover:text-white' />
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Bottom navigation */}
      <div className='flex justify-center items-center gap-6 mt-12'>
        {/* Previous */}
        <button
          onClick={handlePrevious}
          aria-label='Previous team member'
          className='w-12 h-12 rounded-full bg-white/5 border border-white/10 shadow-xl flex items-center justify-center hover:bg-medical-blue/20 hover:border-medical-blue/40 transition-all cursor-pointer group active:scale-95'
        >
          <ChevronLeft className='w-6 h-6 text-gray-400 group-hover:text-white transition-colors' />
        </button>

        {/* Dots */}
        <div className='flex gap-3'>
          {team.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                index === currentIndex
                  ? "bg-medical-blue w-8"
                  : "bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to team member ${index + 1}`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          aria-label='Next team member'
          className='w-12 h-12 rounded-full bg-white/5 border border-white/10 shadow-xl flex items-center justify-center hover:bg-medical-blue/20 hover:border-medical-blue/40 transition-all cursor-pointer group active:scale-95'
        >
          <ChevronRight className='w-6 h-6 text-gray-400 group-hover:text-white transition-colors' />
        </button>
      </div>
    </div>
  );
}
