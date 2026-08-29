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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resumeUrl = content?.hero?.resumeUrl || '/Skills/Shubham_Kumar_Resume.pdf';

  // Initial welcome message
  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Hello! 👋 I'm **Shubham's AI Portfolio Assistant**.\n\nI can answer questions about Shubham's full-stack skills, showcase his best projects, provide his official resume, or help you get in touch. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '⚡ Top Tech Stack', action: 'skills' },
        { label: '🚀 Featured Projects', action: 'projects' },
        { label: '📄 Download Resume', action: 'resume' },
        { label: '🎓 Education & Degree', action: 'education' },
        { label: '📬 Hire / Contact', action: 'contact' },
      ],
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Answer matching logic grounded in real portfolio content
  const generateResponse = (rawInput: string): ChatMessage => {
    const q = rawInput.toLowerCase().trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Resume / CV query
    if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
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

    // 2. Skills / Technologies query
    if (
      q.includes('skill') ||
      q.includes('tech') ||
      q.includes('stack') ||
      q.includes('java') ||
      q.includes('spring') ||
      q.includes('angular') ||
      q.includes('react') ||
      q.includes('postgres') ||
      q.includes('docker') ||
      q.includes('cloud') ||
      q.includes('language')
    ) {
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

    // 3. Projects query
    if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('ecommerce') || q.includes('build')) {
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

    // 4. Education / Background
    if (q.includes('education') || q.includes('degree') || q.includes('college') || q.includes('university') || q.includes('study') || q.includes('msc') || q.includes('bsc')) {
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

    // 5. Contact / Hire / Message
    if (
      q.includes('contact') ||
      q.includes('hire') ||
      q.includes('email') ||
      q.includes('phone') ||
      q.includes('message') ||
      q.includes('reach') ||
      q.includes('interview')
    ) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 📬 Connect with Shubham\n\n• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)\n• **Phone**: [+91 9322887529](tel:+919322887529)\n• **Location**: Pune, Maharashtra, India\n• **Availability**: Open for Full-Time & Freelance opportunities\n\nYou can also **send a direct message** right here in this chat!`,
        timestamp: time,
        quickActions: [
          { label: '💬 Send Message Now', action: 'leave_message' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '🚀 View Projects', action: 'projects' },
        ],
      };
    }

    // 6. Experience query
    if (q.includes('experience') || q.includes('career') || q.includes('history')) {
      const expCount = content?.hero?.yearsExperience || '2+';
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### 💼 Professional Experience\n\nShubham has **${expCount} years** of hands-on software development experience specializing in enterprise full-stack development, distributed backend architecture in Java & Spring Boot, and responsive frontend applications in Angular & React.\n\nHe has worked on cloud deployment, optimized SQL databases, and secure RESTful microservices.`,
        timestamp: time,
        quickActions: [
          { label: '🚀 View Projects', action: 'projects' },
          { label: '📄 Download Resume', action: 'resume' },
          { label: '📬 Contact Info', action: 'contact' },
        ],
      };
    }

    // Default fallback response
    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: `Thanks for asking! Shubham is a Full Stack Developer specializing in **Java, Spring Boot, Angular, React, Next.js, and PostgreSQL**.\n\nYou can click any of the options below or ask me about specific skills, projects, or credentials:`,
      timestamp: time,
      quickActions: [
        { label: '⚡ Tech Stack', action: 'skills' },
        { label: '🚀 Projects', action: 'projects' },
        { label: '📄 Download Resume', action: 'resume' },
        { label: '📬 Contact & Hire', action: 'contact' },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
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

    // Simulate natural thinking delay
    setTimeout(() => {
      const botResponse = generateResponse(query);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
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
        <AnimatePresence>
          {!isOpen && !hasInteracted && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-cyan-500/30 text-white text-xs font-medium shadow-xl backdrop-blur-md cursor-pointer hover:border-cyan-400 transition-colors"
              onClick={() => {
                setIsOpen(true);
                setHasInteracted(true);
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Ask Shubham&apos;s AI</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setHasInteracted(true);
          }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-zinc-900 border border-zinc-700 text-white rotate-90'
              : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 ring-4 ring-cyan-500/20'
          }`}
          aria-label={isOpen ? 'Close Chatbot Assistant' : 'Open Chatbot Assistant'}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white" />
              {/* Pulsing online badge */}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-black rounded-full">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[82vh] rounded-2xl bg-zinc-950/95 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-white"
          >
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cyan-500/40 bg-zinc-800 shrink-0 shadow-inner">
                  <Image
                    src="/Skills/shubham3-rm.png"
                    alt="Shubham Kumar"
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                    unoptimized
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full"></span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Shubham&apos;s AI Assistant</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                      v1.0
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Online • Instant Portfolio Answers</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize chat"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs selection:bg-cyan-500 selection:text-black">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                        : 'bg-zinc-900 border border-zinc-800/90 text-zinc-200 rounded-bl-none'
                    }`}
                  >
                    {/* Render message text with basic bold support */}
                    <div>
                      {msg.text.split('\n').map((line, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>

                    {/* Download Resume Button right inside message */}
                    {msg.downloadLink && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-800">
                        <a
                          href={msg.downloadLink.url}
                          download={msg.downloadLink.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow"
                        >
                          <FileText className="w-4 h-4 text-red-500" />
                          <span>Download Official PDF Resume</span>
                        </a>
                      </div>
                    )}

                    {/* External links in message */}
                    {msg.links && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                        {msg.links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target={link.url.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 underline"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-zinc-500 mt-1 px-1">{msg.timestamp}</span>

                  {/* Quick Action Chips */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                      {msg.quickActions.map((qa, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleQuickAction(qa.action)}
                          className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors active:scale-95"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 w-16 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
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
              className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about skills, projects, resume..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-cyan-500"
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
