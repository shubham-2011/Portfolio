'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ExternalLink, Github, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Project {
  id?: string;
  title: string;
  subtitle?: string;
  tagline?: string;
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
      subtitle: '(REVENUE & SEAT BOOKING)',
      tagline: 'PUNE • FULL-STACK ARCHITECTURE',
      description:
        'A full-stack cinema management platform creating dynamic reservation workflows, analytics, and business resilience.',
      image:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
      tech: ['Angular 18', 'ASP.NET Core', 'C#', 'PostgreSQL'],
      links: {
        frontend: 'https://github.com/shubham-2011/Movie-ticket-Frontend',
        backend: 'https://github.com/shubham-2011/Movie-ticket-Backend',
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
      tagline: 'SPRING BOOT • POSTGRESQL CLOUD',
      description:
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock with FIFO logic, and analyze profit.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      tech: ['Spring Boot', 'Java 17', 'Angular 18', 'PostgreSQL'],
      links: {
        frontend: 'https://github.com/shubham-2011/product-management-system-frontend',
        backend: 'https://github.com/shubham-2011/product-management-system-backend',
      },
      features: [
        'FIFO inventory decrement logic & automated alerts',
        'Dynamic profit and revenue analytics',
      ],
    },
    {
      id: '3',
      title: 'APK ELITE',
      subtitle: '(DIGITAL SERVICES AGENCY)',
      tagline: 'SEO OPTIMIZATION • RESPONSIVE UI',
      description:
        'High-performance, SEO-optimized business website developed for an elite service provider to expand online client acquisition and visibility.',
      image:
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=1200',
      tech: ['Angular', 'TypeScript', 'HTML5', 'CSS3'],
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
      tagline: 'DISTRIBUTED SYSTEMS • DOCKER',
      description:
        'Cloud-native distributed commerce backend engineered with asynchronous event streaming, rate-limited API gateway, and resilient PostgreSQL transactions.',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
      tech: ['Spring Boot', 'Java', 'PostgreSQL', 'Docker'],
      links: {
        frontend: 'https://github.com/shubham-2011',
        backend: 'https://github.com/shubham-2011',
      },
      features: [
        'Decoupled microservice architecture with event streaming',
        'Centralized API Gateway with rate limiting & JWT verification',
      ],
    },
    {
      id: '5',
      title: 'DEV SYNC',
      subtitle: '(COLLABORATIVE ENGINE)',
      tagline: 'WEBSOCKETS • REAL-TIME MESH',
      description:
        'Low-latency collaborative workspace supporting live code editing, instant WebSocket messaging, syntax highlighting, and room-based synchronization.',
      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
      tech: ['React 19', 'Node.js', 'WebSockets', 'MongoDB'],
      links: {
        frontend: 'https://github.com/shubham-2011',
        backend: 'https://github.com/shubham-2011',
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
  const [mobileDirection, setMobileDirection] = useState(1);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);

  const goToProject = (newIdx: number) => {
    const targetIdx = (newIdx + projects.length) % projects.length;
    setMobileDirection(targetIdx >= currentIndex ? 1 : -1);
    setCurrentIndex(targetIdx);
  };

  const handleMobileDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 30;
    const velocityThreshold = 200;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      goToProject(currentIndex + 1);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      goToProject(currentIndex - 1);
    }
  };

  // Automatic Smooth Sliding (Pauses on Hover)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isHovered, projects.length]);

  // Mousepad / Touchpad Horizontal Swipe Handler with smooth accumulation
  const lastWheelTime = useRef(0);
  const accumulatedDeltaX = useRef(0);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Only capture clear horizontal swipes (preserves vertical page scroll)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) {
      accumulatedDeltaX.current += e.deltaX;
      const now = Date.now();

      if (Math.abs(accumulatedDeltaX.current) > 30 && now - lastWheelTime.current > 260) {
        if (accumulatedDeltaX.current > 0) {
          setCurrentIndex((prev) => (prev + 1) % projects.length);
        } else {
          setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
        }
        accumulatedDeltaX.current = 0;
        lastWheelTime.current = now;
      }
    }
  };

  // Keyboard navigation (ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % projects.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects.length]);

  // Velocity-aware responsive swipe gesture support
  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 25;
    const velocityThreshold = 250;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      // Slide Left -> advance to next
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      // Slide Right -> go to previous
      setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    }
  };

  // Mobile horizontal snap reel scroll handler
  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    if (!el) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    const children = Array.from(el.children) as HTMLElement[];
    let nearest = 0;
    let nearestDist = Infinity;

    children.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const dist = Math.abs(childCenter - center);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = idx;
      }
    });

    setActiveMobileIdx(nearest);
  };

  const scrollToMobileProject = (idx: number) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;

    const left = Math.max(0, child.offsetLeft - (el.clientWidth - child.clientWidth) / 2);
    el.scrollTo({ left, behavior: 'smooth' });
    setActiveMobileIdx(idx);
  };

  // Keep mobile reel in sync when desktop `currentIndex` changes
  useEffect(() => {
    if (mobileScrollRef.current) {
      scrollToMobileProject(currentIndex);
    }
  }, [currentIndex]);

  // Exact 3D coordinates matching Squarespace with refined depth & opacity
  const getCardProps = (index: number) => {
    let diff = (index - currentIndex) % projects.length;
    if (diff < -Math.floor(projects.length / 2)) diff += projects.length;
    if (diff > Math.floor(projects.length / 2)) diff -= projects.length;

    if (diff === 0) {
      // Center Active Card
      return {
        x: '0%',
        rotateY: 0,
        scale: 1,
        zIndex: 30,
        opacity: 1,
        pointerEvents: 'auto' as const,
      };
    } else if (diff === 1 || diff === -(projects.length - 1)) {
      // Right Card in 3D (Substantially smaller height & scale)
      return {
        x: '72%',
        rotateY: -20,
        scale: 0.70,
        zIndex: 10,
        opacity: 0.4,
        pointerEvents: 'auto' as const,
      };
    } else if (diff === -1 || diff === projects.length - 1) {
      // Left Card in 3D (Substantially smaller height & scale)
      return {
        x: '-72%',
        rotateY: 20,
        scale: 0.70,
        zIndex: 10,
        opacity: 0.4,
        pointerEvents: 'auto' as const,
      };
    } else {
      // Far hidden cards
      return {
        x: diff > 0 ? '120%' : '-120%',
        rotateY: diff > 0 ? -30 : 30,
        scale: 0.55,
        zIndex: 1,
        opacity: 0,
        pointerEvents: 'none' as const,
      };
    }
  };

  return (
    <section
      id="projects"
      aria-label="Featured Software Engineering Projects"
      className="py-16 sm:py-24 bg-black relative overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[500px] bg-white/[0.02] rounded-full blur-[180px] pointer-events-none" />

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
          Squarespace 3D Curved Cylinder &bull; Slide with arrows, swipe, or click side cards
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 📱 EXCLUSIVE MOBILE PROJECTS SNAP-REEL (< md)                             */}
      {/* ========================================================================= */}
      <div className="md:hidden px-4 space-y-4">
        {/* Mobile Horizontal Snap Reel */}
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 no-scrollbar -mx-4 px-4 scroll-smooth"
        >
          {projects.map((project, idx) => (
            <article
              key={project.id || idx}
              itemScope
              itemType="https://schema.org/SoftwareApplication"
              className="w-[86vw] max-w-[340px] shrink-0 snap-center rounded-3xl overflow-hidden border border-white/20 bg-[#0e0e11] shadow-2xl flex flex-col justify-between p-4 relative"
            >
              {/* 1. Mobile Card Top Bar */}
              <div className="flex items-center justify-between text-xs pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-300 font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>0{idx + 1} &bull; {project.title}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  0{idx + 1}/0{projects.length}
                </span>
              </div>

              {/* 2. Dominant Big Screenshot Canvas */}
              <div className="relative w-full h-48 my-3 rounded-2xl overflow-hidden border border-white/15 bg-black">
                <Image
                  src={project.image}
                  alt={`${project.title} — Full Stack Project Architecture & User Interface by Shubham Kumar`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 86vw, 340px"
                  itemProp="image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Tech Pills Overlay */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                  {project.tech.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-black/85 text-zinc-200 border border-white/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Title & Tagline inside Canvas */}
                <div className="absolute bottom-2.5 left-3 right-3 z-10">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none drop-shadow" itemProp="name">
                    {project.title}
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 mt-1">
                    {project.tagline}
                  </p>
                </div>
              </div>

              {/* 3. Description */}
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 my-1" itemProp="description">
                {project.description}
              </p>

              {/* 4. Action Buttons Dock */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 mt-2">
                {project.links?.frontend ? (
                  <a
                    href={project.links.frontend}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    aria-label={`View source code of ${project.title} on GitHub`}
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Code</span>
                  </a>
                ) : (
                  <div className="py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-500 font-mono text-[11px] flex items-center justify-center">
                    Confidential
                  </div>
                )}

                {project.links?.live ? (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                    aria-label={`Visit live demo for ${project.title}`}
                  >
                    <span>Live Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : project.links?.frontend ? (
                  <a
                    href={project.links.frontend}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    aria-label={`Explore repository for ${project.title}`}
                  >
                    <span>Explore</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <div className="py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-500 font-mono text-[11px] flex items-center justify-center">
                    Internal
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Mobile Navigation Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {projects.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToMobileProject(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeMobileIdx === idx ? 'w-6 bg-white' : 'w-1.5 bg-zinc-800'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToMobileProject((activeMobileIdx - 1 + projects.length) % projects.length)}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-90 transition-transform"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToMobileProject((activeMobileIdx + 1) % projects.length)}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-90 transition-transform"
              aria-label="Next project"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP 3D PERSPECTIVE STAGE (hidden on mobile, visible on md:flex)    */}
      {/* ========================================================================= */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onWheel={handleWheel}
        className="hidden md:flex relative w-full max-w-7xl mx-auto h-[500px] sm:h-[560px] lg:h-[590px] items-center justify-center select-none overflow-visible px-4"
        style={{ perspective: '1600px' }}
      >
        {/* Floating Left Arrow Button for Instant Smooth Sliding */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
          }}
          className="absolute left-3 lg:left-6 z-40 p-3.5 rounded-full bg-zinc-950/85 hover:bg-white text-zinc-300 hover:text-black border border-white/20 hover:border-white shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-90 flex items-center justify-center cursor-pointer group"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Floating Right Arrow Button for Instant Smooth Sliding */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev + 1) % projects.length);
          }}
          className="absolute right-3 lg:right-6 z-40 p-3.5 rounded-full bg-zinc-950/85 hover:bg-white text-zinc-300 hover:text-black border border-white/20 hover:border-white shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-90 flex items-center justify-center cursor-pointer group"
          aria-label="Next project"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {projects.map((project, idx) => {
          const cardProps = getCardProps(idx);
          const isCenter = (idx - currentIndex) % projects.length === 0;

          return (
            <motion.article
              key={project.id || idx}
              itemScope
              itemType="https://schema.org/SoftwareApplication"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={handleDragEnd}
              animate={{
                x: cardProps.x,
                rotateY: cardProps.rotateY,
                scale: cardProps.scale,
                opacity: cardProps.opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 28,
                mass: 0.8,
              }}
              onClick={() => {
                if (!isCenter) setCurrentIndex(idx);
              }}
              className="absolute w-[88vw] sm:w-[620px] lg:w-[740px] h-[480px] sm:h-[530px] lg:h-[560px] rounded-[32px] overflow-hidden border border-white/20 bg-[#0c0c0e] shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col justify-between p-5 sm:p-7 cursor-grab active:cursor-grabbing hover:border-white/40"
              style={{
                zIndex: cardProps.zIndex,
                pointerEvents: cardProps.pointerEvents,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                willChange: 'transform, opacity',
              }}
            >
              {/* 1. Card Top Bar */}
              <div className="flex items-center justify-between text-xs text-zinc-300 pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300 font-semibold">
                    PROJECT 0{idx + 1} &bull; {project.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  {project.links?.frontend && (
                    <a
                      href={project.links.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white inline-flex items-center gap-1 text-zinc-400 hover:underline transition-colors"
                      aria-label={`View source code of ${project.title} on GitHub`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}

                  {project.links?.live ? (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all inline-flex items-center gap-1 shadow-sm"
                      aria-label={`Visit live demo for ${project.title}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Live Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : project.links?.frontend ? (
                    <a
                      href={project.links.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all inline-flex items-center gap-1"
                      aria-label={`Explore repository for ${project.title}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              </div>

              {/* 2. DOMINANT BIG IMAGE VISUAL SECTION (HERO CANVAS: 65% OF CARD HEIGHT) */}
              <div className="relative flex-1 my-3 w-full rounded-2xl overflow-hidden border border-white/15 bg-black group/item">
                <Image
                  src={project.image}
                  alt={`${project.title} — Full Stack Project Architecture & User Interface by Shubham Kumar`}
                  fill
                  priority={idx < 2}
                  className="object-cover object-center group-hover/item:scale-105 transition-transform duration-700 brightness-95 group-hover/item:brightness-100"
                  sizes="(max-width: 768px) 90vw, 740px"
                  itemProp="image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Overlay Top Tech Pills */}
                <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/80 backdrop-blur-md text-white border border-white/20 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Overlay Big Bold Title inside the visual canvas */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3
                    className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md"
                    itemProp="name"
                  >
                    {project.title}{' '}
                    <span className="text-xs sm:text-base lg:text-lg font-light text-zinc-300 font-mono block sm:inline mt-1 sm:mt-0">
                      {project.subtitle}
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-300 mt-1">
                    {project.tagline}
                  </p>
                </div>
              </div>

              {/* 3. Card Bottom Bar: Summary Description */}
              <div className="pt-2 border-t border-white/10 shrink-0 flex items-center justify-between text-xs text-zinc-400">
                <p className="line-clamp-1 max-w-[80%] text-zinc-300" itemProp="description">
                  {project.description}
                </p>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                  0{idx + 1} / 0{projects.length}
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Desktop Slide Indicators & Controls Bar */}
      <div className="hidden md:flex mt-8 items-center justify-center gap-5">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-all active:scale-90 cursor-pointer"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {projects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-8 bg-white shadow-md shadow-white/40'
                  : 'w-2 bg-zinc-800 hover:bg-zinc-600'
              }`}
              aria-label={`Jump to project ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % projects.length)}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-all active:scale-90 cursor-pointer"
          aria-label="Next project"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Caption */}
      <div className="mt-4 text-center">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Explore production-ready full stack systems engineered by Shubham
        </p>
      </div>
    </section>
  );
}
