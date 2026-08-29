'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Sparkles } from 'lucide-react';

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
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
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
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock with FIFO logic, and analyze financial performance.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
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
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=800',
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
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
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
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
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

  const rawProjects = passedProjects && passedProjects.length > 0 ? passedProjects : defaultProjects;
  // Duplicate array for seamless infinite auto-scroll loop
  const displayProjects = [...rawProjects, ...rawProjects];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Automatic Smooth Continuous Horizontal Scroll
  useEffect(() => {
    let animId: number;
    const speed = 0.85; // smooth luxury glide speed

    const animateScroll = () => {
      if (scrollRef.current && !isHovered) {
        scrollRef.current.scrollLeft += speed;

        // When halfway through the duplicated list, seamless loop back
        const maxScroll = scrollRef.current.scrollWidth / 2;
        if (scrollRef.current.scrollLeft >= maxScroll) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(animateScroll);
    };

    animId = requestAnimationFrame(animateScroll);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  return (
    <section
      id="projects"
      className="py-14 sm:py-16 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Featured Showcase</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight animate-text-shimmer">
            Selected Work
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Auto-scrolling showcase &bull; Hover to pause
          </p>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* COMPACT SQUARESPACE AUTO-SCROLLING TRACK                                 */}
      {/* ========================================================================= */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="w-full overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing px-4 sm:px-8 flex gap-6 sm:gap-8 items-stretch"
      >
        {displayProjects.map((project, idx) => {
          const originalIdx = (idx % rawProjects.length) + 1;
          const displayTitle = project.title
            .toUpperCase()
            .replace(/SYSTEM|PLATFORM|APPLICATION/g, '')
            .trim();

          return (
            <div
              key={`${project.id || idx}-${idx}`}
              className="w-[82vw] sm:w-[500px] lg:w-[560px] shrink-0 rounded-2xl sm:rounded-3xl bg-[#0d0d10] border border-white/10 p-5 sm:p-7 shadow-xl flex flex-col justify-between select-none hover:border-white/30 transition-all duration-300 group"
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>PROJECT 0{originalIdx}</span>
                </span>

                <div className="flex items-center gap-3">
                  {project.links?.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
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
                      className="hover:text-white inline-flex items-center gap-1 text-[11px]"
                    >
                      <Github className="w-3 h-3" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Bold Title (Balanced Squarespace Heading) */}
              <div className="py-5 text-center space-y-2">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase leading-tight">
                  {displayTitle || project.title}
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                  FULL-STACK ARCHITECTURE
                </p>
                <p className="text-xs text-zinc-300 line-clamp-2 max-w-md mx-auto leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Bottom Compact 3-Column Preview Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/10">
                {/* Visual Thumbnail */}
                <div className="relative h-24 sm:h-28 rounded-xl overflow-hidden bg-black border border-white/10 group/item">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover/item:scale-105 transition-transform duration-500 brightness-90 group-hover/item:brightness-100"
                    sizes="300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 text-[10px] font-mono text-white font-semibold">
                    01 OVERVIEW
                  </div>
                </div>

                {/* Tech Stack Badges */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                    02 TECH STACK
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {project.tech.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white border border-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                    03 ACTION
                  </span>
                  <div>
                    {project.links?.live ? (
                      <a
                        href={project.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-1.5 px-2 rounded-lg bg-white text-black text-center text-xs font-bold hover:bg-zinc-200 transition-colors"
                      >
                        Live Demo
                      </a>
                    ) : project.links?.frontend ? (
                      <a
                        href={project.links.frontend}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-1.5 px-2 rounded-lg bg-white text-black text-center text-xs font-bold hover:bg-zinc-200 transition-colors"
                      >
                        Explore Code
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-400">Production Ready</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
