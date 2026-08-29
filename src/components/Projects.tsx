'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import { ExternalLink, Github, Sparkles, Layers } from 'lucide-react';

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
      title: 'Cinema Booking & Revenue Hub',
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
      title: 'Product & Inventory Management',
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
      title: 'APK Elite Services',
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
      title: 'Microservices E-Commerce Gateway',
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
      title: 'Real-Time Collaborative Engine',
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

  return (
    <section
      id="projects"
      className="py-14 sm:py-18 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Squarespace 3D Showcase</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight animate-text-shimmer">
          Selected Work
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          3D curved perspective &bull; Auto-rotating &bull; Hover card to pause
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3D COVERFLOW STAGE: VISIBLE FLANKING SIDE CARDS                           */}
      {/* ========================================================================= */}
      <div className="w-full relative overflow-visible px-2 sm:px-4">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          speed={850}
          autoplay={{
            delay: 3400,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          coverflowEffect={{
            rotate: 22,       // Inward angle for visible 3D side framing
            stretch: 0,
            depth: 180,       // Pushes side cards back in 3D perspective
            modifier: 1,
            scale: 0.88,      // Scale down side cards slightly to spotlight center card
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Autoplay]}
          className="w-full py-4 select-none overflow-visible"
        >
          {projects.map((project, idx) => {
            const cleanTitle = project.title
              .replace(/System|Platform|Application|Management/gi, '')
              .trim();

            return (
              <SwiperSlide
                key={project.id || idx}
                className="w-[84vw] sm:w-[560px] lg:w-[640px] shrink-0"
              >
                {/* Widescreen Device / Browser Canvas */}
                <div className="rounded-3xl overflow-hidden border border-white/20 bg-[#0c0c0e] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col group hover:border-white/40 transition-all duration-500">
                  {/* Browser Mockup Header Bar */}
                  <div className="h-10 bg-zinc-900/95 border-b border-white/10 px-4 flex items-center justify-between z-10 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <span className="text-[11px] font-mono text-zinc-400 ml-2">
                        PROJECT 0{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {project.links?.frontend && (
                        <a
                          href={project.links.frontend}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white inline-flex items-center gap-1 text-[11px] text-zinc-400 transition-colors"
                        >
                          <Github className="w-3 h-3" />
                          <span>Code</span>
                        </a>
                      )}

                      {project.links?.live && (
                        <a
                          href={project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-white text-black font-bold text-[11px] hover:bg-zinc-200 transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Visual Project Screenshot Preview Banner */}
                  <div className="relative h-44 sm:h-52 w-full bg-black overflow-hidden border-b border-white/10">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      priority={idx < 2}
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                      sizes="(max-width: 768px) 85vw, 640px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-90" />

                    {/* Floating Tech Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                      {project.tech.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/80 backdrop-blur-md text-white border border-white/15"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Content & Actions */}
                  <div className="p-5 sm:p-6 bg-[#0c0c0e] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                          {cleanTitle || project.title}
                        </h3>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mt-0.5">
                          PUNE &bull; FULL-STACK ARCHITECTURE
                        </p>
                      </div>

                      {project.links?.backend && (
                        <a
                          href={project.links.backend}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-white text-zinc-400 hover:text-white text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Backend</span>
                        </a>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Caption Underneath */}
      <div className="mt-6 text-center">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          3D Showcase &bull; Side cards dynamically rotate into focus
        </p>
      </div>
    </section>
  );
}
