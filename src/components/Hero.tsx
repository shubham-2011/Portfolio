'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, FileText, ArrowDown, Sparkles } from 'lucide-react';
import ParticleSphere from './ParticleSphere';

interface HeroProps {
  content?: {
    status?: string;
    name?: string;
    title?: string;
    description?: string;
    yearsExperience?: string;
    technologiesCount?: string;
    clientSatisfaction?: string;
    profileImage?: string;
    resumeUrl?: string;
  };
}

const rotatingRoles = [
  'Full Stack Software Developer',
  'Spring Boot & Java Architect',
  'PostgreSQL & Database Specialist',
  'Angular & React Frontend Engineer',
  'Cloud & Distributed Systems Builder',
];

export default function Hero({ content }: HeroProps) {
  const status = content?.status || 'Available for Opportunities';
  const name = content?.name || 'Shubham';
  const baseTitle = content?.title || 'Full Stack Software Developer';
  const description =
    content?.description ||
    'Computer Engineer specializing in full-stack architecture. I design and build high-performance, scalable applications using Java, Spring Boot, PostgreSQL, Angular, React & Cloud.';
  const yearsExperience = content?.yearsExperience || '2+';
  const technologiesCount = content?.technologiesCount || '10+';
  const clientSatisfaction = content?.clientSatisfaction || '100%';
  const profileImage = content?.profileImage || '/Skills/shubham3-rm.png';
  const resumeUrl = content?.resumeUrl || '/CV.png';

  // Rotating Typewriter Text Effect
  const [roleIndex, setRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const activeRole = rotatingRoles[roleIndex];
    const typingSpeed = isDeleting ? 35 : 70;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < activeRole.length) {
          setCurrentText(activeRole.slice(0, currentText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(activeRole.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % rotatingRoles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, roleIndex]);

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black"
    >
      {/* 🌌 Squarespace Celestial 3D Stardust Particle Sphere Background */}
      <ParticleSphere particleCount={2500} speed={1.2} radiusFactor={0.52} centerYRatio={0.5} className="opacity-100 z-0" />
      <div className="absolute inset-0 bg-grid-white [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_80%)] pointer-events-none opacity-15 z-0" />

      {/* ========================================================================= */}
      {/* 📱 EXCLUSIVE MOBILE HERO EXPERIENCE (< lg)                                */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col items-center text-center space-y-5 w-full relative z-10 max-w-md mx-auto">
        {/* Mobile Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/20 text-[11px] font-mono uppercase tracking-wider text-zinc-300 shadow-lg shadow-white/5"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>{status}</span>
        </motion.div>

        {/* Mobile Centerpiece Avatar Capsule with Orbit Badges */}
        <div className="relative my-2">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl -z-10" />

          {/* Framed Circular Avatar */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1 bg-gradient-to-b from-white/30 via-zinc-800 to-black border-2 border-white/25 shadow-2xl overflow-hidden mx-auto">
            <Image
              src={profileImage}
              alt={`${name} - ${baseTitle}`}
              fill
              priority
              className="object-cover object-top p-1"
              sizes="(max-width: 640px) 160px, 192px"
            />
          </div>

          {/* Orbiting Satellite Badges */}
          <div className="absolute -top-1 -left-2 px-2.5 py-1 rounded-full bg-black/90 border border-white/25 text-[10px] font-bold font-mono text-white shadow-xl backdrop-blur-md">
            ⚡ Spring Boot
          </div>
          <div className="absolute top-1 -right-2 px-2.5 py-1 rounded-full bg-black/90 border border-white/25 text-[10px] font-bold font-mono text-white shadow-xl backdrop-blur-md">
            ⚛ React / Angular
          </div>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-950 border border-white/30 text-[10px] font-mono text-zinc-300 shadow-xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>PostgreSQL & Cloud</span>
          </div>
        </div>

        {/* Mobile Punchy Typography */}
        <div className="space-y-1.5 px-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none">
            I&apos;m <span className="animate-text-shimmer">{name}</span>
          </h1>
          <div className="min-h-[28px] flex items-center justify-center">
            <span className="text-sm sm:text-base text-zinc-300 font-semibold font-mono tracking-tight">
              {currentText}
            </span>
            <span className="inline-block w-[2px] h-4 bg-white ml-1 animate-pulse" />
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto pt-0.5">
            {description}
          </p>
        </div>

        {/* Mobile Quick Action Thumb Dock */}
        <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
          <a
            href="mailto:shubhammisra800@gmail.com"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-bold text-xs shadow-lg shadow-white/10 active:scale-95 transition-transform"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Hire / Email</span>
          </a>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-xs active:scale-95 transition-transform"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-300" />
            <span>Resume PDF</span>
          </a>
        </div>

        {/* Mobile Floating Glass Stats Ribbon */}
        <div className="w-full p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-xl backdrop-blur-md grid grid-cols-3 divide-x divide-zinc-800 text-center">
          <div className="px-1">
            <p className="text-lg font-black text-white tracking-tight">{yearsExperience}</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Experience</p>
          </div>
          <div className="px-1">
            <p className="text-lg font-black text-white tracking-tight">{technologiesCount}</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Tech Stack</p>
          </div>
          <div className="px-1">
            <p className="text-lg font-black text-white tracking-tight">{clientSatisfaction}</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Quality</p>
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <Link
          href="#projects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors pt-1"
        >
          <span>Explore Projects Reel</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP TWO-COLUMN HERO (hidden on mobile, visible on lg:grid)         */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid max-w-7xl mx-auto w-full grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Text & Animated CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Animated Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-zinc-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>{status}</span>
          </motion.div>

          {/* Animated Shimmer Title & Rotating Typewriter Role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              I&apos;m{' '}
              <span className="animate-text-shimmer font-black">
                {name}
              </span>
            </h1>

            {/* Dynamic Typewriter Title with Animated Cursor */}
            <div className="h-10 sm:h-12 flex items-center justify-start">
              <span className="text-xl sm:text-2xl lg:text-3xl text-zinc-300 font-semibold tracking-tight">
                {currentText}
              </span>
              <span className="inline-block w-[3px] h-6 sm:h-8 bg-white ml-1.5 animate-pulse" />
            </div>
          </motion.div>

          {/* Animated Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Animated Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap items-center justify-start gap-4 pt-2"
          >
            <a
              href="mailto:shubhammisra800@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-bold shadow-lg shadow-white/10 hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </a>

            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-white/10 text-white font-semibold hover:border-white hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white backdrop-blur-md"
            >
              <FileText className="w-4 h-4 text-zinc-300" />
              <span>Download Resume</span>
            </a>

            <Link
              href="#projects"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              <span>Explore Projects</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </Link>
          </motion.div>

          {/* Highlights Mini Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="pt-6 grid grid-cols-3 gap-4 max-w-lg"
          >
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">{yearsExperience}</p>
              <p className="text-xs text-zinc-400">Years Learning & Dev</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-200 tracking-tight">{technologiesCount}</p>
              <p className="text-xs text-zinc-400">Core Technologies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">{clientSatisfaction}</p>
              <p className="text-xs text-zinc-400">Client Focused</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Refined Compact Profile Image with Orbit Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center items-center"
        >
          <div className="relative group">
            {/* Outer Cosmic Halo */}
            <div className="absolute -inset-3 bg-gradient-to-r from-white/20 via-zinc-500/20 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition duration-700 pointer-events-none" />

            {/* Compact Circular Frame */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-white/25 bg-zinc-950/80 shadow-[0_10px_50px_rgba(0,0,0,0.95)] p-1.5 backdrop-blur-md group-hover:border-white/50 transition-colors duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-black/60">
                <Image
                  src={profileImage}
                  alt={`${name} - ${baseTitle}`}
                  fill
                  priority
                  className="object-cover object-top p-1 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 176px, 208px"
                />
              </div>
            </div>

            {/* Orbiting Satellite Badges */}
            <div className="absolute -top-2 -left-4 px-3 py-1 rounded-full bg-black/90 border border-white/25 text-[11px] font-bold font-mono text-white shadow-xl backdrop-blur-md">
              ⚡ Spring Boot
            </div>
            <div className="absolute top-2 -right-4 px-3 py-1 rounded-full bg-black/90 border border-white/25 text-[11px] font-bold font-mono text-white shadow-xl backdrop-blur-md">
              ⚛ React / Angular
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-zinc-950/95 border border-white/30 text-[11px] font-mono text-zinc-300 shadow-xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>PostgreSQL & Cloud</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
