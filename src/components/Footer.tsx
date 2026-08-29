'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Instagram, Twitter, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/Shubham200020',
      icon: <Github className="w-5 h-5" />,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/shubham-kumar-48b57023b/',
      icon: <Linkedin className="w-5 h-5" />,
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com/shubhammisra800',
      icon: <Twitter className="w-5 h-5" />,
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/skm.20.11',
      icon: <Instagram className="w-5 h-5" />,
    },
  ];

  return (
    <footer className="bg-black border-t border-zinc-900 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-8 text-center">
        {/* Brand */}
        <div className="space-y-2">
          <span className="text-2xl font-black text-white tracking-wider">
            SKM <span className="text-zinc-500 font-normal">Portfolio</span>
          </span>
          <p className="text-xs text-zinc-400 max-w-md">
            Full Stack Software Developer specializing in Java, Spring Boot, PostgreSQL, Angular, React & Cloud Solutions.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white/40 hover:scale-110 hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
              aria-label={item.name}
            >
              {item.icon}
            </a>
          ))}
        </div>

        {/* Navigation Quick Links */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
          <Link href="#home" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="#about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="#skills" className="hover:text-white transition-colors">
            Skills
          </Link>
          <Link href="#projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <Link href="#education" className="hover:text-white transition-colors">
            Education
          </Link>
          <Link href="#contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </nav>

        {/* Bottom Bar & Scroll to Top */}
        <div className="w-full pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} Shubham Kumar. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
