'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  FileText,
  ExternalLink,
  Bot,
  RotateCcw,
  CheckCircle2,
  Mail,
  User,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
  downloadLink?: { url: string; filename: string };
  links?: { label: string; url: string }[];
  isStreaming?: boolean;
}

function formatMessageMarkdown(line: string) {
  if (!line.trim()) return <div className="h-1" />;

  // Heading check: ### Heading
  if (line.startsWith('### ')) {
    return (
      <p className="font-semibold text-slate-100 text-[11px] uppercase tracking-[0.14em] border-b border-slate-700/80 pb-1 mb-1">
        {line.replace('### ', '')}
      </p>
    );
  }

  // Bullet point check: • or -
  const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
  const cleanLine = isBullet ? line.trim().replace(/^[•-]\s*/, '') : line;

  // Auto-close open bold markdown if streaming in the middle of bold text
  let safeLine = cleanLine;
  const boldCount = (safeLine.match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    safeLine += '**';
  }

  // Parse bold text **bold**
  const parts = safeLine.split(/(\*\*.*?\*\*)/g);

  const formattedContent = parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-50">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });

  if (isBullet) {
    return (
      <div className="flex items-start gap-2 pl-0.5 text-slate-200">
        <span className="text-[#5B8DEF] font-semibold text-xs select-none mt-0.5">•</span>
        <div className="flex-1 leading-relaxed">{formattedContent}</div>
      </div>
    );
  }

  return <p className="text-slate-200 leading-relaxed">{formattedContent}</p>;
}

