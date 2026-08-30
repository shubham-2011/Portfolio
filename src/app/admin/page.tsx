'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Bot,
  Brain,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Code2,
  Cpu,
  Wrench,
  User,
  Upload,
  HelpCircle,
  BarChart2,
  Globe,
  Smartphone,
  Monitor,
  Users,
  Fingerprint,
  Activity,
  Image as ImageIcon,
  Copy,
  Check,
  FolderOpen,
  UploadCloud,
  Eye,
  Tag,
  X,
  FileImage,
  AlertTriangle,
  FileText,
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

  const [activeTab, setActiveTab] = useState<'content' | 'inbox' | 'analytics' | 'database' | 'media' | 'chatbot'>('content');
  const [contentSubTab, setContentSubTab] = useState<
    'skills' | 'experience_education' | 'projects' | 'hero_about'
  >('skills');

  // Chatbot AI Model Training State
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState('All');
  const [knowledgeForm, setKnowledgeForm] = useState({
    id: '',
    question: '',
    answer: '',
    category: 'Experience',
    keywords: '',
  });
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [knowledgeSaveSuccess, setKnowledgeSaveSuccess] = useState(false);
  const [chatbotLogs, setChatbotLogs] = useState<any[]>([]);
  const [isLoadingChatbotLogs, setIsLoadingChatbotLogs] = useState(false);
  const [knowledgeSource, setKnowledgeSource] = useState('postgres');
  const [ragStats, setRagStats] = useState<any>(null);
  const [isReindexingRAG, setIsReindexingRAG] = useState(false);

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; database?: string; error?: string; source?: string } | null>(null);

  // Messages state (PostgreSQL)
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Analytics & Fingerprinting state
  const [analyticsLogs, setAnalyticsLogs] = useState<any[]>([]);
  const [analyticsStats, setAnalyticsStats] = useState<any>({
    totalVisits: 0,
    uniqueVisitors: 0,
    devices: [],
    browsers: [],
    countries: [],
  });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Content state (CMS with default content fallback)
  const [content, setContent] = useState<any>(defaultContent);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Media & Icons Manager state
  interface MediaAsset {
    id: string;
    name: string;
    folder: 'Skills' | 'uploads';
    url: string;
    size: number;
    modifiedAt: string;
    extension: string;
  }
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'Skills' | 'uploads' | 'unused'>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [uploadTargetFolder, setUploadTargetFolder] = useState<'Skills' | 'uploads'>('Skills');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [assignModalAsset, setAssignModalAsset] = useState<MediaAsset | null>(null);
  const [assignTargetCategory, setAssignTargetCategory] = useState<number>(0);
  const [assignTargetSkill, setAssignTargetSkill] = useState<number>(0);
  const [libraryPickerTarget, setLibraryPickerTarget] = useState<
    | { type: 'skill'; catIdx: number; sIdx: number }
    | { type: 'project'; pIdx: number }
    | { type: 'resume' }
    | null
  >(null);

  // Compute all media files currently in use across Skills, Projects, Hero, and Resume
  const usedMediaSet = useMemo(() => {
    const set = new Set<string>();
    if (!content) return set;

    // 1. Skills
    content.skills?.forEach((cat: any) => {
      cat.skills?.forEach((s: any) => {
        if (s.icon) {
          const raw = String(s.icon).trim();
          set.add(raw);
          set.add(raw.replace(/^\/?(Skills|uploads|api\/media)\//, ''));
        }
      });
    });

    // 2. Projects
    content.projects?.forEach((p: any) => {
      if (p.image) {
        const raw = String(p.image).trim();
        set.add(raw);
        set.add(raw.replace(/^\/?(Skills|uploads|api\/media)\//, ''));
      }
    });

    // 3. Hero & Resume
    if (content.hero?.resumeUrl) {
      const raw = String(content.hero.resumeUrl).trim();
      set.add(raw);
      set.add(raw.replace(/^\/?(Skills|uploads|api\/media)\//, ''));
    }
    if (content.hero?.profileImage) {
      const raw = String(content.hero.profileImage).trim();
      set.add(raw);
      set.add(raw.replace(/^\/?(Skills|uploads|api\/media)\//, ''));
    }

    // 4. About
    if (content.about?.profileImage) {
      const raw = String(content.about.profileImage).trim();
      set.add(raw);
      set.add(raw.replace(/^\/?(Skills|uploads|api\/media)\//, ''));
    }

    return set;
  }, [content]);

  const isAssetInUse = (asset: MediaAsset) => {
    return (
      usedMediaSet.has(asset.url) ||
      usedMediaSet.has(asset.name) ||
      usedMediaSet.has(`/${asset.folder}/${asset.name}`) ||
      usedMediaSet.has(`/api/media/${asset.name}`)
    );
  };

  const fetchMediaAssets = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch('/api/admin/media', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.assets) {
        setMediaAssets(data.assets);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleBatchUpload = async (fileList: FileList | File[], folder: 'Skills' | 'uploads') => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('folder', folder);
      files.forEach((f) => formData.append('files', f));

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchMediaAssets();
        alert(`Successfully uploaded ${data.count || files.length} asset(s)!`);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (asset: MediaAsset) => {
    if (!confirm(`Permanently delete "${asset.name}" from ${asset.folder}?`)) return;

    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: asset.name, folder: asset.folder }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaAssets((prev) => prev.filter((a) => a.id !== asset.id));
      } else {
        alert('Failed to delete asset: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while deleting asset.');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setAnalyticsLogs(data.logs || []);
        setAnalyticsStats(data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const clearAnalytics = async () => {
    if (!window.confirm('Are you sure you want to clear all visitor analytics logs?')) return;
    try {
      const res = await fetch('/api/admin/analytics', { method: 'DELETE' });
      if (res.ok) {
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Error clearing analytics:', err);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/admin/status', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.dbStatus) {
        setDbStatus(data.dbStatus);
      }
    } catch (err) {
      console.error('Error checking DB status:', err);
    }
  };

  // =========================================================================
  // 🤖 AI CHATBOT KNOWLEDGE BASE & TRAINING HANDLERS
  // =========================================================================
  const fetchChatbotKnowledge = async () => {
    setIsLoadingKnowledge(true);
    try {
      const res = await fetch('/api/admin/chatbot/knowledge', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.knowledge) {
        setKnowledgeList(data.knowledge);
        setKnowledgeSource(data.source || 'postgres');
      }
    } catch (err) {
      console.error('Error fetching chatbot knowledge:', err);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  const fetchChatbotLogs = async () => {
    setIsLoadingChatbotLogs(true);
    try {
      const res = await fetch('/api/admin/chatbot/logs', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.logs) {
        setChatbotLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching chatbot logs:', err);
    } finally {
      setIsLoadingChatbotLogs(false);
    }
  };

  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowledgeForm.question.trim() || !knowledgeForm.answer.trim()) {
      alert('Please enter both a question and an answer.');
      return;
    }

    setIsSavingKnowledge(true);
    try {
      const res = await fetch('/api/admin/chatbot/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledgeForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setKnowledgeSaveSuccess(true);
        setTimeout(() => setKnowledgeSaveSuccess(false), 3000);
        setKnowledgeForm({ id: '', question: '', answer: '', category: 'Experience', keywords: '' });
        await fetchChatbotKnowledge();
      } else {
        alert('Failed to save knowledge: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while saving knowledge.');
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI training knowledge item?')) return;
    try {
      const res = await fetch(`/api/admin/chatbot/knowledge?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKnowledgeList((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert('Failed to delete knowledge: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while deleting item.');
    }
  };

  const handleEditKnowledge = (item: any) => {
    setKnowledgeForm({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category || 'General',
      keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords || '',
    });
  };

  const fetchRAGStats = async () => {
    try {
      const res = await fetch('/api/admin/chatbot/rag', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.stats) {
        setRagStats(data.stats);
      }
    } catch (err) {
      console.warn('Error fetching RAG stats:', err);
    }
  };

  const handleReindexRAG = async () => {
    setIsReindexingRAG(true);
    try {
      const res = await fetch('/api/admin/chatbot/rag', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Successfully indexed ${data.indexedCount} knowledge chunks into Vector Database using ${data.model}!`);
        await fetchRAGStats();
      } else {
        alert('RAG Indexing notice: ' + (data.error || 'Failed to reindex'));
      }
    } catch (err) {
      alert('Network error while reindexing RAG.');
    } finally {
      setIsReindexingRAG(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/admin/login', { cache: 'no-store' });
        const session = await response.json();
        if (session.authenticated) {
          setIsAuthenticated(true);
          fetchDbStatus();
          fetchMessages();
          fetchContent();
          fetchAnalytics();
          fetchMediaAssets();
          fetchChatbotKnowledge();
          fetchRAGStats();
        }
      } catch (err) {
        console.log('Could not restore admin session.');
      }
    };

    restoreSession();
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
        setPassword('');
        fetchDbStatus();
        fetchMessages();
        fetchContent();
        fetchAnalytics();
        fetchMediaAssets();
      } else {
        setLoginError(data.error || 'Invalid password.');
      }
    } catch (err) {
      setLoginError('Error connecting to login server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch('/api/admin/messages', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.log('Session check notice');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' });
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
  const [isMigratingImages, setIsMigratingImages] = useState(false);
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

  const handleCloudinaryMigration = async () => {
    if (!confirm('Upload every current skill icon, project image, and profile image to Cloudinary?')) return;
    setIsMigratingImages(true);
    try {
      const res = await fetch('/api/admin/migrate-cloudinary', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Migration failed.');
      setContent(data.content);
      alert(`${data.migrated} images are now stored in Cloudinary.`);
    } catch (err: any) {
      alert(err.message || 'Could not migrate images to Cloudinary.');
    } finally {
      setIsMigratingImages(false);
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
        frontend: 'https://github.com/shubham-2011',
        backend: 'https://github.com/shubham-2011',
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
          frontend: 'https://github.com/shubham-2011',
          backend: 'https://github.com/shubham-2011',
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
          frontend: 'https://github.com/shubham-2011',
          backend: 'https://github.com/shubham-2011',
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
                placeholder="Enter admin password"
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
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
            title="Return to Live Site"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-500">shubham.dev</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono font-medium text-white">admin-console</span>
            {dbStatus?.connected ? (
              <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>pg:connected ({dbStatus.database || 'neondb'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>pg:disconnected</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-900/60 bg-zinc-900/60 hover:bg-red-950/20 text-xs font-mono text-zinc-400 hover:text-red-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Tabs Header - Linear / Vercel Grade */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="flex items-center gap-1 border-b border-zinc-805 border-zinc-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Content CMS</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('media');
              fetchMediaAssets();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-zinc-300" />
            <span>Media Assets</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
              {mediaAssets.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inbox');
              fetchMessages();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Messages</span>
            {messages.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                {messages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              fetchAnalytics();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-zinc-300" />
            <span>Analytics</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
              {analyticsStats.totalVisits || 0}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('chatbot');
              fetchChatbotKnowledge();
              fetchChatbotLogs();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'chatbot'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-zinc-300" />
            <span>RAG &amp; Knowledge</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
              {ragStats?.totalChunks || knowledgeList.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Tools</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* ========================================================================= */}
        {/* 🖼️ TAB: MEDIA & ICONS ASSET MANAGER                                       */}
        {/* ========================================================================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Top Toolbar & Summary Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  <span>Media & Icons Manager</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload, organize, search, and assign skill icons and portfolio images with 1-click clipboard & CMS binding.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={fetchMediaAssets}
                  disabled={isLoadingMedia}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMedia ? 'animate-spin' : ''}`} />
                  <span>Refresh Library</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Assets</span>
                  <p className="text-2xl font-black text-white mt-0.5">{mediaAssets.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-cyan-400">
                  <FolderOpen className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Skill Icons (/Skills)</span>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {mediaAssets.filter((a) => a.folder === 'Skills').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                  <Code2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Project Images (/uploads)</span>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {mediaAssets.filter((a) => a.folder === 'uploads').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Drag and Drop Batch Uploader */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Upload New Media & Icons</span>
                </div>

                {/* Target Folder Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-zinc-800 text-xs">
                  <span className="text-zinc-500 text-[11px] px-2 font-mono">Upload to:</span>
                  <button
                    type="button"
                    onClick={() => setUploadTargetFolder('Skills')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      uploadTargetFolder === 'Skills'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    🎯 Skills Icons (/Skills)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadTargetFolder('uploads')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      uploadTargetFolder === 'uploads'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    🖼️ Projects & General (/uploads)
                  </button>
                </div>
              </div>

              {/* Dropzone Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleBatchUpload(e.dataTransfer.files, uploadTargetFolder);
                  }
                }}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${
                  isDragOver
                    ? 'border-cyan-400 bg-cyan-950/20 scale-[1.005]'
                    : 'border-zinc-700/80 hover:border-zinc-600 bg-black/40'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
                  <UploadCloud className="w-7 h-7 text-cyan-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Drag and drop your SVG, PNG, or WEBP files here
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mb-4">
                  Files are saved directly to <span className="font-mono text-zinc-200">public/{uploadTargetFolder}/</span> and instantly available for your portfolio skills and projects.
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs cursor-pointer shadow-lg shadow-white/10 active:scale-95 transition-all">
                  <Plus className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading Files...' : 'Select Files from Computer'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.svg"
                    disabled={isUploading}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleBatchUpload(e.target.files, uploadTargetFolder);
                      }
                    }}
                  />
                </label>
                <span className="text-[10px] text-zinc-500 mt-2 font-mono">
                  Supports multiple files simultaneously &bull; Max 15MB per file
                </span>
              </div>
            </div>

            {/* Media Gallery with Filter & Search */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search icons by name (e.g., docker, react)..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 rounded-xl bg-black/60 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                  {mediaSearch && (
                    <button
                      type="button"
                      onClick={() => setMediaSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaFilter('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      mediaFilter === 'all'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All ({mediaAssets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('Skills')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      mediaFilter === 'Skills'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Skill Icons ({mediaAssets.filter((a) => a.folder === 'Skills').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('uploads')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      mediaFilter === 'uploads'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Uploads ({mediaAssets.filter((a) => a.folder === 'uploads').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('unused')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                      mediaFilter === 'unused'
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'text-amber-400 hover:text-amber-300'
                    }`}
                    title="View photos and icons that are not being used anywhere"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Unused Files ({mediaAssets.filter((a) => !isAssetInUse(a)).length})</span>
                  </button>
                </div>
              </div>

              {/* Unused filter helper banner */}
              {mediaFilter === 'unused' && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Showing files that are <strong>not referenced</strong> by any skill, project, or resume. You can safely delete them.
                    </span>
                  </div>
                </div>
              )}

              {/* Asset Grid */}
              {(() => {
                const filtered = mediaAssets.filter((asset) => {
                  let matchFolder = true;
                  if (mediaFilter === 'unused') {
                    matchFolder = !isAssetInUse(asset);
                  } else if (mediaFilter !== 'all') {
                    matchFolder = asset.folder === mediaFilter;
                  }
                  const matchSearch =
                    !mediaSearch ||
                    asset.name.toLowerCase().includes(mediaSearch.toLowerCase());
                  return matchFolder && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-xl bg-black/40 border border-zinc-800 space-y-2">
                      <FileImage className="w-8 h-8 mx-auto text-zinc-600" />
                      <p className="text-sm font-semibold text-white">No Media Assets Found</p>
                      <p className="text-xs text-zinc-500">
                        {mediaFilter === 'unused'
                          ? 'Great news! All your photos and icons are actively in use.'
                          : mediaSearch
                          ? `No icons match "${mediaSearch}". Try a different search.`
                          : 'Drag and drop your skills icons above to upload them!'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                    {filtered.map((asset) => {
                      const inUse = isAssetInUse(asset);
                      return (
                        <div
                          key={asset.id}
                          className={`group rounded-xl bg-black/60 border ${
                            inUse ? 'border-zinc-800 hover:border-zinc-600' : 'border-amber-900/60 hover:border-amber-500'
                          } transition-all p-2.5 flex flex-col justify-between space-y-2 shadow-sm`}
                        >
                          {/* Checkerboard Image Preview Canvas */}
                          <div className="relative w-full h-24 rounded-lg bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:8px_8px] bg-zinc-950 border border-zinc-800/80 flex items-center justify-center p-2 overflow-hidden">
                            {/* In-Use / Unused Badge */}
                            <span
                              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                inUse
                                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80'
                                  : 'bg-amber-950/90 text-amber-300 border border-amber-800/80'
                              }`}
                            >
                              {inUse ? 'In Use' : 'Unused'}
                            </span>

                            {asset.extension === 'pdf' ? (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <FileText className="w-8 h-8 text-red-400" />
                                <span className="text-[9px] font-mono text-zinc-400 uppercase">PDF Doc</span>
                              </div>
                            ) : (
                              <Image
                                src={asset.url}
                                alt={asset.name}
                                width={56}
                                height={56}
                                className="object-contain max-h-full max-w-full drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                                unoptimized
                              />
                            )}

                            {/* Format Badge */}
                            <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/80 text-zinc-300 border border-zinc-700">
                              {asset.extension}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="space-y-0.5">
                            <p
                              className="text-xs font-semibold text-white truncate"
                              title={asset.name}
                            >
                              {asset.name}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                              <span>{(asset.size / 1024).toFixed(1)} KB</span>
                              <span className="text-zinc-600">/{asset.folder}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-1.5 border-t border-zinc-850 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(asset.url)}
                              className="flex-1 py-1.5 px-2 rounded bg-zinc-850 hover:bg-white hover:text-black transition-colors text-[10px] font-semibold inline-flex items-center justify-center gap-1"
                              title="Copy URL to Clipboard"
                            >
                              {copiedUrl === asset.url ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>

                            {/* Assign Icon to a Skill Button */}
                            <button
                              type="button"
                              onClick={() => setAssignModalAsset(asset)}
                              className="p-1.5 rounded bg-zinc-850 hover:bg-cyan-500 hover:text-black transition-colors text-zinc-300"
                              title="Assign this icon to a Skill in CMS"
                            >
                              <Sparkles className="w-3 h-3" />
                            </button>

                            {/* Delete Asset */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(asset)}
                              className="p-1.5 rounded bg-zinc-850 hover:bg-red-500 hover:text-white transition-colors text-zinc-400"
                              title="Delete file"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

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
        {/* 📊 TAB 1.5: VISITOR ANALYTICS & FINGERPRINTS                              */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Real-Time Visitor Telemetry & Fingerprinting</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Track website visitors, hardware device signatures, browsers, and geographic regions.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAnalytics}
                  disabled={isLoadingAnalytics}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={clearAnalytics}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Page Views</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-extrabold text-white">{analyticsStats.totalVisits || 0}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Total page requests logged</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Unique Fingerprints</span>
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-3xl font-extrabold text-white">{analyticsStats.uniqueVisitors || 0}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Distinct device signatures</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Top Device Type</span>
                  <Smartphone className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-extrabold text-white truncate">
                  {analyticsStats.devices && analyticsStats.devices[0]
                    ? `${analyticsStats.devices[0].device_type}`
                    : 'Desktop'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">Primary audience hardware</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Top Region</span>
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-extrabold text-white truncate">
                  {analyticsStats.countries && analyticsStats.countries[0]
                    ? analyticsStats.countries[0].country
                    : 'Unknown'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">Primary geographic location</p>
              </div>
            </div>

            {/* Breakdown Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Devices Breakdown */}
              <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Device Hardware Types</span>
                </h3>
                <div className="space-y-3">
                  {analyticsStats.devices && analyticsStats.devices.length > 0 ? (
                    analyticsStats.devices.map((item: any, idx: number) => {
                      const pct = Math.round((item.count / (analyticsStats.totalVisits || 1)) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-200">{item.device_type}</span>
                            <span className="text-zinc-400">{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-zinc-500">No device data yet</p>
                  )}
                </div>
              </div>

              {/* Browsers Breakdown */}
              <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Browsers & Engines</span>
                </h3>
                <div className="space-y-3">
                  {analyticsStats.browsers && analyticsStats.browsers.length > 0 ? (
                    analyticsStats.browsers.map((item: any, idx: number) => {
                      const pct = Math.round((item.count / (analyticsStats.totalVisits || 1)) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-200">{item.browser}</span>
                            <span className="text-zinc-400">{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-zinc-500">No browser data yet</p>
                  )}
                </div>
              </div>

              {/* Geographic Regions */}
              <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Geographic Distribution</span>
                </h3>
                <div className="space-y-3">
                  {analyticsStats.countries && analyticsStats.countries.length > 0 ? (
                    analyticsStats.countries.map((item: any, idx: number) => {
                      const pct = Math.round((item.count / (analyticsStats.totalVisits || 1)) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-200">{item.country} ({item.country_code})</span>
                            <span className="text-zinc-400">{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-zinc-500">No location data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Visitor Telemetry Table */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-white" />
                  <span>Recent Visitor Access Logs (100 Most Recent)</span>
                </h3>
                <span className="text-xs font-mono text-zinc-400">{analyticsLogs.length} Records</span>
              </div>

              {analyticsLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No visitors recorded yet. Visit the portfolio website to see real-time fingerprint logs.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-mono text-[10px] border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Fingerprint Hash</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Device & OS</th>
                        <th className="py-3 px-4">Browser</th>
                        <th className="py-3 px-4">Screen</th>
                        <th className="py-3 px-4">Referrer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {analyticsLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">
                            <span title={log.fingerprint} className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                              {log.fingerprint}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-300">{log.ip_address}</td>
                          <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                            {log.city !== 'Unknown' ? `${log.city}, ${log.country}` : log.country}
                          </td>
                          <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                            <span className="font-semibold text-white">{log.device_type}</span> ({log.os})
                          </td>
                          <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">{log.browser}</td>
                          <td className="py-3 px-4 font-mono text-zinc-400">{log.screen_resolution}</td>
                          <td className="py-3 px-4 text-zinc-400 truncate max-w-[150px]" title={log.referrer}>
                            {log.referrer}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
                  <button
                    type="button"
                    onClick={handleCloudinaryMigration}
                    disabled={isMigratingImages}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-700 text-white text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isMigratingImages ? 'Migrating Images...' : 'Move Existing Images to Cloudinary'}</span>
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
                                {(() => {
                                  const raw = skill.icon || '/Skills/js.svg';
                                  const trimmed = String(raw).trim();

                                  if (trimmed.startsWith('<')) {
                                    if (process.env.NODE_ENV !== 'production') {
                                      console.warn(`Admin: rendering HTML icon snippet for "${skill.name}"`);
                                    }
                                    return (
                                      <span
                                        className="text-sm"
                                        aria-hidden
                                        dangerouslySetInnerHTML={{ __html: trimmed }}
                                      />
                                    );
                                  }

                                  if (!trimmed) {
                                    if (process.env.NODE_ENV !== 'production') {
                                      console.warn(`Admin: empty icon for "${skill.name}", using fallback`);
                                    }
                                    return <Code2 className="w-5 h-5 text-zinc-400" />;
                                  }

                                  try {
                                    return (
                                      <Image
                                        src={trimmed}
                                        alt={skill.name}
                                        width={28}
                                        height={28}
                                        unoptimized
                                        className="object-contain max-h-full max-w-full"
                                        onError={(e: any) => {
                                          e.currentTarget.style.display = 'none';
                                          if (process.env.NODE_ENV !== 'production') {
                                            console.error('Admin: Image preview failed for', skill.name, trimmed);
                                          }
                                        }}
                                      />
                                    );
                                  } catch (err) {
                                    if (process.env.NODE_ENV !== 'production') {
                                      console.error('Admin: Image render error for', skill.name, err);
                                    }
                                    return <Code2 className="w-5 h-5 text-zinc-400" />;
                                  }
                                })()}
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
                                    handleUpdateSkill(catIdx, sIdx, 'icon', e.target.value.trim())
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
                                <span>{isUploading ? '...' : 'Upload'}</span>
                                <input
                                  type="file"
                                  accept="image/*,.svg"
                                  disabled={isUploading}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      const file = e.target.files[0];
                                      e.target.value = '';
                                      handleUploadFile(file, 'Skills', (url) => {
                                        handleUpdateSkill(catIdx, sIdx, 'icon', url);
                                      });
                                    }
                                  }}
                                />
                              </label>

                              {/* 2. Media Library Picker Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setLibraryPickerTarget({ type: 'skill', catIdx, sIdx });
                                  fetchMediaAssets();
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-white hover:text-black transition-colors text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
                                title="Choose from Media Library"
                              >
                                <ImageIcon className="w-3 h-3 text-cyan-400" />
                                <span>Library</span>
                              </button>

                              {/* 3. Preset Icons Picker Dropdown */}
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
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setLibraryPickerTarget({ type: 'project', pIdx: idx });
                                  fetchMediaAssets();
                                }}
                                className="text-[11px] text-cyan-400 hover:text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <ImageIcon className="w-3 h-3" />
                                <span>Library</span>
                              </button>
                              <label className="cursor-pointer text-[11px] text-white hover:text-zinc-300 font-semibold inline-flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                <span>{isUploading ? '...' : 'Upload Image'}</span>
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

                {/* Resume & CV Document Section */}
                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-base font-bold text-white">Resume / CV Document</h3>
                    </div>
                    <span className="text-xs text-zinc-400">
                      Connected to &quot;Resume PDF&quot; &amp; &quot;Download Resume&quot; buttons on homepage
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-black/60 border border-zinc-800">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-cyan-400" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Current Resume File / URL
                      </label>
                      <input
                        type="text"
                        value={content.hero?.resumeUrl || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, resumeUrl: e.target.value },
                          })
                        }
                        placeholder="/CV.png or /api/media/resume.pdf"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                      {/* Upload new Resume */}
                      <label className="cursor-pointer px-3 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5 shadow">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Upload PDF/Image'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/*,.doc,.docx"
                          disabled={isUploading}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              const file = e.target.files[0];
                              e.target.value = '';
                              handleUploadFile(file, 'uploads', (url) => {
                                setContent({
                                  ...content,
                                  hero: { ...content.hero, resumeUrl: url },
                                });
                                alert('Resume uploaded successfully! Remember to click "Save All Changes" below to publish.');
                              });
                            }
                          }}
                        />
                      </label>

                      {/* Browse from Library */}
                      <button
                        type="button"
                        onClick={() => {
                          setLibraryPickerTarget({ type: 'resume' });
                          fetchMediaAssets();
                        }}
                        className="px-3 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Library</span>
                      </button>

                      {/* View Resume in new tab */}
                      {content.hero?.resumeUrl && (
                        <a
                          href={content.hero.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </a>
                      )}

                      {/* Remove Resume button */}
                      {content.hero?.resumeUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Remove resume from portfolio? (The download button on your homepage will be hidden until you add a new one). Click Save All Changes after removing.')) {
                              setContent({
                                ...content,
                                hero: { ...content.hero, resumeUrl: '' },
                              });
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          title="Remove resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}

                      {/* Restore Default PDF Resume when none is set */}
                      {!content.hero?.resumeUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setContent({
                              ...content,
                              hero: { ...content.hero, resumeUrl: '/Skills/Shubham_Kumar_Resume.pdf' },
                            });
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          title="Set Default PDF Resume"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Use Default PDF</span>
                        </button>
                      )}
                    </div>
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

        {/* ========================================================================= */}
        {/* 🤖 TAB: AI CHATBOT TRAINING & KNOWLEDGE BASE                              */}
        {/* ========================================================================= */}
        {activeTab === 'chatbot' && (
          <div className="space-y-8">
            {/* Top Toolbar & Summary Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Bot className="w-6 h-6 text-cyan-400" />
                  <span>AI Chatbot Training & Knowledge Base</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                  Train your portfolio chatbot with custom information about your work history, companies, projects, and recruiter FAQs. Answers are instantly saved and queried in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    fetchChatbotKnowledge();
                    fetchChatbotLogs();
                  }}
                  disabled={isLoadingKnowledge}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingKnowledge ? 'animate-spin' : ''}`} />
                  <span>{isLoadingKnowledge ? 'Syncing...' : 'Sync Knowledge'}</span>
                </button>
              </div>
            </div>

            {/* Dual Database Connection Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/90 border border-emerald-900/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Neon PostgreSQL</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                      Active Cloud DB
                    </span>
                  </div>
                  <p className="text-zinc-400">
                    Connected to AWS US-East table <code className="text-zinc-300 font-mono">portfolio_chatbot_knowledge</code>. Real-time sub-millisecond queries.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Server className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">MongoDB Integration</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                      Ready for Dual-Sync
                    </span>
                  </div>
                  <p className="text-zinc-400">
                    Mongoose schemas & models are ready. To activate dual-sync, add <code className="text-zinc-300 font-mono">MONGODB_URI=mongodb+srv://...</code> in <code className="text-zinc-300 font-mono">.env.local</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Vector RAG Pipeline Status & 1-Click Embedder Card */}
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                      <Brain className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-white font-mono">
                      Vector RAG Pipeline (Website + Database)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                      {ragStats?.totalChunks || 0} Chunks Indexed
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                    Embeds complete website sections (Hero, About, Skills, Projects, Education, Contact) and database Q&amp;A records into dense semantic vectors in Neon PostgreSQL.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReindexRAG}
                  disabled={isReindexingRAG}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReindexingRAG ? 'animate-spin' : ''}`} />
                  <span>{isReindexingRAG ? 'Reindexing...' : 'Re-Embed Website & DB'}</span>
                </button>
              </div>

              {/* RAG Metrics & Pipeline Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-0.5">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Embedding Model</span>
                  <p className="font-semibold text-white truncate">
                    {ragStats?.embeddingModel || 'Google Gemini Embedding 2'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-0.5">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Synthesis Engine</span>
                  <p className="font-semibold text-white truncate">
                    {ragStats?.generationModel || 'Google Gemini 1.5 Flash'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-0.5">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Indexed Scope</span>
                  <p className="font-semibold text-emerald-400 truncate">
                    🌐 Website Sections + 🗄️ Database Q&amp;As
                  </p>
                </div>
              </div>
            </div>

            {/* Training Form Card */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>{knowledgeForm.id ? 'Edit Training Knowledge Item' : 'Train New Knowledge / Custom Q&A'}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Teach the assistant exact details about your experience, past companies, achievements, or salary preferences.
                  </p>
                </div>

                {knowledgeForm.id && (
                  <button
                    type="button"
                    onClick={() => setKnowledgeForm({ id: '', question: '', answer: '', category: 'Experience', keywords: '' })}
                    className="text-xs text-zinc-400 hover:text-white px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {/* Pre-set Quick Templates */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  ⚡ 1-Click Common Recruiter Training Templates:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setKnowledgeForm({
                        id: '',
                        question: 'Where has Shubham worked? / What is his previous company history?',
                        answer:
                          'Shubham Kumar has worked as a Full Stack Software Developer delivering enterprise-grade backend systems and responsive web applications at **APK Elite Services** (Freelance Full Stack Engineer), where he engineered scalable Spring Boot microservices, high-speed PostgreSQL databases, and modern Angular and React frontends.',
                        category: 'Experience',
                        keywords: 'work, working, warking, company, companies, experience, previous, apk elite, employer, employment, job',
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>🏢 Where has Shubham worked?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setKnowledgeForm({
                        id: '',
                        question: 'Why should we hire Shubham Kumar?',
                        answer:
                          'Shubham brings hands-on mastery of full-stack engineering across **Java, Spring Boot, PostgreSQL, Angular, and React**. He combines robust backend architectural principles (clean code, ACID transactions, microservices) with dynamic, polished user interfaces and holds both a **BSc and MSc in Computer Science**.',
                        category: 'General',
                        keywords: 'why hire, strengths, why choose, value, qualities, interview',
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>🎯 Why should we hire Shubham?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setKnowledgeForm({
                        id: '',
                        question: 'What is Shubham\'s notice period and availability?',
                        answer:
                          'Shubham is **immediately available** to join promising opportunities as a Full-Time Software Engineer. He has **0 notice period** and is open to immediate start dates for remote, hybrid, or on-site roles.',
                        category: 'Contact & Career',
                        keywords: 'notice period, immediate, join, availability, start date, hiring',
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>⏱️ Immediate Notice Period</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setKnowledgeForm({
                        id: '',
                        question: 'Is Shubham willing to relocate?',
                        answer:
                          'Yes! Shubham is based in **Pune, Maharashtra, India**, and is fully open to relocation to major tech hubs (Bengaluru, Hyderabad, Mumbai, Delhi-NCR) as well as global remote roles.',
                        category: 'Contact & Career',
                        keywords: 'relocate, relocation, location, pune, bangalore, hyderabad, remote',
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>📍 Relocation Preferences</span>
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleSaveKnowledge} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      User Question or Topic <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Where was Shubham working? / What are his key projects?"
                      value={knowledgeForm.question}
                      onChange={(e) => setKnowledgeForm({ ...knowledgeForm, question: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">Category</label>
                    <select
                      value={knowledgeForm.category}
                      onChange={(e) => setKnowledgeForm({ ...knowledgeForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Experience">Experience & Companies</option>
                      <option value="Skills">Skills & Tech Stack</option>
                      <option value="Projects">Projects & Architecture</option>
                      <option value="Education">Education & Credentials</option>
                      <option value="Contact & Career">Contact & Career Availability</option>
                      <option value="General">General / Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Search Keywords & Typos (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., working, worked, warking, company, companies, experience, apk elite, history"
                    value={knowledgeForm.keywords}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, keywords: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Include common words, abbreviations, or typos (e.g. &quot;warking&quot; for working) so the AI matches user variations.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Chatbot Answer (Supports Markdown &amp; Bold) <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write the exact answer the chatbot should reply with..."
                    value={knowledgeForm.answer}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, answer: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {knowledgeSaveSuccess ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saved and trained successfully to Neon PostgreSQL!</span>
                    </div>
                  ) : (
                    <div></div>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingKnowledge}
                    className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingKnowledge ? 'Training Model...' : knowledgeForm.id ? 'Update Knowledge' : 'Train & Save Knowledge'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Knowledge Base List & Management */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Trained Knowledge Items</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                      {knowledgeList.length} total
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    All trained responses currently active in the chatbot.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Filter questions..."
                      value={knowledgeSearch}
                      onChange={(e) => setKnowledgeSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              {isLoadingKnowledge ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
                  <span>Loading trained knowledge items...</span>
                </div>
              ) : knowledgeList.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                  <Bot className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="font-semibold text-zinc-400">No custom knowledge items added yet</p>
                  <p className="mt-1 text-zinc-500">
                    Use the 1-Click Templates above to add information about your work experience and company history!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {knowledgeList
                    .filter((item) => {
                      const q = knowledgeSearch.toLowerCase();
                      return (
                        !q ||
                        item.question?.toLowerCase().includes(q) ||
                        item.answer?.toLowerCase().includes(q) ||
                        item.category?.toLowerCase().includes(q) ||
                        (Array.isArray(item.keywords) && item.keywords.some((k: string) => k.toLowerCase().includes(q)))
                      );
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-black/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {item.category || 'General'}
                              </span>
                              <h4 className="text-sm font-bold text-white">{item.question}</h4>
                            </div>

                            {/* Keywords pills */}
                            {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {item.keywords.map((kw: string, ki: number) => (
                                  <span
                                    key={ki}
                                    className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px] border border-zinc-800"
                                  >
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditKnowledge(item)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-white hover:text-black text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteKnowledge(item.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-400 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-300 bg-zinc-950/80 p-3 rounded-lg border border-zinc-850 whitespace-pre-wrap leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Visitor Chat Logs Audit */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Recent Visitor Chat Inquiries</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                      {chatbotLogs.length} logged
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    See what recruiters and visitors are asking your chatbot, and click &quot;Train Question&quot; to provide tailored answers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchChatbotLogs}
                  disabled={isLoadingChatbotLogs}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Refresh Logs
                </button>
              </div>

              {isLoadingChatbotLogs ? (
                <div className="py-8 text-center text-xs text-zinc-500">Loading chat logs...</div>
              ) : chatbotLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No visitor chatbot logs recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Visitor Query</th>
                        <th className="py-2.5 px-3">Chatbot Reply</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {chatbotLogs.slice(0, 15).map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-900/30">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white max-w-xs truncate">
                            {log.userMessage}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400 max-w-sm truncate">
                            {log.botResponse}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setKnowledgeForm({
                                  id: '',
                                  question: log.userMessage,
                                  answer: '',
                                  category: 'Experience',
                                  keywords: log.userMessage.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).join(', '),
                                });
                                window.scrollTo({ top: 350, behavior: 'smooth' });
                              }}
                              className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-cyan-400 hover:text-black text-[11px] font-semibold text-zinc-300 transition-colors"
                            >
                              Train Question
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: ASSIGN ASSET TO SKILL                                           */}
        {/* ========================================================================= */}
        {assignModalAsset && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Assign Icon to Portfolio Skill</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignModalAsset(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Icon Preview */}
              <div className="flex items-center gap-3 p-3 bg-black/60 rounded-xl border border-zinc-800">
                <div className="w-12 h-12 rounded-lg bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:6px_6px] bg-zinc-950 border border-zinc-800 flex items-center justify-center p-2 shrink-0">
                  <Image
                    src={assignModalAsset.url}
                    alt={assignModalAsset.name}
                    width={36}
                    height={36}
                    className="object-contain max-h-full max-w-full"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{assignModalAsset.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">{assignModalAsset.url}</p>
                </div>
              </div>

              {/* Select Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-400">Target Skill Category</label>
                <select
                  value={assignTargetCategory}
                  onChange={(e) => {
                    setAssignTargetCategory(Number(e.target.value));
                    setAssignTargetSkill(0);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-xs text-white focus:outline-none focus:border-white"
                >
                  {content.skills?.map((cat: any, cIdx: number) => (
                    <option key={cIdx} value={cIdx}>
                      {cat.category} ({cat.skills?.length || 0} skills)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Skill */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-400">Target Skill</label>
                <select
                  value={assignTargetSkill}
                  onChange={(e) => setAssignTargetSkill(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-xs text-white focus:outline-none focus:border-white"
                >
                  {content.skills?.[assignTargetCategory]?.skills?.map((s: any, sIdx: number) => (
                    <option key={sIdx} value={sIdx}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalAsset(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateSkill(assignTargetCategory, assignTargetSkill, 'icon', assignModalAsset.url);
                    const targetSkillName =
                      content.skills?.[assignTargetCategory]?.skills?.[assignTargetSkill]?.name || 'skill';
                    alert(`Assigned "${assignModalAsset.name}" to ${targetSkillName}! Remember to click "Save All Changes" in the CMS.`);
                    setAssignModalAsset(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md shadow-white/10"
                >
                  Apply Icon
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: BROWSE MEDIA LIBRARY PICKER                                      */}
        {/* ========================================================================= */}
        {libraryPickerTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    Select from Media Library{' '}
                    <span className="text-xs font-normal text-zinc-400">
                      ({libraryPickerTarget.type === 'skill'
                        ? 'for Skill Icon'
                        : libraryPickerTarget.type === 'project'
                        ? 'for Project Screenshot'
                        : 'for Resume / CV'})
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLibraryPickerTarget(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-zinc-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* Icon Grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {mediaAssets
                    .filter((a) => {
                      return (
                        !mediaSearch ||
                        a.name.toLowerCase().includes(mediaSearch.toLowerCase())
                      );
                    })
                    .map((asset) => (
                      <button
                        type="button"
                        key={asset.id}
                        onClick={() => {
                          if (libraryPickerTarget.type === 'skill') {
                            handleUpdateSkill(
                              libraryPickerTarget.catIdx,
                              libraryPickerTarget.sIdx,
                              'icon',
                              asset.url
                            );
                          } else if (libraryPickerTarget.type === 'project') {
                            const updated = [...content.projects];
                            updated[libraryPickerTarget.pIdx].image = asset.url;
                            setContent({ ...content, projects: updated });
                          } else if (libraryPickerTarget.type === 'resume') {
                            setContent({
                              ...content,
                              hero: { ...content.hero, resumeUrl: asset.url },
                            });
                          }
                          setLibraryPickerTarget(null);
                        }}
                        className="group p-2 rounded-xl bg-black/50 border border-zinc-800 hover:border-cyan-400 hover:bg-zinc-800/60 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:4px_4px] bg-zinc-950 flex items-center justify-center p-1.5 overflow-hidden">
                          {asset.extension === 'pdf' ? (
                            <FileText className="w-5 h-5 text-red-400" />
                          ) : (
                            <Image
                              src={asset.url}
                              alt={asset.name}
                              width={28}
                              height={28}
                              className="object-contain max-h-full max-w-full group-hover:scale-110 transition-transform"
                              unoptimized
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-300 truncate w-full group-hover:text-white">
                          {asset.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>Click any icon to attach it immediately.</span>
                <button
                  type="button"
                  onClick={() => setLibraryPickerTarget(null)}
                  className="px-4 py-1.5 rounded-xl bg-zinc-800 text-white font-semibold hover:bg-zinc-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
