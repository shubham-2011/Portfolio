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
      title: 'Cinema Booking',
      description:
        'Full-stack cinema management platform featuring real-time seat reservation workflows, business revenue analytics, GPS-based discovery, and RBAC.',
      image:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=900',
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
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock with FIFO logic, and analyze profit.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=900',
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
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=900',
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
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=900',
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
      title: 'Real-Time Sync',
      description:
        'Low-latency collaborative workspace supporting live code editing, instant WebSocket messaging, syntax highlighting, and room-based synchronization.',
      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=900',
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
      className="py-16 sm:py-24 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-white/[0.02] rounded-full blur-[170px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Squarespace 3D Showcase</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight animate-text-shimmer">
          Selected Work
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          3D curved perspective &bull; Auto-rotating &bull; Hover to pause
        </p>
      </div>

      {/* ========================================================================= */}
      {/* NARROW TALL CARDS (EXACT SQUARESPACE PROPORTIONS: 460px x 560px)          */}
      {/* ========================================================================= */}
      <div className="w-full relative overflow-visible px-4 sm:px-6">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          speed={850}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          coverflowEffect={{
            rotate: 24,       // Exact 3D inward angle like in Squarespace
            stretch: 0,
            depth: 200,       // Pushes side cards back in 3D perspective
            modifier: 1,
            scale: 0.85,      // Scales side cards down to 85% to perfectly frame center card
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Autoplay]}
          className="w-full py-6 select-none overflow-visible"
        >
          {projects.map((project, idx) => {
            const cleanTitle = project.title
              .replace(/System|Platform|Application|Management/gi, '')
              .trim();

            return (
              <SwiperSlide
                key={project.id || idx}
                /* Narrow width so both Left and Right cards are prominently visible */
                className="w-[78vw] sm:w-[420px] lg:w-[460px] shrink-0"
              >
                {/* Tall, Elegant Poster Card (Directly modeled after Squarespace templates) */}
                <div className="relative w-full h-[500px] sm:h-[560px] rounded-[32px] overflow-hidden border border-white/20 bg-[#0c0c0e] shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between p-6 sm:p-7 group hover:border-white/40 transition-all duration-500">
                  {/* Top Bar: Template Branding & Direct Action Links */}
                  <div className="flex items-center justify-between text-xs text-zinc-300 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                        0{idx + 1} &bull; {project.tech[0] || 'ENGINEERING'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {project.links?.frontend && (
                        <a
                          href={project.links.frontend}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:underline transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}

                      {project.links?.live && (
                        <a
                          href={project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-full bg-white text-black font-bold text-[11px] hover:bg-zinc-200 transition-all inline-flex items-center gap-1"
                        >
                          <span>Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bold Headline (Like "Balance (WELLNESS CENTER)" in Squarespace) */}
                  <div className="pt-2 pb-1 space-y-1">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-none uppercase">
                      {cleanTitle}
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                      PUNE &bull; FULL-STACK ARCHITECTURE
                    </p>
                  </div>

                  {/* Visual Preview Window (High Contrast, Clear Screenshot) */}
                  <div className="relative flex-1 my-3 w-full rounded-2xl overflow-hidden border border-white/10 bg-black group/item">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      priority={idx < 2}
                      className="object-cover group-hover/item:scale-105 transition-transform duration-700 brightness-90 group-hover/item:brightness-100"
                      sizes="460px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Bottom Footer: Description & Tech Stack Badges */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {project.tech.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-zinc-200 border border-white/10 font-mono"
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

      {/* Caption Underneath */}
      <div className="mt-4 text-center">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Continuous 3D rotating showcase &bull; Drag or swipe to interact
        </p>
      </div>
    </section>
  );
}
