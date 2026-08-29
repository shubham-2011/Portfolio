'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Code2, Database, Award, Sparkles } from 'lucide-react';

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
      className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 relative border-t border-zinc-900 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Get To Know Me</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight animate-text-shimmer">
            {title}
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mt-3 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-900 to-black shadow-2xl p-4 flex items-center justify-center group">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src="/shubham-rem.png"
                  alt="Shubham Kumar — Full Stack Software Developer Profile Portrait"
                  fill
                  className="object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                  itemProp="image"
                />
              </div>
            </div>
          </motion.div>

          {/* Text Content & Fast Facts */}
          <motion.article
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                <span itemProp="jobTitle">{subtitle}</span>{' '}
                <span className="animate-text-shimmer font-semibold">{subtitleHighlight}</span>
              </h3>
              <p className="text-zinc-300 leading-relaxed" itemProp="description">{bio}</p>
            </div>

            {/* Quick Contact Specs in Semantic Address Tag */}
            <address className="not-italic grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-3"
                aria-label={`Call Shubham at ${phone}`}
              >
                <div className="p-2.5 rounded-lg bg-white/10 text-white">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Phone</p>
                  <p className="text-sm font-semibold text-white" itemProp="telephone">{phone}</p>
                </div>
              </a>

              <a
                href={`mailto:${email}`}
                className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-3"
                aria-label={`Email Shubham at ${email}`}
              >
                <div className="p-2.5 rounded-lg bg-white/10 text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Email</p>
                  <p className="text-sm font-semibold text-white" itemProp="email">{email}</p>
                </div>
              </a>

              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/10 text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Location</p>
                  <p className="text-sm font-semibold text-white" itemProp="addressLocality">{location}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/10 text-white">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Degree</p>
                  <p className="text-sm font-semibold text-white">{degree}</p>
                </div>
              </div>
            </address>

            {/* Core Competency Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <Code2 className="w-4 h-4" />
                  <h4>Modern Frontend</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Building responsive, accessible SPAs and web apps using Angular, React, Next.js, and modern Tailwind CSS.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <Database className="w-4 h-4" />
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
