/**
 * RAG Knowledge Ingestion & Indexing Service for Shubham's Portfolio
 * Extracts knowledge from CMS portfolio content and custom Q&A items,
 * chunks them logically, generates embeddings, and saves to PostgreSQL.
 */

import { generateEmbedding } from './embeddings';
import {
  saveEmbeddingChunksToPostgres,
  getAllEmbeddingChunksFromPostgres,
  getChatbotKnowledgeFromPostgres,
  getPortfolioContent,
  RAGChunk,
} from '@/lib/postgres';
import {
  saveChunksToLocalStore,
  getAllChunksFromLocalStore,
  searchLocalVectorStore,
} from './localVectorStore';
import defaultContent from '@/data/portfolioContent.json';
import customQaDataset from '../../../data/chatbot_qa_dataset.json';

interface RawDocument {
  chunkId: string;
  title: string;
  category: string;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Collects all source documents from portfolio JSON and database
 */
export async function collectSourceDocuments(): Promise<RawDocument[]> {
  const docs: RawDocument[] = [];

  // =========================================================================
  // 1. EMBED FULL WEBSITE CONTENT (HERO, ABOUT, SKILLS, PROJECTS, CONTACT)
  // =========================================================================
  let content = defaultContent;
  try {
    const pgContent = await getPortfolioContent();
    if (pgContent) {
      content = pgContent;
    }
  } catch (_) {}

  // A. Hero Section & Core Introduction
  const hero = (content.hero || {}) as any;
  docs.push({
    chunkId: 'website-hero',
    title: 'Website Hero Section: Shubham Kumar Overview',
    category: 'Hero & Bio',
    content: `Name: Shubham Kumar. Title: ${hero.title || 'Full Stack Software Developer'}. Subtitle: ${hero.subtitle || 'Computer Engineer specializing in full-stack architecture'}. Summary: ${hero.description || 'I design and build high-performance, scalable applications using Java, Spring Boot, PostgreSQL, Angular, React & Cloud.'} Years of Experience: ${hero.yearsExperience || '2+'} years. Core Technologies: 10+ core frameworks. Client focus: 100%. Resume URL: ${hero.resumeUrl || '/Shubham_Kumar_Resume.pdf'}. Status: Actively Available for Full-Time & Freelance opportunities worldwide.`,
    metadata: { section: 'hero', source: 'website' },
  });

  // B. About Section & Philosophy
  if (content.about) {
    const about = content.about as any;
    docs.push({
      chunkId: 'website-about',
      title: 'Website About Section: Developer Bio & Engineering Philosophy',
      category: 'About',
      content: `About Shubham: ${about.bio || ''} Philosophy: ${about.philosophy || 'Designing resilient backend systems with clean architecture, decoupled microservices, and crafting delightful, 60fps responsive user experiences.'} Location: Pune, Maharashtra, India. Shubham specializes in bridging scalable backend services with modern responsive frontends.`,
      metadata: { section: 'about', source: 'website' },
    });
  }

  // C. Technical Skills by Category (Comprehensive Individual Tech Breakdown)
  if (Array.isArray(content.skills)) {
    content.skills.forEach((cat: any, idx: number) => {
      const skillNames = (cat.skills || []).map((s: any) => s.name).join(', ');
      docs.push({
        chunkId: `website-skills-${idx}-${(cat.category || '').toLowerCase().replace(/\s+/g, '-')}`,
        title: `Website Skills: ${cat.category} Technologies`,
        category: 'Skills',
        content: `Skill Category: ${cat.category}. Category Description: ${cat.description || ''}. Specific Technologies & Libraries: ${skillNames}. Shubham uses these technologies to architect enterprise RESTful services, responsive reactive user interfaces, and reliable database layers.`,
        metadata: { section: 'skills', category: cat.category, skills: skillNames, source: 'website' },
      });
    });
  }

  // D. Individual Engineering Projects (Deep Architectural Breakdown)
  if (Array.isArray(content.projects)) {
    content.projects.forEach((proj: any, idx: number) => {
      const techStack = Array.isArray(proj.tech) ? proj.tech.join(', ') : '';
      const features = Array.isArray(proj.features) ? proj.features.join('. ') : '';
      docs.push({
        chunkId: `website-project-${proj.id || idx}`,
        title: `Website Project: ${proj.title}`,
        category: 'Projects',
        content: `Project Title: ${proj.title}. Project Overview: ${proj.description}. Technology Stack: ${techStack}. Core Architecture & Features: ${features}. Live Demo URL: ${proj.links?.live || 'Available upon request'}. Frontend Repository: ${proj.links?.frontend || 'https://github.com/shubham-2011'}. Backend Repository: ${proj.links?.backend || 'https://github.com/shubham-2011'}.`,
        metadata: { section: 'projects', title: proj.title, tech: techStack, source: 'website' },
      });
    });
  }

  // E. Education Credentials & Academic Path
  if (Array.isArray(content.education)) {
    content.education.forEach((edu: any, idx: number) => {
      const degreeTitle = edu.title || edu.degree || 'Computer Science Degree';
      const institution = edu.university || edu.institution || edu.place || 'Pune, Maharashtra';
      const duration = edu.year || edu.period || '';
      const extra = edu.extra ? `Score / Distinction: ${edu.extra}. ` : '';
      docs.push({
        chunkId: `website-education-${idx}`,
        title: `Website Education: ${degreeTitle} at ${institution}`,
        category: 'Education',
        content: `Academic Qualification: ${degreeTitle}. Institution: ${institution}. Duration: ${duration}. ${extra}Overview: ${edu.description || ''}. Key Coursework & Focus: Data Structures & Algorithms, Object-Oriented Programming (Java/C++), Database Management Systems (RDBMS & SQL), Distributed Systems, and Advanced Web Engineering.`,
        metadata: { section: 'education', degree: degreeTitle, institution, duration, source: 'website' },
      });
    });
  }

  // F. Professional Work Experience & Companies
  if (Array.isArray(content.experience)) {
    content.experience.forEach((exp: any, idx: number) => {
      docs.push({
        chunkId: `website-experience-${idx}-${(exp.company || '').toLowerCase().replace(/\s+/g, '-')}`,
        title: `Professional Experience: ${exp.role} at ${exp.company}`,
        category: 'Experience',
        content: `Company: ${exp.company}. Role: ${exp.role}. Duration / Timeline: ${exp.year || ''}. Key Responsibilities & Achievements: ${exp.description || ''}. Architected production services, created modular components, and integrated scalable APIs with robust data pipelines.`,
        metadata: { section: 'experience', company: exp.company, role: exp.role, year: exp.year, source: 'website' },
      });
    });
  }

  // G. Contact Information & Online Profiles
  docs.push({
    chunkId: 'website-contact-info',
    title: 'Website Contact & Hiring Channels',
    category: 'Contact',
    content: `Email: shubhammisra800@gmail.com. Phone / WhatsApp: +91 9322887529. Current Location: Pune, Maharashtra, India. GitHub: https://github.com/shubham-2011. LinkedIn: https://www.linkedin.com/in/shubham-kumar-48b57023b/. Hiring Status: Immediately available for Full-Time Software Engineer positions, contract roles, and global remote opportunities with 0 days notice period. Open to relocation to Bengaluru, Hyderabad, Mumbai, Delhi-NCR.`,
    metadata: { section: 'contact', email: 'shubhammisra800@gmail.com', phone: '+91 9322887529', source: 'website' },
  });

  // H. Work Experience & Freelance Systems (APK Elite Services)
  docs.push({
    chunkId: 'db-experience-apk-elite',
    title: 'Work Experience: Full Stack Engineer at APK Elite Services',
    category: 'Experience',
    content: `Company: APK Elite Services (Freelance). Role: Full Stack Software Developer. Duration: 2024 - Present. Responsibilities: Engineered scalable Spring Boot microservices, designed high-throughput PostgreSQL schemas with custom indexing, and deployed dynamic, accessible user interfaces in Angular and React. Delivered client-facing production applications with fast API response times.`,
    metadata: { company: 'APK Elite Services', role: 'Full Stack Software Developer', source: 'website' },
  });

  // I. Ingest Master Q&A Dataset (Curated Intent-Grounded Pairs)
  if (Array.isArray(customQaDataset)) {
    customQaDataset.forEach((qa: any, idx: number) => {
      docs.push({
        chunkId: `curated-qa-${idx}-${(qa.intent || 'general').toLowerCase()}`,
        title: `Verified Q&A: ${qa.instruction}`,
        category: qa.intent || 'General',
        content: `Question: ${qa.instruction}. Verified Response: ${qa.response}. Intent: ${qa.intent || ''}.`,
        metadata: { instruction: qa.instruction, intent: qa.intent, source: 'curated_dataset' },
      });
    });
  }

  // B. Ingest All Dynamic Custom Q&A Items from PostgreSQL Table
  try {
    const customQAs = await getChatbotKnowledgeFromPostgres();
    if (Array.isArray(customQAs)) {
      customQAs.forEach((item: any) => {
        const keywords = Array.isArray(item.keywords) ? item.keywords.join(', ') : '';
        docs.push({
          chunkId: `db-knowledge-${item.id}`,
          title: `Database Q&A: ${item.question}`,
          category: item.category || 'General',
          content: `Question: ${item.question}. Verified Answer: ${item.answer}. Keywords & Search Variations: ${keywords}.`,
          metadata: { question: item.question, category: item.category, source: 'database' },
        });
      });
    }
  } catch (err) {
    console.warn('Notice loading PostgreSQL Q&A for RAG indexer:', err);
  }

  // C. Ingest MongoDB ChatbotKnowledge if Configured
  if (process.env.MONGODB_URI) {
    try {
      const { connectToDatabase } = await import('@/lib/mongodb');
      const ChatbotKnowledge = (await import('@/models/ChatbotKnowledge')).default;
      await connectToDatabase();
      const mongoDocs = await ChatbotKnowledge.find().lean();
      if (Array.isArray(mongoDocs)) {
        mongoDocs.forEach((item: any) => {
          const keywords = Array.isArray(item.keywords) ? item.keywords.join(', ') : '';
          docs.push({
            chunkId: `mongodb-knowledge-${item._id}`,
            title: `MongoDB Knowledge: ${item.question}`,
            category: item.category || 'General',
            content: `Question: ${item.question}. Verified Answer: ${item.answer}. Keywords: ${keywords}.`,
            metadata: { question: item.question, category: item.category, source: 'mongodb' },
          });
        });
      }
    } catch (err) {
      console.warn('Notice loading MongoDB knowledge for RAG indexer:', err);
    }
  }

  return docs;
}

/**
 * Re-indexes all portfolio knowledge chunks into PostgreSQL
 */
export async function reindexPortfolioKnowledge(): Promise<{
  success: boolean;
  indexedCount: number;
  model: string;
  error?: string;
}> {
  try {
    const docs = await collectSourceDocuments();
    const chunks: RAGChunk[] = [];
    let usedModel = 'local-semantic-projection';

    for (const doc of docs) {
      const embedResult = await generateEmbedding(`${doc.title}\n\n${doc.content}`);
      usedModel = embedResult.model;
      chunks.push({
        chunkId: doc.chunkId,
        chunk_id: doc.chunkId,
        title: doc.title,
        category: doc.category,
        content: doc.content,
        embedding: embedResult.embedding,
        metadata: doc.metadata,
      });
    }

    // 1. Always save to Self-Hosted Local Vector Store (zero cloud dependency)
    const localResult = saveChunksToLocalStore(chunks);

    // 2. Also sync to PostgreSQL if connected
    let savedCount = localResult.total;
    try {
      savedCount = await saveEmbeddingChunksToPostgres(chunks);
    } catch (pgErr) {
      console.warn('Postgres sync skipped, using self-hosted local vector store:', pgErr);
    }

    return {
      success: true,
      indexedCount: savedCount || localResult.total,
      model: usedModel,
    };
  } catch (error: any) {
    console.error('Error during portfolio knowledge reindexing:', error);
    return {
      success: false,
      indexedCount: 0,
      model: 'unknown',
      error: error.message,
    };
  }
}

/**
 * Retrieves the top K most relevant knowledge chunks for a query
 */
export async function retrieveRelevantChunks(
  query: string,
  topK = 4
): Promise<{ chunk: RAGChunk; score: number }[]> {
  try {
    // 1. Auto-build Vector Store dynamically at runtime if empty
    let localChunks = getAllChunksFromLocalStore();
    if (!localChunks || localChunks.length === 0) {
      console.log('⚡ Vector DB not found in runtime memory/disk. Auto-building dynamically at runtime now...');
      await reindexPortfolioKnowledge();
    }

    // 2. Embed query
    const { embedding: queryEmbedding } = await generateEmbedding(query);

    // 3. Query Self-Hosted Local Vector Store (sub-millisecond, zero cloud dependency)
    const localMatches = searchLocalVectorStore(queryEmbedding, topK, 0.18);
    if (localMatches && localMatches.length > 0) {
      return localMatches.map((m) => ({
        chunk: {
          chunkId: m.chunk.chunk_id || m.chunk.chunkId || '',
          chunk_id: m.chunk.chunk_id,
          id: m.chunk.id ? Number(m.chunk.id) : undefined,
          title: m.chunk.title,
          category: m.chunk.category,
          content: m.chunk.content,
          embedding: m.chunk.embedding,
          metadata: m.chunk.metadata,
        },
        score: m.similarity,
      }));
    }

    // 3. Fallback to PostgreSQL if local store has not been indexed yet
    let allChunks = await getAllEmbeddingChunksFromPostgres();
    if (allChunks.length === 0) {
      await reindexPortfolioKnowledge();
      allChunks = await getAllEmbeddingChunksFromPostgres();
    }

    if (allChunks.length === 0) {
      return [];
    }

    const { cosineSimilarity } = await import('./embeddings');
    const scored = allChunks.map((chunk) => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  } catch (err) {
    console.error('Error retrieving relevant chunks:', err);
    return [];
  }
}
