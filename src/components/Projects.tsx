'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

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
      title: 'Movie Booking & Cinema Revenue System',
      description:
        'Full-stack cinema management platform featuring an end-to-end seat reservation workflow, business revenue analytics, GPS-based theater discovery, and role-based access control.',
      image:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
      tech: ['Angular 18', 'ASP.NET Core', 'C#', 'PostgreSQL', 'JWT', 'RxJS', 'EF Core'],
      links: {
        frontend: 'https://github.com/Shubham200020/Movie-ticket-Frontend',
        backend: 'https://github.com/Shubham200020/Movie-ticket-Backend',
      },
      features: [
        'Interactive real-time seat reservation workflow',
        'Admin dashboard for movie, theater, and showtime management',
        'Business analytics module for revenue & ticket sales',
        'GPS-based theater discovery with Geolocation APIs',
      ],
    },
    {
      id: '2',
      title: 'Product & Inventory Management System',
      description:
        'Enterprise inventory and sales tracking application helping shopkeepers manage product catalogs, track real-time stock with FIFO logic, and analyze financial performance.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      tech: [
        'Spring Boot',
        'Java 17',
        'Angular 18',
        'PostgreSQL',
        'JWT',
        'Hibernate',
        'Spring Data JPA',
      ],
      links: {
        frontend: 'https://github.com/Shubham200020/product-management-system-frontend',
        backend: 'https://github.com/Shubham200020/product-management-system-backend',
      },
      features: [
        'Inventory tracking with FIFO logic & automated stock alerts',
        'Dynamic profit and revenue analytics dashboards',
        'Secure JWT-based authentication with role-based access control',
        'Automated sales pricing and discount management',
      ],
    },
    {
      id: '3',
      title: 'APK Elite Services (Freelance)',
      description:
        'High-performance, SEO-optimized business website developed for an elite service provider to expand online client acquisition and visibility.',
      image:
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=1200',
      tech: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'SEO Optimization', 'Responsive Design'],
      links: {
        live: 'https://www.apkeliteservices.in/',
      },
      features: [
        'SEO-optimized architecture with structured semantic metadata',
        'Mobile-first responsive design for tablets and mobile devices',
        'Ultra-fast load times and optimized Core Web Vitals',
        'Collaborative UI tailored to client brand requirements',
      ],
    },
  ];

  const projects = passedProjects && passedProjects.length > 0 ? passedProjects : defaultProjects;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'showcase' | 'grid'>('showcase');

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'showcase') return;
      if (e.key === 'ArrowRight') nextProject();
      if (e.key === 'ArrowLeft') prevProject();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, projects.length]);

  const activeProject = projects[currentIndex];

  const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
  const nextIndex = (currentIndex + 1) % projects.length;

  return (
    <section
      id="projects"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background Ambient Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/[0.03] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Squarespace Style Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Featured Work
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
              Immersive, interactive portfolio showcase presenting production-ready full stack
              systems and high-impact web architectures.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start md:self-auto">
            <button
              onClick={() => setViewMode('showcase')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'showcase'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Showcase</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MODE 1: SQUARESPACE 3D CAROUSEL STAGE (WHITE & BLACK)             */}
        {/* ================================================================= */}
        {viewMode === 'showcase' && (
          <div className="space-y-8">
            <div className="relative h-[480px] sm:h-[580px] lg:h-[640px] flex items-center justify-center perspective-[1200px] select-none">
              {/* Flank Left Card */}
              <div
                onClick={prevProject}
                className="hidden md:block absolute left-[-4%] lg:left-[2%] w-[42%] h-[80%] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/60 shadow-2xl opacity-40 hover:opacity-75 scale-[0.84] -rotate-y-[12deg] transition-all duration-500 cursor-pointer z-10 group"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={projects[prevIndex].image}
                    alt={projects[prevIndex].title}
                    fill
                    className="object-cover brightness-50 group-hover:brightness-75 transition-all"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Previous</p>
                    <p className="text-sm font-bold text-white truncate">{projects[prevIndex].title}</p>
                  </div>
                </div>
              </div>

              {/* Center Active Showcase Card */}
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full md:w-[78%] lg:w-[68%] h-[100%] rounded-3xl overflow-hidden border border-white/20 bg-zinc-950 shadow-[0_25px_60px_-15px_rgba(255,255,255,0.12)] flex flex-col z-20 group"
              >
                {/* Browser Mockup Header */}
                <div className="h-11 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between z-10 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  </div>
                  <div className="px-4 py-1 rounded-full bg-black/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 truncate max-w-[240px] sm:max-w-xs">
                    https://shubham.dev/project/{activeProject.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {currentIndex + 1} / {projects.length}
                  </span>
                </div>

                {/* Card Visual Hero Screenshot */}
                <div className="relative flex-1 w-full bg-black overflow-hidden">
                  <Image
                    src={activeProject.image}
                    alt={activeProject.title}
                    fill
                    priority
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 900px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

                  {/* Floating Tech Badges */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-1.5 z-10">
                    {activeProject.tech.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom Details Bar */}
                <div className="p-6 sm:p-8 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 space-y-4 shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {activeProject.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl line-clamp-2">
                        {activeProject.description}
                      </p>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {activeProject.links?.live && (
                        <a
                          href={activeProject.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md shadow-white/10 hover:scale-105 active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Site</span>
                        </a>
                      )}

                      {activeProject.links?.frontend && (
                        <a
                          href={activeProject.links.frontend}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-white/10 text-white text-xs font-semibold hover:border-white transition-all hover:scale-105 active:scale-95"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Frontend</span>
                        </a>
                      )}

                      {activeProject.links?.backend && (
                        <a
                          href={activeProject.links.backend}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-white/10 text-white text-xs font-semibold hover:border-white transition-all hover:scale-105 active:scale-95"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Backend</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Flank Right Card */}
              <div
                onClick={nextProject}
                className="hidden md:block absolute right-[-4%] lg:right-[2%] w-[42%] h-[80%] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/60 shadow-2xl opacity-40 hover:opacity-75 scale-[0.84] rotate-y-[12deg] transition-all duration-500 cursor-pointer z-10 group"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={projects[nextIndex].image}
                    alt={projects[nextIndex].title}
                    fill
                    className="object-cover brightness-50 group-hover:brightness-75 transition-all"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Next</p>
                    <p className="text-sm font-bold text-white truncate">{projects[nextIndex].title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls Bar */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                onClick={prevProject}
                className="p-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:border-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous Project"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {projects.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx
                        ? 'w-8 bg-white shadow-md shadow-white/40'
                        : 'w-2 bg-zinc-800 hover:bg-zinc-600'
                    }`}
                    aria-label={`Jump to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextProject}
                className="p-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:border-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next Project"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 2: CLASSIC HIGH-CONTRAST GRID VIEW (WHITE & BLACK)           */}
        {/* ================================================================= */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <article
                key={project.id || project.title || index}
                className="flex flex-col rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="relative h-52 w-full overflow-hidden bg-black">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-white/5 text-zinc-200 border border-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-zinc-200 transition-colors leading-snug">
                      {project.title}
                    </h3>

                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {project.features && project.features.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <p className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                          Key Features
                        </p>
                        <ul className="space-y-1">
                          {project.features.slice(0, 3).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex flex-wrap gap-2.5">
                    {project.links?.live && (
                      <a
                        href={project.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Site</span>
                      </a>
                    )}

                    {project.links?.frontend && (
                      <a
                        href={project.links.frontend}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Frontend</span>
                      </a>
                    )}

                    {project.links?.backend && (
                      <a
                        href={project.links.backend}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Backend</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
