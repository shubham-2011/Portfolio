'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Terminal } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="#home"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg px-2 py-1"
        >
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold shadow-md shadow-white/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-300 transition-colors">
            SKM <span className="text-zinc-400 font-normal">Profile</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white hover:after:w-full after:transition-all after:duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="#contact"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition-all shadow-md shadow-white/10 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Hire Me
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-white transition-all"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200"
            >
              Hire Me
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
