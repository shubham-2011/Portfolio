'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  Edit3,
  Database,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Search,
  ExternalLink,
  Plus,
  Server,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'content' | 'inbox' | 'database'>('content');

  // Messages state (PostgreSQL)
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Content state (CMS)
  const [content, setContent] = useState<any>(null);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchContent();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchMessages();
        fetchContent();
      } else {
        setLoginError(data.error || 'Invalid password.');
      }
    } catch (err) {
      setLoginError('Error connecting to login server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.log('Session check notice');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (res.ok && data.data) {
        setContent(data.data);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message from PostgreSQL?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      } else {
        alert('Failed to delete message.');
      }
    } catch (err) {
      alert('Error deleting message.');
    }
  };

  const handleSaveContent = async () => {
    setIsSavingContent(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Failed to save content changes.');
      }
    } catch (err) {
      alert('Error saving content.');
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleAddNewProject = (templateType?: 'blank' | 'ecommerce' | 'ai') => {
    let newProj = {
      id: Date.now().toString(),
      title: 'New Full Stack Project',
      description:
        'Architected a resilient application with end-to-end user workflows, scalable backend APIs, and responsive frontend design.',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
      tech: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Tailwind CSS'],
      links: {
        live: '',
        frontend: 'https://github.com/Shubham200020',
        backend: 'https://github.com/Shubham200020',
      },
      features: [
        'End-to-end full stack architecture with modern UI/UX',
        'Secure RESTful API integration with robust database schema',
        'Optimized for performance and responsive across all screens',
      ],
    };

    if (templateType === 'ecommerce') {
      newProj = {
        id: Date.now().toString(),
        title: 'Cloud E-Commerce Platform',
        description:
          'Distributed shopping ecosystem with catalog search, shopping cart management, Stripe checkout integration, and order status analytics.',
        image:
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200',
        tech: ['Next.js', 'Spring Boot', 'PostgreSQL', 'Stripe', 'Redis'],
        links: {
          live: '',
          frontend: 'https://github.com/Shubham200020',
          backend: 'https://github.com/Shubham200020',
        },
        features: [
          'Full cart lifecycle with guest and customer checkouts',
          'Instant webhooks processing for payment verifications',
          'Real-time inventory decrement logic with PostgreSQL transactions',
        ],
      };
    } else if (templateType === 'ai') {
      newProj = {
        id: Date.now().toString(),
        title: 'AI Analytics & Data Dashboard',
        description:
          'Intelligent visualization platform summarizing complex datasets, real-time KPI metrics, automated charts, and predictive analytics models.',
        image:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
        tech: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Chart.js'],
        links: {
          live: '',
          frontend: 'https://github.com/Shubham200020',
          backend: 'https://github.com/Shubham200020',
        },
        features: [
          'Automated data ingestion with background worker pipelines',
          'Interactive chart dashboards with CSV/PDF export capability',
          'Role-based analytics reporting for stakeholders and team leads',
        ],
      };
    }

    const updatedProjects = [newProj, ...(content?.projects || [])];
    setContent({ ...content, projects: updatedProjects });
  };

  const handleDeleteProject = (index: number) => {
    if (!confirm('Are you sure you want to remove this project?')) return;
    const updated = content.projects.filter((_: any, i: number) => i !== index);
    setContent({ ...content, projects: updated });
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= content.projects.length) return;

    const updated = [...content.projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setContent({ ...content, projects: updated });
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center mx-auto shadow-lg shadow-white/20">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-xs text-zinc-400">
              Enter master key to manage content & Neon PostgreSQL
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-md shadow-white/10 disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-white/30 text-zinc-400 hover:text-white transition-colors"
            title="View Live Portfolio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span>Admin Management Portal</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                PostgreSQL Connected
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Database: neondb | Neon Tech Cloud</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Lock Session
          </button>
        </div>
      </header>

      {/* Main Tabs Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-4">
        <div className="flex flex-wrap gap-3 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'content'
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Content CMS (Projects, Hero, Skills)</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'inbox'
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Messages Inbox</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'inbox' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {messages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'database'
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Free DB Tools (pgAdmin / DBeaver)</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* TAB 1: INBOX MESSAGES */}
        {activeTab === 'inbox' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <button
                onClick={fetchMessages}
                disabled={isLoadingMessages}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                <span>Refresh PostgreSQL Data</span>
              </button>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <Mail className="w-8 h-8 mx-auto text-zinc-600" />
                <h3 className="text-base font-semibold text-white">No Contact Inquiries Found</h3>
                <p className="text-xs text-zinc-400">
                  Submissions sent through the contact form will appear here from table{' '}
                  <span className="font-mono text-zinc-300">portfolio_contacts</span>.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Sender</th>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-4">Message</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {filteredMessages.map((msg) => (
                      <tr
                        key={msg.id}
                        className="hover:bg-zinc-900/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedMessage(msg)}
                      >
                        <td className="py-3 px-4 text-xs text-zinc-400 whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{msg.name}</p>
                          <p className="text-xs text-zinc-400">{msg.email}</p>
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-200">{msg.subject}</td>
                        <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">{msg.message}</td>
                        <td
                          className="py-3 px-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete from PostgreSQL"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Selected Message Detail Modal */}
            {selectedMessage && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedMessage.subject}</h3>
                    <p className="text-xs text-zinc-400">
                      From: <strong className="text-white">{selectedMessage.name}</strong> (
                      {selectedMessage.email} | {selectedMessage.phone})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    Received on: {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTENT CMS */}
        {activeTab === 'content' && content && (
          <div className="space-y-10">
            {/* Top Bar with Sticky Save */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Visual Content Editor</h2>
                <p className="text-xs text-zinc-400">
                  Add projects, update headlines, and manage skills. Changes save to PostgreSQL and
                  update the live site instantly!
                </p>
              </div>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fadeIn font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved to PostgreSQL & Live Site!</span>
                  </span>
                )}
                <button
                  onClick={handleSaveContent}
                  disabled={isSavingContent}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 shadow-lg shadow-white/10 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingContent ? 'Saving...' : 'Save All Changes'}</span>
                </button>
              </div>
            </div>

            {/* PROJECTS SECTION */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    <span>Projects Management ({content.projects?.length || 0})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Projects will display in the Squarespace 3D carousel in the exact order below.
                  </p>
                </div>

                {/* Add Project Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddNewProject('blank')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddNewProject('ecommerce')}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    + E-Commerce Template
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddNewProject('ai')}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    + AI Dashboard Template
                  </button>
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-6">
                {content.projects?.map((proj: any, idx: number) => (
                  <div
                    key={proj.id || idx}
                    className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-mono flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                          {proj.title || 'Untitled Project'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveProject(idx, 'up')}
                          className="p-1.5 rounded-lg bg-black border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                          title="Move Project Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === content.projects.length - 1}
                          onClick={() => handleMoveProject(idx, 'down')}
                          className="p-1.5 rounded-lg bg-black border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                          title="Move Project Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(idx)}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors ml-2"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-8 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">
                            Project Title
                          </label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const updated = [...content.projects];
                              updated[idx].title = e.target.value;
                              setContent({ ...content, projects: updated });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-sm text-white focus:border-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) => {
                              const updated = [...content.projects];
                              updated[idx].description = e.target.value;
                              setContent({ ...content, projects: updated });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-sm text-white focus:border-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">
                            Tech Stack Tags (Comma-separated)
                          </label>
                          <input
                            type="text"
                            value={
                              Array.isArray(proj.tech) ? proj.tech.join(', ') : proj.tech || ''
                            }
                            onChange={(e) => {
                              const updated = [...content.projects];
                              updated[idx].tech = e.target.value
                                .split(',')
                                .map((t: string) => t.trim())
                                .filter(Boolean);
                              setContent({ ...content, projects: updated });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-white focus:border-white focus:outline-none font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                              Live Demo URL
                            </label>
                            <input
                              type="text"
                              value={proj.links?.live || ''}
                              onChange={(e) => {
                                const updated = [...content.projects];
                                updated[idx].links = {
                                  ...updated[idx].links,
                                  live: e.target.value,
                                };
                                setContent({ ...content, projects: updated });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                              Frontend GitHub
                            </label>
                            <input
                              type="text"
                              value={proj.links?.frontend || ''}
                              onChange={(e) => {
                                const updated = [...content.projects];
                                updated[idx].links = {
                                  ...updated[idx].links,
                                  frontend: e.target.value,
                                };
                                setContent({ ...content, projects: updated });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                              Backend GitHub
                            </label>
                            <input
                              type="text"
                              value={proj.links?.backend || ''}
                              onChange={(e) => {
                                const updated = [...content.projects];
                                updated[idx].links = {
                                  ...updated[idx].links,
                                  backend: e.target.value,
                                };
                                setContent({ ...content, projects: updated });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-4 space-y-2">
                        <label className="block text-xs font-semibold text-zinc-400">
                          Banner Image URL
                        </label>
                        <input
                          type="text"
                          value={proj.image || ''}
                          onChange={(e) => {
                            const updated = [...content.projects];
                            updated[idx].image = e.target.value;
                            setContent({ ...content, projects: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-white"
                        />

                        <div className="relative h-32 w-full rounded-xl overflow-hidden border border-zinc-800 bg-black">
                          {proj.image ? (
                            <Image
                              src={proj.image}
                              alt="Thumbnail Preview"
                              fill
                              className="object-cover"
                              sizes="300px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">
                              No image provided
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HERO SECTION */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
                Hero Section
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={content.hero?.name || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, name: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Job Title / Headline
                  </label>
                  <input
                    type="text"
                    value={content.hero?.title || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Hero Bio Description
                </label>
                <textarea
                  rows={3}
                  value={content.hero?.description || ''}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* ABOUT SECTION */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
                About Section
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={content.about?.phone || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        about: { ...content.about, phone: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    value={content.about?.email || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        about: { ...content.about, email: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Floating Save Button */}
            <div className="sticky bottom-6 flex justify-end">
              <button
                onClick={handleSaveContent}
                disabled={isSavingContent}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-bold shadow-2xl shadow-white/20 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingContent ? 'Saving to Database...' : 'Save All Changes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FREE OPEN-SOURCE DATABASE GUI TOOLS */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5" />
                <span>Direct Database Access with Free Open-Source Tools</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If you ever want to view, export, or edit raw tables without this web dashboard, you
                can connect any of these 100% free open-source database management tools directly to
                your Neon Tech PostgreSQL instance.
              </p>
            </div>

            {/* Connection Credentials Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Your Neon PostgreSQL Connection Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-black border border-zinc-800">
                  <p className="text-zinc-500 font-mono">HOST</p>
                  <p className="text-white font-mono select-all">
                    ep-cool-block-atydsn8b.c-9.us-east-1.aws.neon.tech
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-black border border-zinc-800">
                  <p className="text-zinc-500 font-mono">PORT</p>
                  <p className="text-white font-mono select-all">5432</p>
                </div>

                <div className="p-3 rounded-lg bg-black border border-zinc-800">
                  <p className="text-zinc-500 font-mono">DATABASE</p>
                  <p className="text-white font-mono select-all">neondb</p>
                </div>

                <div className="p-3 rounded-lg bg-black border border-zinc-800">
                  <p className="text-zinc-500 font-mono">USERNAME</p>
                  <p className="text-white font-mono select-all">neondb_owner</p>
                </div>

                <div className="p-3 rounded-lg bg-black border border-zinc-800">
                  <p className="text-zinc-500 font-mono">PASSWORD</p>
                  <p className="text-white font-mono select-all">npg_hQoR9X2Fgrlt</p>
                </div>

                <div className="p-3 rounded-lg bg-black border border-zinc-800">
                  <p className="text-zinc-500 font-mono">SSL MODE</p>
                  <p className="text-emerald-400 font-mono select-all">require</p>
                </div>
              </div>
            </div>

            {/* Recommended Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">DBeaver Community</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    Free / Open Source
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The most versatile universal database tool. Lets you browse tables like Excel
                  spreadsheets, run SQL scripts, and import/export CSV data easily.
                </p>
                <a
                  href="https://dbeaver.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white underline hover:text-zinc-300"
                >
                  <span>Download DBeaver Community</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">pgAdmin 4</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    Official PostgreSQL GUI
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The official administration desktop application for PostgreSQL. Allows schema
                  design, table indexing, and query monitoring.
                </p>
                <a
                  href="https://www.pgadmin.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white underline hover:text-zinc-300"
                >
                  <span>Download pgAdmin 4</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
