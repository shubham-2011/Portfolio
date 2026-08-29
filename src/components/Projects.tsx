'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, PanInfo } from 'framer-motion';
import { ExternalLink, Github, Sparkles } from 'lucide-react';

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
      tagline: 'SPRING BOOT • POSTGRESQL CLOUD',
      description:
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock with FIFO logic, and analyze profit.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      tech: ['Spring Boot', 'Java 17', 'Angular 18', 'PostgreSQL'],
      links: {
        frontend: 'https://github.com/Shubham200020/product-management-system-frontend',
        backend: 'https://github.com/Shubham200020/product-management-system-backend',
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
      title: 'DEV SYNC',
      subtitle: '(COLLABORATIVE ENGINE)',
      tagline: 'WEBSOCKETS • REAL-TIME MESH',
      description:
        'Low-latency collaborative workspace supporting live code editing, instant WebSocket messaging, syntax highlighting, and room-based synchronization.',
      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
      tech: ['React 19', 'Node.js', 'WebSockets', 'MongoDB'],
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

  // Automatic Smooth Sliding (Pauses on Hover)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [isHovered, projects.length]);

  // Mousepad / Touchpad Scroll Handler (Two-finger swipe & wheel)
  const lastWheelTime = React.useRef(0);
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    // 380ms cooldown to smoothly advance card-by-card on touchpad flick
    if (now - lastWheelTime.current < 380) return;

    // Detect horizontal touchpad swipe
    if (Math.abs(e.deltaX) > 18) {
      if (e.deltaX > 18) {
        // Swiped left on trackpad -> Next project
        setCurrentIndex((prev) => (prev + 1) % projects.length);
        lastWheelTime.current = now;
      } else if (e.deltaX < -18) {
        // Swiped right on trackpad -> Prev project
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
        lastWheelTime.current = now;
      }
    }
    // Also detect vertical wheel scroll when over the carousel
    else if (Math.abs(e.deltaY) > 25) {
      if (e.deltaY > 25) {
        setCurrentIndex((prev) => (prev + 1) % projects.length);
        lastWheelTime.current = now;
      } else if (e.deltaY < -25) {
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
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

  // Swipe gesture support
  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    } else if (info.offset.x > swipeThreshold) {
      setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    }
  };

  // Exact 3D coordinates matching Squarespace
  const getCardProps = (index: number) => {
    let diff = (index - currentIndex) % projects.length;
    if (diff < -Math.floor(projects.length / 2)) diff += projects.length;
    if (diff > Math.floor(projects.length / 2)) diff -= projects.length;

    if (diff === 0) {
      // Center Active Card: Flat, elevated, spotlight
      return {
        x: '0%',
        rotateY: 0,
        scale: 1,
        zIndex: 30,
        opacity: 1,
        pointerEvents: 'auto' as const,
      };
    } else if (diff === 1 || diff === -(projects.length - 1)) {
      // Right Card: Tilted inward at -24deg, seamlessly framing center card
      return {
        x: '62%',
        rotateY: -24,
        scale: 0.88,
        zIndex: 10,
        opacity: 0.85,
        pointerEvents: 'auto' as const,
      };
    } else if (diff === -1 || diff === projects.length - 1) {
      // Left Card: Tilted inward at +24deg, seamlessly framing center card
      return {
        x: '-62%',
        rotateY: 24,
        scale: 0.88,
        zIndex: 10,
        opacity: 0.85,
        pointerEvents: 'auto' as const,
      };
    } else {
      // Far hidden cards
      return {
        x: diff > 0 ? '110%' : '-110%',
        rotateY: diff > 0 ? -35 : 35,
        scale: 0.75,
        zIndex: 1,
        opacity: 0,
        pointerEvents: 'none' as const,
      };
    }
  };

  return (
    <section
      id="projects"
      className="py-16 sm:py-24 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background Ambient Spotlight */}
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
          Squarespace 3D curved cylinder &bull; Auto-sliding left &bull; Hover to pause
        </p>
      </div>

      {/* ========================================================================= */}
      {/* EXACT SQUARESPACE 3D STAGE (WIDESCREEN TABLET CANVASES WITH 3D OVERLAP)   */}
      {/* ========================================================================= */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onWheel={handleWheel}
        className="relative w-full max-w-7xl mx-auto h-[480px] sm:h-[530px] lg:h-[560px] flex items-center justify-center select-none overflow-visible px-4"
        style={{ perspective: '1600px' }}
      >
        {projects.map((project, idx) => {
          const cardProps = getCardProps(idx);
          const isCenter = (idx - currentIndex) % projects.length === 0;

          return (
            <motion.div
              key={project.id || idx}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              animate={{
                x: cardProps.x,
                rotateY: cardProps.rotateY,
                scale: cardProps.scale,
                zIndex: cardProps.zIndex,
                opacity: cardProps.opacity,
              }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1], // Smooth Squarespace physical inertia
              }}
              onClick={() => {
                if (!isCenter) setCurrentIndex(idx);
              }}
              className="absolute w-[88vw] sm:w-[620px] lg:w-[740px] h-[450px] sm:h-[500px] lg:h-[530px] rounded-[32px] overflow-hidden border border-white/20 bg-[#0c0c0e] shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col justify-between p-6 sm:p-8 lg:p-9 cursor-grab active:cursor-grabbing hover:border-white/40"
              style={{
                pointerEvents: cardProps.pointerEvents,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 1. Top Navigation Bar (Identical to Squarespace Template Nav) */}
              <div className="flex items-center justify-between text-xs text-zinc-300 pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300 font-semibold">
                    {project.title} STUDIO
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  {project.links?.frontend && (
                    <a
                      href={project.links.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white inline-flex items-center gap-1 text-zinc-400 hover:underline transition-colors"
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              </div>

              {/* 2. Huge Squarespace Editorial Typography (Identical to "LIO AGENCY" / "Balance") */}
              <div className="py-4 sm:py-6 text-center space-y-2 shrink-0">
                <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none">
                  {project.title}{' '}
                  <span className="text-sm sm:text-xl lg:text-2xl font-light text-zinc-400 font-mono block sm:inline mt-1 sm:mt-0">
                    {project.subtitle}
                  </span>
                </h3>

                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-400 pt-1">
                  {project.tagline}
                </p>
              </div>

              {/* 3. Bottom 3-Column Preview Gallery (Identical to 01, 02, 03 in Squarespace) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 shrink-0">
                {/* Column 1: Main Project Screenshot Banner */}
                <div className="relative h-24 sm:h-28 rounded-2xl overflow-hidden bg-black border border-white/10 group/item">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    priority={idx < 2}
                    className="object-cover group-hover/item:scale-105 transition-transform duration-700 brightness-90 group-hover/item:brightness-100"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white">
                    <span className="font-bold">01 VIEW DEMO</span>
                    <span className="text-zinc-400 text-[9px]">&rarr;</span>
                  </div>
                </div>

                {/* Column 2: Tech Stack Badges */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    02 TECH STACK
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white border border-white/15 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Column 3: Highlights & Deliverable */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    03 ARCHITECTURE
                  </span>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Slide Indicators */}
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

      {/* Bottom Caption (Matches "Join millions of entrepreneurs..." from Squarespace) */}
      <div className="mt-4 text-center">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Explore production-ready full stack systems engineered by Shubham
        </p>
      </div>
    </section>
  );
}
