'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Sparkles, ArrowRight } from 'lucide-react';

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
        'Full-stack cinema management ecosystem featuring real-time seat reservation workflows, business revenue analytics, GPS-based theater discovery, and RBAC.',
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
        'GPS-based theater discovery using Geolocation APIs',
      ],
    },
    {
      id: '2',
      title: 'Product & Inventory Management',
      description:
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock with FIFO logic, and analyze financial performance.',
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
        'Secure JWT-based authentication with role-based access control',
      ],
    },
    {
      id: '3',
      title: 'APK Elite Services',
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
        'Ultra-fast load times and optimized Core Web Vitals',
      ],
    },
    {
      id: '4',
      title: 'Microservices E-Commerce Gateway',
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
        'High-throughput PostgreSQL schema with ACID compliance',
      ],
    },
    {
      id: '5',
      title: 'Real-Time Collaborative Engine',
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
        'Full syntax highlighting and auto-completion code editor',
      ],
    },
  ];

  const projects = passedProjects && passedProjects.length > 0 ? passedProjects : defaultProjects;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel horizontal scroll handler for seamless desktop scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      // If user is scrolling vertically with wheel, translate to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <section
      id="projects"
      className="py-24 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background Ambient Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-white/[0.02] rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Featured Portfolio Showcase</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight animate-text-shimmer">
            Selected Work
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Swipe or scroll horizontally through production systems and web architectures.
          </p>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* SQUARESPACE-STYLE SMOOTH HORIZONTAL SCROLL STAGE (BUTTONS NOT REQUIRED)  */}
      {/* ========================================================================= */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing px-6 sm:px-12 lg:px-20 pb-8 flex gap-8 sm:gap-12 items-stretch snap-x snap-mandatory"
      >
        {projects.map((project, idx) => {
          // Format large stylized title like "LIO AGENCY"
          const displayTitle = project.title
            .toUpperCase()
            .replace(/SYSTEM|PLATFORM|APPLICATION/g, '')
            .trim();

          return (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="w-[88vw] sm:w-[78vw] lg:w-[68vw] max-w-5xl shrink-0 snap-center rounded-[2rem] sm:rounded-[2.5rem] bg-[#0c0c0e] border border-white/15 p-6 sm:p-10 lg:p-12 shadow-2xl flex flex-col justify-between select-none relative group hover:border-white/30 transition-all duration-500"
            >
              {/* Card Top Mini Bar (like Squarespace template header) */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5 text-xs text-zinc-400 font-mono uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>PROJECT 0{idx + 1}</span>
                </span>

                <div className="flex items-center gap-4">
                  {project.links?.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Live Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {project.links?.frontend && (
                    <a
                      href={project.links.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white inline-flex items-center gap-1"
                    >
                      <Github className="w-3 h-3" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Huge Bold Stylized Title (Identical to "LIO AGENCY" in Squarespace) */}
              <div className="py-8 sm:py-12 text-center space-y-4">
                <h3 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight uppercase leading-none">
                  {displayTitle || project.title}
                </h3>

                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-400">
                    PUNE / FULL-STACK ARCHITECTURE
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Bottom 3-Column Preview Gallery Row (like 01 VIEW PROJECT, 02, 03 in Squarespace) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t border-white/10">
                {/* Column 1: Main Visual Mockup */}
                <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-black border border-white/10 group/item">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover/item:scale-105 transition-transform duration-700 brightness-85 group-hover/item:brightness-100"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white">
                    <span className="font-bold">01 OVERVIEW</span>
                    <span className="text-zinc-400">VIEW</span>
                  </div>
                </div>

                {/* Column 2: Tech Stack Badges */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                      02 TECH STACK
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/15"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">SCALABLE ARCHITECTURE</p>
                </div>

                {/* Column 3: Key Deliverables & Direct Access */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                      03 HIGHLIGHTS
                    </span>
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {project.features?.[0] || 'High performance end-to-end user workflows.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {project.links?.live ? (
                      <a
                        href={project.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-white text-black text-center text-xs font-bold hover:bg-zinc-200 transition-colors"
                      >
                        Launch App
                      </a>
                    ) : project.links?.frontend ? (
                      <a
                        href={project.links.frontend}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-white text-black text-center text-xs font-bold hover:bg-zinc-200 transition-colors"
                      >
                        Explore Code
                      </a>
                    ) : null}

                    {project.links?.backend && (
                      <a
                        href={project.links.backend}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                        title="Backend Repo"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Subtle Scroll Hint (No Buttons) */}
      <div className="mt-8 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
          <span>Scroll horizontally or swipe to discover more</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
        </p>
      </div>
    </section>
  );
}
