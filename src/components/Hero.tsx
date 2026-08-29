'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, FileText, ArrowDown, Sparkles } from 'lucide-react';

interface HeroProps {
  content?: {
    status?: string;
    name?: string;
    title?: string;
    description?: string;
    yearsExperience?: string;
    technologiesCount?: string;
    clientSatisfaction?: string;
    profileImage?: string;
    resumeUrl?: string;
  };
}

export default function Hero({ content }: HeroProps) {
  const status = content?.status || 'Available for Opportunities';
  const name = content?.name || 'Shubham';
  const title = content?.title || 'Full Stack Software Developer';
  const description =
    content?.description ||
    'Computer Engineer specializing in full-stack architecture. I design and build high-performance, scalable applications using Java, Spring Boot, PostgreSQL, Angular, React & Cloud.';
  const yearsExperience = content?.yearsExperience || '2+';
  const technologiesCount = content?.technologiesCount || '10+';
  const clientSatisfaction = content?.clientSatisfaction || '100%';
  const profileImage = content?.profileImage || '/Skills/shubham3-rm.png';
  const resumeUrl = content?.resumeUrl || '/CV.png';

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black"
    >
      {/* Background Decorative Monochrome Grid & Ambient Light */}
      <div className="absolute inset-0 bg-grid-white [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none opacity-70" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-zinc-700/[0.1] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-zinc-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>{status}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            I&apos;m{' '}
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              {name}
            </span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl text-zinc-400 font-semibold">
              {title}
            </span>
          </h1>

          <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            {description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <a
              href="mailto:shubhammisra800@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-bold shadow-lg shadow-white/10 hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </a>

            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-white/10 text-white font-semibold hover:border-white hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white backdrop-blur-md"
            >
              <FileText className="w-4 h-4 text-zinc-300" />
              <span>Download Resume</span>
            </a>

            <Link
              href="#projects"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              <span>Explore Projects</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </Link>
          </div>

          {/* Highlights Mini Grid */}
          <div className="pt-6 border-t border-zinc-800 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <div>
              <p className="text-2xl font-bold text-white">{yearsExperience}</p>
              <p className="text-xs text-zinc-400">Years Learning & Dev</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-200">{technologiesCount}</p>
              <p className="text-xs text-zinc-400">Core Technologies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{clientSatisfaction}</p>
              <p className="text-xs text-zinc-400">Client Focused</p>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Image Avatar Card */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative group">
            {/* Outer Glow Ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-white/20 to-zinc-600/30 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

            {/* Avatar Frame */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-2 border-white/20 bg-zinc-950 shadow-2xl">
              <Image
                src={profileImage}
                alt={`${name} - ${title}`}
                fill
                priority
                className="object-cover object-top p-2"
                sizes="(max-width: 768px) 256px, 320px"
              />
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-0 px-4 py-2 rounded-xl bg-zinc-950/90 border border-white/20 backdrop-blur-md shadow-xl flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Status</p>
                <p className="text-xs font-semibold text-white">Open to Work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
