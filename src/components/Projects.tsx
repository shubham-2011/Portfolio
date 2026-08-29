'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import { ExternalLink, Github, Sparkles } from 'lucide-react';

// Swiper core & coverflow styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';

export interface Project {
  id?: string;
  title: string;
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
      title: 'Cinema Hub',
      description:
        'A full-stack cinema management platform creating dynamic reservation workflows, analytics, and business resilience.',
      image:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
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
      title: 'Inventory Ops',
      description:
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock, and analyze profit.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
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
      title: 'APK Elite',
      description:
        'High-performance, SEO-optimized business website developed for an elite service provider to expand online client acquisition and visibility.',
      image:
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=1200',
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
      title: 'Commerce Gateway',
      description:
        'Cloud-native distributed commerce backend engineered with asynchronous event streaming, rate-limited API gateway, and resilient PostgreSQL transactions.',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
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
      title: 'Sync Engine',
      description:
        'Low-latency collaborative workspace supporting live code editing, instant WebSocket messaging, syntax highlighting, and room-based synchronization.',
      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
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

  return (
    <section
      id="projects"
      className="py-16 sm:py-20 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Squarespace 3D Coverflow Showcase</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight animate-text-shimmer">
          Selected Work
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          3D curved perspective &bull; Automatically rotating &bull; Hover to pause
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SWIPER 3D COVERFLOW PERSPECTIVE STAGE (IDENTICAL TO SQUARESPACE HERO)    */}
      {/* ========================================================================= */}
      <div className="w-full relative px-2 sm:px-4">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          speed={900}
          autoplay={{
            delay: 3200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          coverflowEffect={{
            rotate: 24,       // Exact 3D inward angle matching Squarespace screenshot
            stretch: 0,
            depth: 260,       // 3D depth pushing side cards back
            modifier: 1,
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Autoplay]}
          className="w-full py-6 select-none"
        >
          {projects.map((project, idx) => {
            // Split title for high-fashion Squarespace typography
            const cleanTitle = project.title
              .replace(/System|Platform|Application|Management/gi, '')
              .trim();

            return (
              <SwiperSlide
                key={project.id || idx}
                className="w-[86vw] sm:w-[620px] lg:w-[720px] shrink-0"
              >
                {/* 3D Curved Mockup Card (Styled directly after Squarespace hero canvas) */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9.5] w-full rounded-2xl sm:rounded-[32px] overflow-hidden border border-white/20 bg-[#0d0d10] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between p-6 sm:p-9 group">
                  {/* Full-Bleed Card Background Photo with Smooth Vignette */}
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    priority={idx < 2}
                    className="object-cover object-center brightness-[0.45] group-hover:brightness-[0.55] transition-all duration-700 -z-10"
                    sizes="(max-width: 768px) 90vw, 750px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 -z-10" />

                  {/* Card Header (Matches "Services Facilities Memberships Bookings ->" from screenshot) */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-300 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-white/90">
                        {project.tech[0] || 'FULL STACK'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      {project.links?.frontend && (
                        <a
                          href={project.links.frontend}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white inline-flex items-center gap-1 text-zinc-300 transition-colors"
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
                          className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all inline-flex items-center gap-1 shadow-md shadow-white/10"
                        >
                          <span>Live Site</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : project.links?.frontend ? (
                        <a
                          href={project.links.frontend}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all inline-flex items-center gap-1 backdrop-blur-md"
                        >
                          <span>Explore</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Center: Massive Squarespace Brand Typography (Like "Balance (WELLNESS CENTER)") */}
                  <div className="py-2 space-y-2 text-left">
                    <h3 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none">
                      {cleanTitle}{' '}
                      <span className="text-base sm:text-2xl font-light text-zinc-400 font-mono block sm:inline mt-1 sm:mt-0">
                        (ARCHITECTURE)
                      </span>
                    </h3>
                  </div>

                  {/* Card Footer (Matches bottom metadata in Squarespace screenshot) */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-4 border-t border-white/15">
                    <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {project.tech.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Subtle Caption Underneath (Like "Join millions of entrepreneurs..." in Squarespace screenshot) */}
      <div className="mt-6 text-center">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Continuous 3D rotating showcase &bull; Drag or swipe to interact
        </p>
      </div>
    </section>
  );
}
