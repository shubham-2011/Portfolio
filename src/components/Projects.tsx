'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, PanInfo } from 'framer-motion';
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
        'Full-stack cinema management platform featuring real-time seat reservation workflows, business revenue analytics, GPS-based theater discovery, and RBAC.',
      image:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000',
      tech: ['Angular 18', 'ASP.NET Core', 'C#', 'PostgreSQL', 'JWT'],
      links: {
        frontend: 'https://github.com/Shubham200020/Movie-ticket-Frontend',
        backend: 'https://github.com/Shubham200020/Movie-ticket-Backend',
      },
      features: [
        'Interactive real-time seat reservation workflow',
        'Business analytics module for revenue & ticket sales',
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
        'Inventory tracking with FIFO logic & automated stock alerts',
        'Dynamic profit and revenue analytics dashboards',
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
        'SEO-optimized architecture with structured semantic metadata',
        'Mobile-first responsive design for tablets and mobile devices',
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

  // Automatic Smooth Continuous Carousel Slide Left
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 3800);

    return () => clearInterval(timer);
  }, [isHovered, projects.length]);

  // Handle Drag Gesture
  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      // Swiped Left -> Advance to next
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    } else if (info.offset.x > swipeThreshold) {
      // Swiped Right -> Back to prev
      setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    }
  };

  // Continuous 3D position calculation for each card
  const getCardProps = (index: number) => {
    let diff = (index - currentIndex) % projects.length;
    if (diff < -Math.floor(projects.length / 2)) diff += projects.length;
    if (diff > Math.floor(projects.length / 2)) diff -= projects.length;

    if (diff === 0) {
      // Center Active Card
      return {
        x: 0,
        rotateY: 0,
        scale: 1,
        zIndex: 30,
        opacity: 1,
        pointerEvents: 'auto' as const,
      };
    } else if (diff === 1 || diff === -(projects.length - 1)) {
      // Right Card (Tilted inward to left)
      return {
        x: '75%',
        rotateY: -26,
        scale: 0.84,
        zIndex: 10,
        opacity: 0.8,
        pointerEvents: 'auto' as const,
      };
    } else if (diff === -1 || diff === projects.length - 1) {
      // Left Card (Tilted inward to right)
      return {
        x: '-75%',
        rotateY: 26,
        scale: 0.84,
        zIndex: 10,
        opacity: 0.8,
        pointerEvents: 'auto' as const,
      };
    } else {
      // Far Cards (Prepped behind)
      return {
        x: diff > 0 ? '120%' : '-120%',
        rotateY: diff > 0 ? -35 : 35,
        scale: 0.7,
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
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-white/[0.02] rounded-full blur-[180px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Interactive 3D Showcase</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight animate-text-shimmer">
          Selected Work
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          Smooth continuous 3D glide &bull; Auto-sliding left &bull; Hover to pause
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3D PERSPECTIVE STAGE: CONTINUOUS 60FPS PHYSICAL GLIDE (ZERO BLINKING)     */}
      {/* ========================================================================= */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full max-w-7xl mx-auto h-[530px] sm:h-[600px] flex items-center justify-center select-none overflow-visible px-4"
        style={{ perspective: '1400px' }}
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
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1], // Smooth Apple/Squarespace physics curve
              }}
              onClick={() => {
                if (!isCenter) setCurrentIndex(idx);
              }}
              className="absolute w-[86vw] sm:w-[440px] lg:w-[480px] h-[490px] sm:h-[560px] rounded-[32px] overflow-hidden border border-white/20 bg-[#0c0c0f] shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col justify-between p-6 sm:p-7 cursor-grab active:cursor-grabbing hover:border-white/40"
              style={{
                pointerEvents: cardProps.pointerEvents,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Card Top Nav */}
              <div className="flex items-center justify-between text-xs text-zinc-300 pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">
                    0{idx + 1} &bull; {project.tech[0] || 'ENGINEERING'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {project.links?.frontend && (
                    <a
                      href={project.links.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:underline transition-colors"
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
                      className="px-3 py-1 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all inline-flex items-center gap-1 shadow-md shadow-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : project.links?.frontend ? (
                    <a
                      href={project.links.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Bold Title (Matches Squarespace "Balance (WELLNESS CENTER)") */}
              <div className="pt-2 pb-1 space-y-1 text-left shrink-0">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-none uppercase">
                  {project.title}
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                  {project.subtitle || 'PUNE &bull; FULL-STACK ARCHITECTURE'}
                </p>
              </div>

              {/* Visual Preview Screenshot */}
              <div className="relative flex-1 my-3 w-full rounded-2xl overflow-hidden border border-white/15 bg-black group/item">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  priority={idx < 2}
                  className="object-cover group-hover/item:scale-105 transition-transform duration-700 brightness-95 group-hover/item:brightness-100"
                  sizes="480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-85" />

                {/* Floating Tech Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                  {project.tech.slice(0, 3).map((t) => (
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
              <div className="space-y-3 pt-2 border-t border-white/10 shrink-0">
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {project.tech.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-zinc-200 border border-white/10 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    {idx + 1} / {projects.length}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Slide Indicators */}
      <div className="mt-6 flex items-center justify-center gap-2">
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

      {/* Caption Underneath */}
      <div className="mt-3 text-center">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Squarespace 3D Showcase &bull; Swipe or click side card to slide
        </p>
      </div>
    </section>
  );
}