function StreamedMessage({
  text,
  isStreaming,
  onComplete,
  onLineRendered,
}: {
  text: string;
  isStreaming?: boolean;
  onComplete?: () => void;
  onLineRendered?: () => void;
}) {
  const [displayedLength, setDisplayedLength] = useState(() => (isStreaming ? 0 : text.length));
  const [isFinished, setIsFinished] = useState(() => !isStreaming);

  useEffect(() => {
    if (!isStreaming || isFinished) {
      setDisplayedLength(text.length);
      return;
    }

    let currentIndex = 0;
    // Ultra-smooth typewriter streaming: ~2-3 chars per frame (18ms)
    const stepSize = Math.max(2, Math.floor(text.length / 90));
    const intervalTime = 16;

    const timer = setInterval(() => {
      currentIndex += stepSize;
      if (currentIndex >= text.length) {
        setDisplayedLength(text.length);
        setIsFinished(true);
        clearInterval(timer);
        onComplete?.();
        onLineRendered?.();
      } else {
        setDisplayedLength(currentIndex);
        onLineRendered?.();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [text, isStreaming, isFinished, onComplete, onLineRendered]);

  const currentText = text.slice(0, displayedLength);
  const lines = currentText.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => (
        <div key={idx}>
          {formatMessageMarkdown(line)}
        </div>
      ))}
      {!isFinished && isStreaming && (
        <span className="inline-block w-2 h-3.5 bg-cyan-400 animate-pulse ml-0.5 rounded-sm align-middle shadow-sm shadow-cyan-400/80" />
      )}
    </div>
  );
}

interface PortfolioChatbotProps {
  content?: any;
}

export default function PortfolioChatbot({ content }: PortfolioChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInquiryMode, setIsInquiryMode] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', message: '' });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Persistent Session ID for visitor chat audit logs in PostgreSQL & MongoDB
  const [sessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('skm_chat_session');
      if (stored) return stored;
      const created = 'sess_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
      sessionStorage.setItem('skm_chat_session', created);
      return created;
    }
    return 'sess_' + Date.now();
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resumeUrl = content?.hero?.resumeUrl || '/Skills/Shubham_Kumar_Resume.pdf';

  // Deliberately start empty so the panel opens with direct, portfolio-relevant questions.
  const initialMessages: ChatMessage[] = [];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const openers = [
    'What has Shubham built with Spring Boot?',
    'Is he available for full-time roles?',
    'Walk me through the microservices project',
  ];

  const panelTheme: React.CSSProperties = {
    ['--pa-bg' as any]: '#050505',
    ['--pa-surface' as any]: '#121212',
    ['--pa-surface-2' as any]: '#1A1A1A',
    ['--pa-line' as any]: '#262626',
    ['--pa-line-hi' as any]: '#3D3D3D',
    ['--pa-muted' as any]: '#7A7A7A',
    ['--pa-text' as any]: '#F2F2F2',
    ['--pa-accent' as any]: '#FFFFFF',
    ['--pa-live' as any]: '#4AD07A',
    ['--pa-danger' as any]: '#F0857A',
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (isModifierPressed && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Answer matching logic grounded in real portfolio content
  const generateResponse = (rawInput: string): ChatMessage => {
    const q = rawInput.toLowerCase().trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Greetings (hi, hello, hey, namaste, etc.)
    if (/^\s*(hi|hii|hiii|hello|helo|hey|heyy|howdy|sup|hola|namaste|yo|good\s*(morning|afternoon|evening))\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Hello! Great to meet you! 😊\n\nI'm **Shubham's AI Portfolio Assistant**. I'm here to help you learn about his full-stack software engineering experience, explore his projects, or connect with him directly.\n\nWhat would you like to know?`,
        timestamp: time,
        quickActions: [
          { label: '⚡ Top Tech Stack', action: 'skills' },
          { label: '🚀 Featured Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '📬 Contact Shubham', action: 'contact' },
        ],
      };
    }

    // 2. Small talk / "How are you"
    if (/\b(how\s+(are\s+you|r\s+u|do\s+you\s+do|is\s+it\s+going)|how's\s+it\s+going|whats?\s+up)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `I'm doing great, thank you for asking! 😊 Ready to help you discover Shubham's software projects, technical skills, or download his resume.\n\nAre you looking to hire a developer or learn more about his background?`,
        timestamp: time,
        quickActions: [
          { label: '👨‍💻 Who is Shubham?', action: 'who_is_shubham' },
          { label: '⚡ Top Skills', action: 'skills' },
          { label: '🚀 View Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
        ],
      };
    }

    // 3. "Who are you" / "What can you do"
    if (/\b(who\s+(are\s+you|r\s+u)|what\s+are\s+you|what\s+can\s+you\s+do|your\s+name|introduce\s+yourself)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `I am an interactive AI assistant built specifically for **Shubham Kumar's developer portfolio**!\n\nI know all about his software development background in **Java, Spring Boot, React, Angular, PostgreSQL, and Cloud**.\n\nYou can ask me questions like:\n• *"What are Shubham's top skills?"*\n• *"Show me his featured projects"*\n• *"What is his educational background?"*\n• *"How can I contact or hire him?"*\n• *"Download resume"*`,
        timestamp: time,
        quickActions: [
          { label: '⚡ Core Skills', action: 'skills' },
          { label: '🚀 Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '📬 Contact Info', action: 'contact' },
        ],
      };
    }

    // 4. "Who is Shubham" / About Shubham
    if (
      /\b(who\s+is\s+shubham|about\s+shubham|tell\s+me\s+about\s+(shubham|him)|bio|background|profile)\b/i.test(q) ||
      q === 'who_is_shubham'
    ) {
      const bio =
        content?.about?.bio ||
        'Shubham Kumar is an enthusiastic and detail-oriented Full Stack Developer specializing in architecting scalable, resilient web applications using Java, Spring Boot, PostgreSQL, Angular, and React.';
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 👨‍💻 About Shubham Kumar\n\n${bio}\n\n• **Degrees**: BSc & MSc in Computer Science (Indira University, Pune)\n• **Core Focus**: High-performance backend microservices, modern responsive frontends, and cloud databases.`,
        timestamp: time,
        quickActions: [
          { label: '⚡ Tech Stack', action: 'skills' },
          { label: '🚀 Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '📬 Contact Info', action: 'contact' },
        ],
      };
    }

    // 5. Thanks / Appreciation
    if (/\b(thank|thanks|thx|appreciate|thank\s+you)\b/i.test(q) || /^(good|great|awesome|cool|nice|perfect)$/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `You're very welcome! 😊 Feel free to ask anything else or reach out to Shubham directly if you have an opportunity or project in mind!`,
        timestamp: time,
        quickActions: [
          { label: '📄 Download Resume', action: 'resume' },
          { label: '📬 Contact Shubham', action: 'contact' },
          { label: '🚀 Explore Projects', action: 'projects' },
        ],
      };
    }

    // 6. Goodbye
    if (/\b(bye|goodbye|see\s+you|cya|take\s+care)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Goodbye! Thanks for stopping by Shubham's portfolio. Have a wonderful day! 👋✨`,
        timestamp: time,
        quickActions: [
          { label: '📄 Download Resume Before Leaving', action: 'resume' },
        ],
      };
    }

    // 7. Location & Availability (Strict word phrases to avoid false triggers like 'believe')
    if (
      /\b(where\s+(do\s+you|are\s+you|is\s+shubham)\s+(live|located|based)|current\s+location|which\s+city|based\s+in|in\s+pune|open\s+to\s+(work|relocate|relocation)|remote\s+work|notice\s+period)\b/i.test(q)
    ) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 📍 Location & Availability\n\n• **Location**: Pune, Maharashtra, India\n• **Availability**: Actively open for **Full-Time Software Engineer** roles, contract projects, and remote/hybrid positions worldwide.\n• **Notice Period**: Available immediately for promising opportunities!`,
        timestamp: time,
        quickActions: [
          { label: '📬 Hire / Contact', action: 'contact' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '⚡ Core Skills', action: 'skills' },
        ],
      };
    }

    // 8. Resume / CV query
    if (/\b(resume|cv|curriculum\s+vitae|download\s+resume)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Here is Shubham Kumar's official PDF resume. You can download it directly using the button below or open it in a new tab:`,
        timestamp: time,
        downloadLink: {
          url: resumeUrl,
          filename: 'Shubham_Kumar_Resume.pdf',
        },
        quickActions: [
          { label: '⚡ Top Skills', action: 'skills' },
          { label: '🚀 Projects', action: 'projects' },
          { label: '📬 Contact Info', action: 'contact' },
        ],
      };
    }

    // 9. Specific Backend Skills (Java, Spring Boot, Microservices)
    if (/\b(java|spring\s*boot|spring|microservices?|rest\s*apis?|hibernate|jpa)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### ☕ Java & Spring Boot Backend Expertise\n\nShubham specializes in building scalable, enterprise-grade backend applications:\n\n• **Core & Advanced Java**: Java 8/11/17/21, OOP, Multithreading, Streams API, Collections, JVM.\n• **Spring Boot**: REST APIs, Microservices Architecture, Spring Data JPA, Spring Security, Hibernate ORM.\n• **Performance & Reliability**: Connection pooling, caching, transaction management, and secure token authorization.`,
        timestamp: time,
        quickActions: [
          { label: '🚀 View Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '⚡ Full Tech Stack', action: 'skills' },
        ],
      };
    }

    // 10. Specific Frontend Skills (Angular, React, Next.js)
    if (/\b(angular|react|next\.?js|javascript|typescript|tailwind|frontend|css3?)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### ⚛️ Frontend Engineering Expertise\n\nShubham crafts responsive, interactive, high-conversion user interfaces:\n\n• **Angular**: Angular 18, TypeScript, RxJS, modular components, reactive forms, routing.\n• **React & Next.js**: React 19, Next.js 15 App Router, Server Components, SSR, hooks.\n• **Styling & Motion**: Tailwind CSS, CSS3, Framer Motion for smooth 60 FPS animations.`,
        timestamp: time,
        quickActions: [
          { label: '🚀 View Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '⚡ Full Tech Stack', action: 'skills' },
        ],
      };
    }

    // 11. Database Skills (PostgreSQL, SQL, MongoDB)
    if (/\b(postgres|postgresql|database|sql|mongodb|mongo|mysql|oracle)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 🗄️ Database & Cloud Storage\n\n• **Relational Databases**: PostgreSQL, MySQL, Oracle SQL — index tuning, complex queries, foreign keys, ACID compliance.\n• **NoSQL**: MongoDB with Mongoose schemas.\n• **Cloud Databases**: Neon Tech Serverless PostgreSQL with edge pooling and automated migrations.`,
        timestamp: time,
        quickActions: [
          { label: '🚀 View Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '⚡ Core Skills', action: 'skills' },
        ],
      };
    }

    // 12. General Skills / Technologies query
    if (/\b(skills?|tech(\s*stack)?|technologies|tools|languages?|docker|cloud|aws)\b/i.test(q)) {
      const skillsCategories = content?.skills || [];
      let skillsSummary = '';

      if (skillsCategories.length > 0) {
        skillsSummary = skillsCategories
          .map((cat: any) => `• **${cat.category || 'Tech'}**: ${cat.skills?.map((s: any) => s.name).join(', ') || ''}`)
          .join('\n');
      } else {
        skillsSummary = `• **Backend**: Java, Spring Boot, Microservices, REST APIs\n• **Frontend**: Angular, React, Next.js, TypeScript, Tailwind CSS\n• **Databases**: PostgreSQL, MySQL, MongoDB, Oracle\n• **Cloud & Tools**: AWS, Docker, Git, CI/CD, Linux`;
      }

      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 💻 Shubham's Technical Stack\n\nShubham is a **Full Stack Software Developer** with expertise across modern frontend, resilient backend systems, and database engineering:\n\n${skillsSummary}\n\nWould you like to explore his projects built with these technologies?`,
        timestamp: time,
        quickActions: [
          { label: '🚀 View Projects', action: 'projects' },
          { label: '📄 Get Resume', action: 'resume' },
          { label: '📬 Hire Shubham', action: 'contact' },
        ],
      };
    }

    // 13. Projects query
    if (/\b(projects?|portfolio(\s*work)?|featured\s*(projects?|work)|showcase|work\s+samples?|ecommerce)\b/i.test(q)) {
      const projects = content?.projects || [];
      let projText = '### 🚀 Featured Engineering Projects\n\n';

      if (projects.length > 0) {
        projects.slice(0, 3).forEach((p: any, idx: number) => {
          projText += `${idx + 1}. **${p.title}**\n   ${p.description}\n   *Tech*: ${p.tech?.join(', ') || 'Full Stack'}\n\n`;
        });
      } else {
        projText += `1. **Modern E-Commerce Storefront**: High-performance shopping platform with dynamic basket management and secure checkout.\n2. **Enterprise Cloud ERP**: Modular backend microservices in Spring Boot and PostgreSQL with Angular UI.\n3. **Full Stack Developer Portfolio**: Next.js 15, Neon PostgreSQL, dynamic media CMS & visitor analytics.`;
      }

      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: projText,
        timestamp: time,
        links: [
          { label: 'Explore All Projects on Page', url: '#projects' },
          { label: 'GitHub Profile', url: 'https://github.com/shubham-2011' },
        ],
        quickActions: [
          { label: '📄 Download Resume', action: 'resume' },
          { label: '⚡ Core Skills', action: 'skills' },
          { label: '📬 Hire / Contact', action: 'contact' },
        ],
      };
    }

    // 14. Education / Background
    if (/\b(education|degree|college|university|msc|bsc|study|studies|academics?)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 🎓 Education & Credentials\n\n• **Master of Science (MSc) in Computer Science** — Currently pursuing at **Indira University, Pune, Maharashtra**.\n• **Bachelor of Science (BSc) in Computer Science** — Completed with strong focus on Software Architecture, Data Structures & Algorithms, and Distributed Systems.`,
        timestamp: time,
        quickActions: [
          { label: '⚡ Top Tech Stack', action: 'skills' },
          { label: '🚀 Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
        ],
      };
    }

    // 15. Contact / Hire / Message / Phone Number (Handles typos like contect, mobile, number, etc.)
    if (/\b(contact|contect|cntact|kontact|hire|email|phone|fone|number|num|mobile|mobil|call|message|whatsapp|watsapp|reach|talk)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 📬 Connect with Shubham\n\n• **Phone / WhatsApp**: [+91 9322887529](tel:+919322887529)\n• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)\n• **Location**: Pune, Maharashtra, India\n• **LinkedIn**: [linkedin.com/in/shubham-kumar-48b57023b](https://www.linkedin.com/in/shubham-kumar-48b57023b/)\n• **Availability**: Open for Full-Time & Freelance opportunities (0 Days Notice)\n\nYou can also **send a direct message** right here in this chat!`,
        timestamp: time,
        quickActions: [
          { label: '💬 Send Message Now', action: 'leave_message' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '🚀 View Projects', action: 'projects' },
        ],
      };
    }

    // 16. Experience & Work History (All 3 Companies)
    if (/\b(experience|experiance|work|worked|working|company|companies|history|career|roles?|intern|internship)\b/i.test(q)) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 💼 Shubham's Professional Work Experience\n\nShubham has proven experience across enterprise microservices, databases, and responsive web applications:\n\n1. **APK Elite Services** — Freelance Full Stack Developer *(2024 - Present)*\n   • Engineered scalable Spring Boot microservices, high-speed PostgreSQL databases, and modern Angular 18 & React 19 frontends.\n   • Managed end-to-end SDLC and client production deployments.\n\n2. **Tipco Engineering** — Website Developer *(Jul 2026 - Aug 2026)*\n   • Engineered scalable microservices and intuitive user interfaces.\n   • Collaborated actively in agile engineering teams and optimized database query execution.\n\n3. **SetTribe** — Full Stack Developer Intern *(Feb 2024 - Nov 2024)*\n   • Contributed to customer-facing web applications, engineered reusable UI modules, and integrated RESTful APIs.`,
        timestamp: time,
        quickActions: [
          { label: '🚀 View Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '📬 Contact Info', action: 'contact' },
        ],
      };
    }

    // 17. Courteous Grounded Fallback for Out-of-Domain / Random Questions
    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: `I'm an AI assistant dedicated specifically to **Shubham Kumar's developer portfolio, software projects, and engineering capabilities**! 😊\n\nI don't have information on topics outside of Shubham's portfolio, but I'd love to help you with:\n• *"What is Shubham's tech stack?"*\n• *"Show me his featured projects"*\n• *"What is his education & background?"*\n• *"How can I download his resume or contact him?"*`,
      timestamp: time,
      quickActions: [
        { label: '⚡ Top Tech Stack', action: 'skills' },
        { label: '🚀 Featured Projects', action: 'projects' },
        { label: '📄 Download Resume', action: 'resume' },
        { label: '📬 Contact & Hire', action: 'contact' },
      ],
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send query to AI RAG backend
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.hasCustomAnswer && data?.answer) {
          const isContactRelated = (data.category === 'Contact' || data.answer.includes('shubhammisra800@gmail.com'));
          const customResponse: ChatMessage = {
            id: Date.now().toString(),
            sender: 'bot',
            text: data.answer,
            timestamp: time,
            isStreaming: true,
            quickActions: isContactRelated
              ? [
                  { label: '📬 Leave a Message (Form)', action: 'leave_message' },
                  { label: '📄 Download Resume', action: 'resume' },
                  { label: '⚡ Core Tech Stack', action: 'skills' },
                  { label: '🚀 Featured Projects', action: 'projects' },
                ]
              : [
                  { label: '⚡ Top Tech Stack', action: 'skills' },
                  { label: '🚀 Featured Projects', action: 'projects' },
                  { label: '📄 Download Resume', action: 'resume' },
                  { label: '📬 Contact Shubham', action: 'contact' },
                ],
          };
          setMessages((prev) => [...prev, customResponse]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Dynamic knowledge lookup fallback:', err);
    }

    // 2. Built-in conversational intelligence
    setTimeout(() => {
      const botResponse = { ...generateResponse(query), isStreaming: true };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);

      // Async log to DB
      try {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            sessionId,
            botResponse: botResponse.text,
          }),
        }).catch(() => {});
      } catch (_) {}
    }, 450);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'leave_message') {
      setIsInquiryMode(true);
      return;
    }
    const actionPrompts: Record<string, string> = {
      skills: 'What are Shubham’s core skills and tech stack?',
      projects: 'Can you show me Shubham’s featured projects?',
      resume: 'I would like to download Shubham’s resume.',
      education: 'What is Shubham’s educational background?',
      contact: 'How can I contact or hire Shubham?',
      who_is_shubham: 'Tell me about Shubham Kumar and his background.',
    };

    const promptText = actionPrompts[action] || action;
    handleSendMessage(promptText);
  };

  // Submit in-chat inquiry form to /api/contact
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryData.name || !inquiryData.email || !inquiryData.message) {
      alert('Please fill out your name, email, and message.');
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryData.name,
          email: inquiryData.email,
          phone: 'Via Portfolio Chatbot',
          subject: `Chatbot Inquiry from ${inquiryData.name}`,
          message: inquiryData.message,
        }),
      });

      if (res.ok) {
        setInquirySuccess(true);
        setTimeout(() => {
          setIsInquiryMode(false);
          setInquirySuccess(false);
          setInquiryData({ name: '', email: '', message: '' });

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'bot',
              text: `✅ **Thank you, ${inquiryData.name}!**\n\nYour message has been safely delivered to Shubham's database and inbox. He will get back to you shortly at **${inquiryData.email}**!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              quickActions: [
                { label: '📄 Download Resume', action: 'resume' },
                { label: '🚀 Explore Projects', action: 'projects' },
              ],
            },
          ]);
        }, 1500);
      } else {
        alert('Could not send message. Please try sending via email.');
      }
    } catch (err) {
      alert('Network error while sending message.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
    setIsInquiryMode(false);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <motion.button
          ref={triggerRef}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setHasInteracted(true);
          }}
          className="group relative flex items-center justify-center rounded-full border border-[#262626] bg-[#121212] text-[#F2F2F2] shadow-[0_8px_28px_rgba(0,0,0,0.42)] transition-all duration-180 ease-out w-12 h-12 sm:w-auto sm:h-11 sm:px-4 sm:py-2.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          aria-label={isOpen ? 'Close Chatbot Assistant' : 'Open Chatbot Assistant'}
          aria-expanded={isOpen}
          aria-controls="portfolio-assistant-panel"
        >
          {!isOpen ? (
            <>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="sm:mr-2">
                <path d="M4 5.5h16v11h-8.5L7 21v-4.5H4z" />
              </svg>
              <span className="hidden sm:inline text-[12px] font-medium text-[#F2F2F2]">Ask about my work</span>
            </>
          ) : (
            <X className="w-5 h-5 text-[#F2F2F2]" />
          )}
        </motion.button>
      </div>

      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id="portfolio-assistant-panel"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={panelTheme}
            className="fixed bottom-24 right-2 left-2 sm:right-6 sm:left-auto z-50 w-auto sm:w-[392px] h-[min(620px,calc(100dvh-28px))] sm:h-[min(620px,calc(100dvh-48px))] max-h-[82vh] rounded-[14px] sm:rounded-[14px] bg-[#050505] border border-[#262626] shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-2xl flex flex-col overflow-hidden text-[#F2F2F2]"
            role="dialog"
            aria-label="Portfolio assistant"
          >
            {/* Chat Header */}
            <div className="px-4 py-3 bg-[#050505] border-b border-[#262626] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#262626] bg-[#121212] shrink-0 shadow-inner">
                  <Image
                    src="/Skills/shubham3-rm.png"
                    alt="Shubham Kumar"
                    fill
                    sizes="32px"
                    className="object-cover object-top"
                    unoptimized
                  />
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-[#F2F2F2] leading-none">
                    Portfolio assistant
                  </h3>
                  <p className="mt-1 text-[12px] leading-[1.45] text-[#7A7A7A]">
                    Trained on projects and stack
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-md text-[#7A7A7A] hover:text-[#F2F2F2] hover:bg-[#121212] border border-transparent hover:border-[#3D3D3D] transition-colors"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize chat"
                  className="p-1.5 rounded-md text-[#7A7A7A] hover:text-[#F2F2F2] hover:bg-[#121212] border border-transparent hover:border-[#3D3D3D] transition-colors"
                  aria-label="Close portfolio assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs selection:bg-[#F2F2F2] selection:text-[#050505]">
              {messages.length === 0 ? (
                <div className="space-y-3 pt-1">
                  <p className="text-[14px] leading-[1.6] text-[#F2F2F2] max-w-[32ch]">
                    Ask anything about the projects, the stack behind them, or availability.
                  </p>

                  <div className="border-t border-[#262626] pt-3 space-y-2">
                    {openers.map((opener) => (
                      <button
                        key={opener}
                        type="button"
                        onClick={() => handleSendMessage(opener)}
                        className="block w-full text-left text-[14px] leading-[1.6] text-[#F2F2F2] border-b border-[#262626] pb-2 hover:text-[#FFFFFF] hover:border-[#3D3D3D] transition-colors"
                      >
                        {opener}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] whitespace-pre-wrap leading-relaxed ${
                        msg.sender === 'user'
                          ? 'p-3 rounded-[14px_14px_4px_14px] bg-[#121212] border border-[#262626] text-[#F2F2F2] shadow-[0_8px_19px_rgba(0,0,0,0.18)]'
                          : 'pl-3.5 border-l border-[rgba(255,255,255,0.28)] text-[#F2F2F2]'
                      }`}
                    >
                      {/* Render message text with smooth line-by-line reveal for bot and instant for user */}
                      {msg.sender === 'user' ? (
                        <div>
                          {msg.text.split('\n').map((line, idx) => (
                            <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <StreamedMessage
                          text={msg.text}
                          isStreaming={msg.isStreaming}
                          onLineRendered={() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        />
                      )}

                      {/* Download Resume Button right inside message */}
                      {msg.downloadLink && (
                        <div className="mt-3 pt-2.5 border-t border-[#262626]">
                          <a
                            href={msg.downloadLink.url}
                            download={msg.downloadLink.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#F2F2F2] text-[#050505] font-bold text-xs hover:bg-[#FFFFFF] transition-colors shadow"
                          >
                            <FileText className="w-4 h-4 text-[#050505]" />
                            <span>Download Official PDF Resume</span>
                          </a>
                        </div>
                      )}

                      {/* External links in message */}
                      {msg.links && (
                        <div className="mt-2.5 pt-2 border-t border-[#262626] flex flex-wrap gap-2">
                          {msg.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target={link.url.startsWith('http') ? '_blank' : '_self'}
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#F2F2F2] underline decoration-[#3D3D3D] underline-offset-2"
                            >
                              <span>{link.label}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-[#7A7A7A] mt-1 px-1">{msg.timestamp}</span>

                    {/* Quick Action Chips */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                        {msg.quickActions.map((qa, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleQuickAction(qa.action)}
                            className="px-2.5 py-1 rounded-full bg-[#121212] hover:bg-[#1A1A1A] border border-[#262626] text-[#F2F2F2] hover:text-[#FFFFFF] text-[10px] font-medium transition-colors active:scale-95 font-mono tracking-[0.08em] uppercase"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Minimalist sleek typing indicator */}
              {isTyping && (
                <div aria-live="polite" className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#121212] border border-[#262626] text-[#7A7A7A] w-14 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2F2F2] opacity-60 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2F2F2] opacity-60 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2F2F2] opacity-60 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}

              {/* In-Chat Direct Inquiry Form */}
              {isInquiryMode && (
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-cyan-500/40 space-y-2.5 mt-2 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Leave a Message for Shubham</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsInquiryMode(false)}
                      className="text-zinc-400 hover:text-white text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>

                  {inquirySuccess ? (
                    <div className="py-4 text-center space-y-1 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6 mx-auto" />
                      <p className="text-xs font-bold">Message Delivered!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInquiry} className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={inquiryData.name}
                        onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Your Email Address"
                        value={inquiryData.email}
                        onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <textarea
                        required
                        rows={2}
                        placeholder="Your inquiry or project details..."
                        value={inquiryData.message}
                        onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingInquiry}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isSubmittingInquiry ? 'Sending to Shubham...' : 'Send Message'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#050505] border-t border-[#262626] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question"
                aria-label="Ask a question"
                className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#121212] border border-[#262626] text-[13px] text-[#F2F2F2] placeholder-[#7A7A7A] focus:outline-none focus:border-[#3D3D3D] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-10 h-10 rounded-[12px] bg-[#F2F2F2] text-[#050505] flex items-center justify-center transition-all disabled:bg-[#121212] disabled:text-[#4A4A4A] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
