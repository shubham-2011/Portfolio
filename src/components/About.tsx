'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Code2, Database, Award, Sparkles } from 'lucide-react';
import ParticleSphere from './ParticleSphere';

interface AboutProps {
  content?: {
    title?: string;
    subtitle?: string;
    subtitleHighlight?: string;
    bio?: string;
    phone?: string;
    email?: string;
    location?: string;
    degree?: string;
  };
}

export default function About({ content }: AboutProps) {
  const title = content?.title || 'About Me';
  const subtitle = content?.subtitle || 'Full Stack Developer';
  const subtitleHighlight = content?.subtitleHighlight || '& Data Driven Engineer';
  const bio =
    content?.bio ||
    "I am an enthusiastic and detail-oriented software developer with a strong foundation in programming, problem-solving, and DSA algorithms. Having graduated with a Bachelor's Degree in Computer Science and currently pursuing MSc in Computer Science at Indira University, Pune, I specialize in architecting scalable, resilient web applications.";
  const phone = content?.phone || '+91 9322887529';
  const email = content?.email || 'shubhammisra800@gmail.com';
  const location = content?.location || 'Pune, Maharashtra, India';
  const degree = content?.degree || 'BSc & MSc Computer Science';

  return (
    <section
      id="about"
      aria-label="About Shubham Kumar - Full Stack Developer"
      itemScope
      itemType="https://schema.org/Person"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative border-t border-zinc-900 overflow-hidden"
    >
      {/* 🌌 Squarespace Celestial 3D Stardust Particle Sphere Background */}
      <ParticleSphere particleCount={2200} speed={1.2} radiusFactor={0.48} className="opacity-100 z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-widest mb-3 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Get To Know Me</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight animate-text-shimmer">
            {title}
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mt-3 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Refined Small Photo Frame (Compact & elegant) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 flex flex-col items-center justify-center text-center"
          >
            <div className="relative group">
              {/* Outer Subtle Halo Glow */}
              <div className="absolute -inset-3 bg-gradient-to-r from-white/20 via-zinc-400/20 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition duration-700 pointer-events-none" />

              {/* Compact Circular Portrait Capsule (Small size as requested) */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-white/30 bg-zinc-950/80 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-1.5 backdrop-blur-md group-hover:border-white/50 transition-colors duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-black/60">
                  <Image
                    src="/shubham-rem.png"
                    alt="Shubham Kumar — Full Stack Software Developer Profile Portrait"
                    fill
                    className="object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 144px, 176px"
                    itemProp="image"
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 px-3.5 py-1 rounded-full bg-zinc-950/90 border border-white/20 backdrop-blur-md inline-flex items-center gap-2 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                  Full Stack Engineer
                </span>
              </div>
            </div>
          </motion.div>

          {/* Text Content & Quick Info Cards */}
          <motion.article
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-8 space-y-6"
          >
            <div className="space-y-2.5">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                <span itemProp="jobTitle">{subtitle}</span>{' '}
                <span className="animate-text-shimmer font-semibold">{subtitleHighlight}</span>
              </h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed" itemProp="description">
                {bio}
              </p>
            </div>

            {/* Quick Contact Specs with Glassmorphism */}
            <address className="not-italic grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/75 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all flex items-center gap-3 group/link"
                aria-label={`Call Shubham at ${phone}`}
              >
                <div className="p-2.5 rounded-xl bg-white/10 text-white group-hover/link:scale-110 transition-transform">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-white group-hover/link:text-zinc-200" itemProp="telephone">
                    {phone}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${email}`}
                className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/75 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all flex items-center gap-3 group/link"
                aria-label={`Email Shubham at ${email}`}
              >
                <div className="p-2.5 rounded-xl bg-white/10 text-white group-hover/link:scale-110 transition-transform">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-white group-hover/link:text-zinc-200" itemProp="email">
                    {email}
                  </p>
                </div>
              </a>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/75 border border-white/10 backdrop-blur-md flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-white">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-white" itemProp="addressLocality">
                    {location}
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/75 border border-white/10 backdrop-blur-md flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-white">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Degree</p>
                  <p className="text-sm font-semibold text-white">
                    {degree}
                  </p>
                </div>
              </div>
            </address>

            {/* Core Competency Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/75 backdrop-blur-md hover:border-white/25 transition-colors">
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <Code2 className="w-4 h-4 text-white" />
                  <h4>Modern Frontend</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Building responsive, accessible SPAs and web apps using Angular, React, Next.js, and modern Tailwind CSS.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/75 backdrop-blur-md hover:border-white/25 transition-colors">
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <Database className="w-4 h-4 text-white" />
                  <h4>Robust Backend & APIs</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Designing microservices, RESTful APIs, and relational/NoSQL schemas with Java, Spring Boot, ASP.NET, PostgreSQL, and MongoDB.
                </p>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
