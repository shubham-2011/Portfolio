'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Sparkles } from 'lucide-react';

export interface Project {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  tech: string[];
  links: {
    github?: string;
    live?: string;
    backend?: string;
    frontend?: string;
  };
  features: string[];
}

interface ProjectsProps {
  projects?: Project[];
}

export default function Projects({ projects: passedProjects }: ProjectsProps) {
  const defaultProjects: Project[] = [
    {
      id: '1',
      title: 'CINEMA',
      subtitle: '(REVENUE & BOOKING HUB)',
      description:
        'Full-stack cinema management ecosystem with interactive real-time seat selection, revenue analytics, and geolocation theater discovery.',
      image:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000',
      tech: ['Angular 18', 'ASP.NET Core', 'C#', 'PostgreSQL', 'JWT'],
      links: {
        frontend: 'https://github.com/Shubham200020/Movie-ticket-Frontend',
        backend: 'https://github.com/Shubham200020/Movie-ticket-Backend',
      },
      features: [
        'Real-time seat reservation workflow',
        'Cinema revenue & sales analytics dashboard',
      ],
    },
    {
      id: '2',
      title: 'INVENTORY',
      subtitle: '(MANAGEMENT & SALES OPS)',
      description:
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock with FIFO logic, and analyze profit.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
      tech: ['Spring Boot', 'Java 17', 'Angular 18', 'PostgreSQL', 'Hibernate'],
      links: {
        frontend: 'https://github.com/Shubham200020/product-management-system-frontend',
        backend: 'https://github.com/Shubham200020/product-management-system-backend',
      },
      features: [
        'FIFO inventory decrement logic & stock alerts',
        'Dynamic profit and revenue analytics',
      ],
    },
    {
      id: '3',
      title: 'APK ELITE',
      subtitle: '(BUSINESS ARCHITECTURE)',
      description:
        'High-performance, SEO-optimized business website developed for an elite service provider to expand online client acquisition and visibility.',
      image:
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=1000',
      tech: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'SEO'],
      links: {
        live: 'https://www.apkeliteservices.in/',
      },
      features: [
        'SEO metadata architecture with structured JSON-LD',
        'Mobile-first responsive design across all devices',
      ],
    },
    {
      id: '4',
      title: 'COMMERCE',
      subtitle: '(MICROSERVICES GATEWAY)',
      description:
        'Cloud-native distributed commerce backend engineered with asynchronous event streaming, rate-limited API gateway, and resilient PostgreSQL transactions.',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
      tech: ['Spring Boot', 'Java', 'PostgreSQL', 'Docker', 'Next.js'],
      links: {
        frontend: 'https://github.com/Shubham200020',
        backend: 'https://github.com/Shubham200020',
      },
      features: [
        'Decoupled microservice architecture with event streaming',
        'Centralized API Gateway with rate limiting & JWT verification',
      ],
    },
    {
      id: '5',
      title: 'SYNC ENGINE',
      subtitle: '(COLLABORATIVE CODE & CHAT)',
      description:
        'Low-latency collaborative workspace supporting live code editing, instant WebSocket messaging, syntax highlighting, and room-based synchronization.',
      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
      tech: ['React 19', 'Node.js', 'WebSockets', 'Redis', 'MongoDB'],
      links: {
        frontend: 'https://github.com/Shubham200020',
        backend: 'https://github.com/Shubham200020',
      },
      features: [
        'Bidirectional WebSocket protocol for live document synchronization',
        'In-memory Redis pub/sub for multi-node message broadcasting',
      ],
    },
  ];

  const projects = passedProjects && passedProjects.length > 0 ? passedProjects : defaultProjects;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Automatic Smooth 3D Rotation (Pauses on Hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [isHovered, projects.length]);

  const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
  const nextIndex = (currentIndex + 1) % projects.length;

  return (
    <section
      id="projects"
      className="py-16 sm:py-24 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-white/[0.02] rounded-full blur-[180px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Interactive 3D Showcase</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight animate-text-shimmer">
          Selected Work
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          3D curved cylinder perspective &bull; Auto-rotating &bull; Hover to pause
        </p>
      </div>

      {/* ========================================================================= */}
      {/* EXACT SQUARESPACE 3D TRIPTYCH STAGE: LEFT CARD, CENTER CARD, RIGHT CARD   */}
      {/* ========================================================================= */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full max-w-7xl mx-auto h-[540px] sm:h-[620px] flex items-center justify-center select-none overflow-visible px-4"
        style={{ perspective: '1500px' }}
      >
        {/* =================================================================== */}
        {/* 1. FLANKING LEFT CARD (TILTED INWARD AT +26 DEGREE 3D ANGLE)         */}
        {/* =================================================================== */}
        <div
          onClick={() => setCurrentIndex(prevIndex)}
          className="absolute left-[2%] sm:left-[6%] lg:left-[10%] w-[75vw] sm:w-[420px] lg:w-[460px] h-[460px] sm:h-[540px] rounded-[32px] overflow-hidden border border-white/15 bg-[#0e0e11] shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer z-10 hover:border-white/40 transition-all duration-700 hidden md:flex flex-col justify-between p-6 sm:p-7"
          style={{
            transform: 'translateX(-45%) rotateY(26deg) scale(0.85)',
            transformOrigin: 'right center',
          }}
        >
          {/* Card Top */}
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">
              0{prevIndex + 1} &bull; {projects[prevIndex].tech[0] || 'FULL STACK'}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              PREVIOUS &larr;
            </span>
          </div>

          {/* Card Headline */}
          <div className="py-2 space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase leading-tight">
              {projects[prevIndex].title}
            </h3>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {projects[prevIndex].subtitle || '(ARCHITECTURE)'}
            </p>
          </div>

          {/* Visual Artwork Thumbnail */}
          <div className="relative flex-1 my-3 rounded-2xl overflow-hidden bg-black border border-white/10">
            <Image
              src={projects[prevIndex].image}
              alt={projects[prevIndex].title}
              fill
              className="object-cover brightness-75"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Card Footer */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-zinc-400 line-clamp-1">
              {projects[prevIndex].description}
            </p>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CENTER ACTIVE SPOTLIGHT CARD (ELEVATED FLAT FORWARD AT 0 DEGREE)  */}
        {/* =================================================================== */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0.8, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[90vw] sm:w-[460px] lg:w-[500px] h-[490px] sm:h-[580px] rounded-[34px] overflow-hidden border-2 border-white/30 bg-[#0c0c0f] shadow-[0_30px_90px_rgba(0,0,0,0.95)] z-30 flex flex-col justify-between p-6 sm:p-8 group"
          style={{
            transform: 'translateZ(60px)',
          }}
        >
          {/* Card Top Nav Bar (like Squarespace template navigation) */}
          <div className="flex items-center justify-between text-xs text-zinc-300 pb-3 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">
                0{currentIndex + 1} &bull; {projects[currentIndex].tech[0] || 'ENGINEERING'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {projects[currentIndex].links?.frontend && (
                <a
                  href={projects[currentIndex].links.frontend}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:underline transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Code</span>
                </a>
              )}

              {projects[currentIndex].links?.live ? (
                <a
                  href={projects[currentIndex].links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all inline-flex items-center gap-1 shadow-md shadow-white/10"
                >
                  <span>Live Demo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : projects[currentIndex].links?.frontend ? (
                <a
                  href={projects[currentIndex].links.frontend}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all inline-flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}
            </div>
          </div>

          {/* Bold Squarespace Typography (Like "Balance (WELLNESS CENTER)") */}
          <div className="pt-2 pb-1 space-y-1 text-left">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none uppercase">
              {projects[currentIndex].title}
            </h3>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
              {projects[currentIndex].subtitle || 'PUNE &bull; FULL-STACK ARCHITECTURE'}
            </p>
          </div>

          {/* Visual Canvas (Bright, Crisp Screenshot Banner) */}
          <div className="relative flex-1 my-3 w-full rounded-2xl overflow-hidden border border-white/15 bg-black group/item">
            <Image
              src={projects[currentIndex].image}
              alt={projects[currentIndex].title}
              fill
              priority
              className="object-cover group-hover/item:scale-105 transition-transform duration-700 brightness-95 group-hover/item:brightness-100"
              sizes="(max-width: 768px) 90vw, 500px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-85" />

            {/* Floating Top-Left Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
              {projects[currentIndex].tech.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/80 backdrop-blur-md text-white border border-white/20 font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Card Footer */}
          <div className="space-y-3 pt-2 border-t border-white/15">
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
              {projects[currentIndex].description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {projects[currentIndex].tech.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-zinc-200 border border-white/10 font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                {currentIndex + 1} / {projects.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 3. FLANKING RIGHT CARD (TILTED INWARD AT -26 DEGREE 3D ANGLE)        */}
        {/* =================================================================== */}
        <div
          onClick={() => setCurrentIndex(nextIndex)}
          className="absolute right-[2%] sm:right-[6%] lg:right-[10%] w-[75vw] sm:w-[420px] lg:w-[460px] h-[460px] sm:h-[540px] rounded-[32px] overflow-hidden border border-white/15 bg-[#0e0e11] shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer z-10 hover:border-white/40 transition-all duration-700 hidden md:flex flex-col justify-between p-6 sm:p-7"
          style={{
            transform: 'translateX(45%) rotateY(-26deg) scale(0.85)',
            transformOrigin: 'left center',
          }}
        >
          {/* Card Top */}
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">
              0{nextIndex + 1} &bull; {projects[nextIndex].tech[0] || 'FULL STACK'}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              &rarr; NEXT
            </span>
          </div>

          {/* Card Headline */}
          <div className="py-2 space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase leading-tight">
              {projects[nextIndex].title}
            </h3>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {projects[nextIndex].subtitle || '(ARCHITECTURE)'}
            </p>
          </div>

          {/* Visual Artwork Thumbnail */}
          <div className="relative flex-1 my-3 rounded-2xl overflow-hidden bg-black border border-white/10">
            <Image
              src={projects[nextIndex].image}
              alt={projects[nextIndex].title}
              fill
              className="object-cover brightness-75"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Card Footer */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-zinc-400 line-clamp-1">
              {projects[nextIndex].description}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle Slide Indicators */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-8 bg-white shadow-md shadow-white/40'
                : 'w-2 bg-zinc-800 hover:bg-zinc-600'
            }`}
            aria-label={`Jump to project ${idx + 1}`}
          />
        ))}
      </div>

      {/* Caption Underneath (Like "Join millions of entrepreneurs..." in Squarespace) */}
      <div className="mt-4 text-center">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Squarespace 3D Showcase &bull; Click any side card to spotlight
        </p>
      </div>
    </section>
  );
}
