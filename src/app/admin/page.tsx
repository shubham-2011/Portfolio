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
  Briefcase,
  GraduationCap,
  Code2,
  Cpu,
  Wrench,
  User,
  Upload,
  HelpCircle,
} from 'lucide-react';
import defaultContent from '@/data/portfolioContent.json';

const PRESET_ICONS = [
  { name: 'Angular', path: '/Skills/Angular.svg' },
  { name: 'React', path: '/Skills/React.png' },
  { name: 'JavaScript', path: '/Skills/js.svg' },
  { name: 'HTML5', path: '/Skills/HTML.webp' },
  { name: 'CSS3', path: '/Skills/css.svg' },
  { name: 'Java', path: '/Skills/java.webp' },
  { name: 'Spring Boot', path: '/Skills/springboot.png' },
  { name: 'C / C++', path: '/Skills/C.png' },
  { name: 'Python', path: '/Skills/python.svg' },
  { name: 'PostgreSQL', path: '/Skills/pgadmin.png' },
  { name: 'MongoDB', path: '/Skills/mongodb.png' },
  { name: 'MySQL', path: '/Skills/mysql.png' },
  { name: 'Oracle', path: '/Skills/oracle.png' },
  { name: 'Linux', path: '/Skills/linux.svg' },
  { name: 'AWS Cloud', path: '/Skills/aws.svg' },
  { name: 'ASP.NET', path: '/Skills/asp-net.svg' },
  { name: 'PHP', path: '/Skills/php.svg' },
  { name: 'Android Studio', path: '/Skills/android-studio.svg' },
];

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
  const [contentSubTab, setContentSubTab] = useState<
    'skills' | 'experience_education' | 'projects' | 'hero_about'
  >('skills');

  // Messages state (PostgreSQL)
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Content state (CMS with default content fallback)
  const [content, setContent] = useState<any>(defaultContent);
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
      const contentPayload = data.data || data.content;
      if (res.ok && contentPayload) {
        setContent(contentPayload);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    }
  };

  const handleSaveContent = async () => {
    if (!content) return;
    setIsSavingContent(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Failed to save changes: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while saving content to PostgreSQL.');
    } finally {
      setIsSavingContent(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const handleUploadFile = async (
    file: File,
    folder: 'Skills' | 'uploads',
    onSuccess: (url: string) => void
  ) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onSuccess(data.url);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  // =========================================================================
  // PROJECT HANDLERS
  // =========================================================================
  const handleAddNewProject = (templateType: 'blank' | 'ecommerce' | 'ai') => {
    let newProj: any = {
      id: Date.now().toString(),
      title: 'New Full-Stack Project',
      description:
        'Engineered a scalable cloud platform with clean architecture, resilient APIs, and seamless database interactions.',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
      tech: ['Angular 18', 'Java', 'Spring Boot', 'PostgreSQL'],
      links: {
        live: '',
        frontend: 'https://github.com/Shubham200020',
        backend: 'https://github.com/Shubham200020',
      },
      features: [
        'Modular architecture with clean separation of concerns',
        'Secure authentication & role-based authorization',
        'Optimized database queries with indexing and caching',
      ],
    };

    if (templateType === 'ecommerce') {
      newProj = {
        id: Date.now().toString(),
        title: 'Modern E-Commerce Storefront',
        description:
          'High-conversion online shopping application featuring instant product search, dynamic basket management, and secure Stripe checkout.',
        image:
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200',
        tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Stripe'],
        links: {
          live: '',
          frontend: 'https://github.com/Shubham200020',
          backend: 'https://github.com/Shubham200020',
        },
        features: [
          'Full checkout and order lifecycle management',
          'Instant full-text catalog search with category filtering',
          'Admin analytics dashboard for revenue and inventory tracking',
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

  // =========================================================================
  // TECHNICAL SKILLS HANDLERS
  // =========================================================================
  const handleAddCategory = () => {
    const newCategory = {
      category: 'New Category',
      description: 'Core technologies and frameworks',
      skills: [{ name: 'New Skill', icon: '/Skills/Angular.svg' }],
    };
    const updated = [...(content.skills || []), newCategory];
    setContent({ ...content, skills: updated });
  };

  const handleDeleteCategory = (catIndex: number) => {
    if (!confirm('Delete this entire skill category?')) return;
    const updated = content.skills.filter((_: any, i: number) => i !== catIndex);
    setContent({ ...content, skills: updated });
  };

  const handleAddSkillToCategory = (catIndex: number) => {
    const updated = [...content.skills];
    updated[catIndex].skills = [
      ...(updated[catIndex].skills || []),
      { name: 'New Technology', icon: '/Skills/Angular.svg' },
    ];
    setContent({ ...content, skills: updated });
  };

  const handleDeleteSkill = (catIndex: number, skillIndex: number) => {
    const updated = [...content.skills];
    updated[catIndex].skills = updated[catIndex].skills.filter(
      (_: any, i: number) => i !== skillIndex
    );
    setContent({ ...content, skills: updated });
  };

  const handleUpdateSkill = (
    catIndex: number,
    skillIndex: number,
    field: 'name' | 'icon',
    value: string
  ) => {
    const updated = [...content.skills];
    updated[catIndex].skills[skillIndex][field] = value;
    setContent({ ...content, skills: updated });
  };

  // =========================================================================
  // EXPERIENCE & EDUCATION HANDLERS
  // =========================================================================
  const handleAddExperience = () => {
    const newExp = {
      year: '2024 - Present',
      company: 'Company Name',
      role: 'Full Stack Software Engineer',
      description:
        'Engineered scalable microservices and user interfaces, collaborated with cross-functional teams, and optimized production database performance.',
    };
    const updated = [newExp, ...(content.experience || [])];
    setContent({ ...content, experience: updated });
  };

  const handleDeleteExperience = (index: number) => {
    if (!confirm('Delete this work experience entry?')) return;
    const updated = content.experience.filter((_: any, i: number) => i !== index);
    setContent({ ...content, experience: updated });
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    const updated = [...content.experience];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, experience: updated });
  };

  const handleAddEducation = () => {
    const newEdu = {
      year: '2025 - Present',
      title: 'MSc in Computer Science',
      university: 'Indira University',
      place: 'Pune, Maharashtra',
      extra: 'CGPA: 8.0',
      description:
        'Advanced specialization in distributed cloud computing, enterprise algorithms, software architecture, and artificial intelligence.',
    };
    const updated = [newEdu, ...(content.education || [])];
    setContent({ ...content, education: updated });
  };

  const handleDeleteEducation = (index: number) => {
    if (!confirm('Delete this education record?')) return;
    const updated = content.education.filter((_: any, i: number) => i !== index);
    setContent({ ...content, education: updated });
  };

  const handleUpdateEducation = (index: number, field: string, value: string) => {
    const updated = [...content.education];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, education: updated });
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
            <span>Content CMS (Projects, Skills, Education)</span>
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
        {/* ========================================================================= */}
        {/* TAB 1: INBOX MESSAGES                                                     */}
        {/* ========================================================================= */}
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
                        className="hover:bg-zinc-900/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedMessage(msg)}
                      >
                        <td className="py-3 px-4 font-mono text-xs text-zinc-400 whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{msg.name}</div>
                          <div className="text-xs text-zinc-400">{msg.email}</div>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 max-w-xs truncate font-medium">
                          {msg.subject || '(No Subject)'}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 max-w-sm truncate">{msg.message}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(msg);
                            }}
                            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-white hover:text-black text-xs font-semibold transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Message Detail Modal */}
            {selectedMessage && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-lg font-bold text-white">Inquiry Details</h3>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-zinc-400 hover:text-white text-sm font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-400">Sender:</span>
                      <p className="text-white font-semibold text-sm">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Email:</span>
                      <p className="text-white font-semibold text-sm">{selectedMessage.email}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Phone:</span>
                      <p className="text-white font-semibold text-sm">
                        {selectedMessage.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Received:</span>
                      <p className="text-white font-mono">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400">Subject:</span>
                    <p className="text-sm font-semibold text-white bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                      {selectedMessage.subject || '(No Subject)'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400">Message:</span>
                    <p className="text-sm text-zinc-200 bg-zinc-950 p-3 rounded-lg border border-zinc-800 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                        selectedMessage.subject || 'Portfolio Inquiry'
                      )}`}
                      className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CONTENT CMS (PROJECTS, SKILLS, EXPERIENCE & EDUCATION)             */}
        {/* ========================================================================= */}
        {activeTab === 'content' && content && (
          <div className="space-y-8">
            {/* Top Bar with Sticky Save */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Visual Content Editor</h2>
                <p className="text-xs text-zinc-400">
                  Manage Projects, Technical Skills, and Education/Experience. Saves to PostgreSQL &
                  updates the live portfolio instantly!
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

            {/* CMS Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                onClick={() => setContentSubTab('skills')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  contentSubTab === 'skills'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Technical Skills ({content.skills?.length || 0} Categories)</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('experience_education')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  contentSubTab === 'experience_education'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>
                  Education & Experience ({content.education?.length || 0} /{' '}
                  {content.experience?.length || 0})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('projects')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  contentSubTab === 'projects'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Projects Showcase ({content.projects?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('hero_about')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  contentSubTab === 'hero_about'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Hero & Bio</span>
              </button>
            </div>

            {/* =================================================================== */}
            {/* SUBTAB A: TECHNICAL SKILLS MANAGEMENT                              */}
            {/* =================================================================== */}
            {contentSubTab === 'skills' && (
              <div className="space-y-8">
                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      <span>Technical Skills Management</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Manage skills categories (Frontend, Backend, Database, Cloud & Tools) and add
                      individual skills with dynamic icon uploads.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Category</span>
                  </button>
                </div>

                {/* HOW TO ADD ICONS & IMAGES DYNAMICALLY GUIDE */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                    <HelpCircle className="w-4 h-4 text-white" />
                    <span>How to Add Images & Icons Dynamically:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-300">
                    <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Upload className="w-3.5 h-3.5 text-zinc-400" />
                        <span>1. Upload from Computer</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Click the <span className="text-white font-semibold">Upload</span> button on any skill card. Choose any SVG, PNG, or WEBP file from your device. It will upload dynamically to the server and apply automatically!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                        <span>2. Choose Preset Icons</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Use the <span className="text-white font-semibold">Presets dropdown</span> on any card to select existing icons (Angular, React, Java, Spring Boot, PostgreSQL, MongoDB, Python, etc.) with 1 click.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        <span>3. Paste Online Icon URLs</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Copy free vector icons from{' '}
                        <a
                          href="https://devicon.dev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline font-semibold hover:text-zinc-300"
                        >
                          Devicon.dev ↗
                        </a>{' '}
                        or{' '}
                        <a
                          href="https://simpleicons.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline font-semibold hover:text-zinc-300"
                        >
                          SimpleIcons ↗
                        </a>{' '}
                        and paste the URL directly into the field!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skill Categories List */}
                <div className="space-y-6">
                  {content.skills?.map((cat: any, catIdx: number) => (
                    <div
                      key={catIdx}
                      className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6"
                    >
                      {/* Category Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                              Category Title
                            </label>
                            <input
                              type="text"
                              value={cat.category || ''}
                              onChange={(e) => {
                                const updated = [...content.skills];
                                updated[catIdx].category = e.target.value;
                                setContent({ ...content, skills: updated });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white font-bold focus:outline-none focus:border-white"
                              placeholder="e.g. Frontend, Backend, Database"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                              Category Description
                            </label>
                            <input
                              type="text"
                              value={cat.description || ''}
                              onChange={(e) => {
                                const updated = [...content.skills];
                                updated[catIdx].description = e.target.value;
                                setContent({ ...content, skills: updated });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-white"
                              placeholder="Brief summary of domain expertise"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddSkillToCategory(catIdx)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-semibold text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Skill</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(catIdx)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Skills Grid inside Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cat.skills?.map((skill: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between gap-3 group hover:border-zinc-700 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              {/* Icon Preview */}
                              <div className="relative w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-inner">
                                {skill.icon ? (
                                  <Image
                                    src={skill.icon}
                                    alt={skill.name}
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                    onError={(e: any) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Code2 className="w-5 h-5 text-zinc-400" />
                                )}
                              </div>

                              {/* Skill Name Input */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <input
                                  type="text"
                                  value={skill.name || ''}
                                  onChange={(e) =>
                                    handleUpdateSkill(catIdx, sIdx, 'name', e.target.value)
                                  }
                                  placeholder="Skill Name"
                                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-white"
                                />
                                <input
                                  type="text"
                                  value={skill.icon || ''}
                                  onChange={(e) =>
                                    handleUpdateSkill(catIdx, sIdx, 'icon', e.target.value)
                                  }
                                  placeholder="/Skills/Angular.svg or https://..."
                                  className="w-full bg-black/60 px-2 py-1 rounded border border-zinc-800 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-white truncate"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(catIdx, sIdx)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Skill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Dynamic Upload and Presets Row */}
                            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                              {/* 1. Direct Upload File Button */}
                              <label className="cursor-pointer flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-white hover:text-black transition-colors text-[11px] font-semibold inline-flex items-center justify-center gap-1.5">
                                <Upload className="w-3 h-3" />
                                <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                                <input
                                  type="file"
                                  accept="image/*,.svg"
                                  disabled={isUploading}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleUploadFile(e.target.files[0], 'Skills', (url) => {
                                        handleUpdateSkill(catIdx, sIdx, 'icon', url);
                                      });
                                    }
                                  }}
                                />
                              </label>

                              {/* 2. Preset Icons Picker Dropdown */}
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleUpdateSkill(catIdx, sIdx, 'icon', e.target.value);
                                  }
                                }}
                                defaultValue=""
                                className="px-2 py-1.5 rounded-lg bg-black border border-zinc-700 text-zinc-300 text-[11px] focus:outline-none focus:border-white max-w-[120px]"
                              >
                                <option value="" disabled>
                                  Presets ▾
                                </option>
                                {PRESET_ICONS.map((p) => (
                                  <option key={p.name} value={p.path}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SUBTAB B: EDUCATION & WORK EXPERIENCE MANAGEMENT                   */}
            {/* =================================================================== */}
            {contentSubTab === 'experience_education' && (
              <div className="space-y-12">
                {/* 1. WORK EXPERIENCE SECTION */}
                <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        <span>Work Experience ({content.experience?.length || 0})</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Professional software engineering roles, internships, and corporate
                        experience.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Work Experience</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.experience?.map((exp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              Duration / Period
                            </label>
                            <input
                              type="text"
                              value={exp.year || ''}
                              onChange={(e) => handleUpdateExperience(idx, 'year', e.target.value)}
                              placeholder="e.g. Feb 2024 - Nov 2024"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              Company / Organization
                            </label>
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) =>
                                handleUpdateExperience(idx, 'company', e.target.value)
                              }
                              placeholder="e.g. SetTribe"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              Role / Job Title
                            </label>
                            <input
                              type="text"
                              value={exp.role || ''}
                              onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                              placeholder="e.g. Full Stack Developer Intern"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs font-semibold text-white focus:outline-none focus:border-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                            Key Responsibilities & Deliverables
                          </label>
                          <textarea
                            rows={2}
                            value={exp.description || ''}
                            onChange={(e) =>
                              handleUpdateExperience(idx, 'description', e.target.value)
                            }
                            placeholder="Describe core contributions, tech stack used, and accomplishments..."
                            className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-white leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(idx)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg text-zinc-500 hover:text-red-400 text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Role</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. EDUCATION SECTION */}
                <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        <span>Education Timeline ({content.education?.length || 0})</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Academic degrees, certifications, universities, and performance scores.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Education Record</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.education?.map((edu: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              Duration / Years
                            </label>
                            <input
                              type="text"
                              value={edu.year || ''}
                              onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                              placeholder="e.g. 2025 - Present"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              Degree / Certificate Title
                            </label>
                            <input
                              type="text"
                              value={edu.title || ''}
                              onChange={(e) => handleUpdateEducation(idx, 'title', e.target.value)}
                              placeholder="e.g. MSc Computer Science"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              University / School & Place
                            </label>
                            <input
                              type="text"
                              value={edu.university || edu.place || ''}
                              onChange={(e) =>
                                handleUpdateEducation(idx, 'university', e.target.value)
                              }
                              placeholder="e.g. Indira University, Pune"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-white focus:outline-none focus:border-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              Grade / Score / CGPA
                            </label>
                            <input
                              type="text"
                              value={edu.extra || ''}
                              onChange={(e) => handleUpdateEducation(idx, 'extra', e.target.value)}
                              placeholder="e.g. CGPA: 8.5 / Score: 60%"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                              Academic Specialization / Highlights
                            </label>
                            <input
                              type="text"
                              value={edu.description || ''}
                              onChange={(e) =>
                                handleUpdateEducation(idx, 'description', e.target.value)
                              }
                              placeholder="Key coursework in software engineering, algorithms, database systems..."
                              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteEducation(idx)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg text-zinc-500 hover:text-red-400 text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Record</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SUBTAB C: PROJECTS MANAGEMENT                                      */}
            {/* =================================================================== */}
            {contentSubTab === 'projects' && (
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
                      + E-Commerce
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddNewProject('ai')}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                    >
                      + AI Dashboard
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {content.projects?.map((proj: any, idx: number) => (
                    <div
                      key={proj.id || idx}
                      className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-black border border-white/20 text-white font-mono text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-base font-bold text-white">{proj.title}</h4>
                            <p className="text-[11px] text-zinc-400 font-mono">
                              {proj.tech?.slice(0, 3).join(' • ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveProject(idx, 'up')}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === content.projects.length - 1}
                            onClick={() => handleMoveProject(idx, 'down')}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(idx)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-zinc-400">
                              Screenshot / Banner Image URL
                            </label>
                            <label className="cursor-pointer text-[11px] text-white hover:text-zinc-300 font-semibold inline-flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={isUploading}
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleUploadFile(e.target.files[0], 'uploads', (url) => {
                                      const updated = [...content.projects];
                                      updated[idx].image = url;
                                      setContent({ ...content, projects: updated });
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={proj.image}
                            onChange={(e) => {
                              const updated = [...content.projects];
                              updated[idx].image = e.target.value;
                              setContent({ ...content, projects: updated });
                            }}
                            placeholder="https://... or /uploads/..."
                            className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">
                          Project Description
                        </label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...content.projects];
                            updated[idx].description = e.target.value;
                            setContent({ ...content, projects: updated });
                          }}
                          className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-white focus:outline-none focus:border-white leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">
                            Tech Stack (comma separated)
                          </label>
                          <input
                            type="text"
                            value={Array.isArray(proj.tech) ? proj.tech.join(', ') : proj.tech}
                            onChange={(e) => {
                              const updated = [...content.projects];
                              updated[idx].tech = e.target.value
                                .split(',')
                                .map((t: string) => t.trim());
                              setContent({ ...content, projects: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">
                            Live Demo URL
                          </label>
                          <input
                            type="text"
                            value={proj.links?.live || ''}
                            onChange={(e) => {
                              const updated = [...content.projects];
                              updated[idx].links = { ...updated[idx].links, live: e.target.value };
                              setContent({ ...content, projects: updated });
                            }}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">
                            GitHub Repository
                          </label>
                          <input
                            type="text"
                            value={proj.links?.frontend || proj.links?.backend || ''}
                            onChange={(e) => {
                              const updated = [...content.projects];
                              updated[idx].links = {
                                ...updated[idx].links,
                                frontend: e.target.value,
                              };
                              setContent({ ...content, projects: updated });
                            }}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SUBTAB D: HERO & ABOUT SECTION                                     */}
            {/* =================================================================== */}
            {contentSubTab === 'hero_about' && (
              <div className="space-y-6">
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
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
                    About Section & Contact Information
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
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Floating Save Button */}
            <div className="sticky bottom-6 flex justify-end">
              <button
                onClick={handleSaveContent}
                disabled={isSavingContent}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-bold shadow-2xl shadow-white/20 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingContent ? 'Saving to PostgreSQL...' : 'Save All Changes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FREE OPEN-SOURCE DATABASE GUI TOOLS                                */}
        {/* ========================================================================= */}
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
