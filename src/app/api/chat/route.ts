import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ChatbotKnowledge from '@/models/ChatbotKnowledge';
import ChatLog from '@/models/ChatLog';
import {
  getChatbotKnowledgeFromPostgres,
  saveChatToPostgres,
} from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, botResponse, intent } = body;

    const userMessage = (message || '').trim();
    if (!userMessage) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const q = userMessage.toLowerCase();
    let matchedAnswer: string | null = null;
    let matchedCategory: string | null = null;

    // Smart typo and abbreviation normalization
    const normalizedQ = q
      .replace(/\b(gime|gimme|give|gib|share|send|provide|tell|show)\b/g, ' ')
      .replace(/\b(shubhaam|subham|shubh|shubam|shubhamb)\b/g, 'shubham')
      .replace(/\b(contect|cntact|kontact)\b/g, 'contact')
      .replace(/\b(experiance|experiense|experince)\b/g, 'experience')
      .replace(/\b(fone|tele|telephone)\b/g, 'phone')
      .replace(/\b(watsapp|whatsap)\b/g, 'whatsapp')
      .replace(/\b(numb|numbr)\b/g, 'number')
      .replace(/\b(mob|mobil)\b/g, 'mobile')
      .trim();

    // Direct High-Priority Intent: Contact & Phone Number
    if (/\b(contact|contect|cntact|phone|number|mobile|call|whatsapp|watsapp|email|reach|hire)\b/i.test(q) ||
        /\b(contact|phone|number|mobile|email)\b/i.test(normalizedQ)) {
      matchedCategory = 'Contact';
      matchedAnswer = `You can contact Shubham Kumar directly:\n\n• **Phone / WhatsApp**: [+91 9322887529](tel:+919322887529)\n• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)\n• **Location**: Pune, Maharashtra, India\n• **LinkedIn**: [linkedin.com/in/shubham-kumar-48b57023b](https://www.linkedin.com/in/shubham-kumar-48b57023b/)\n• **Availability**: Immediately Available (0 Days Notice for Full-Time & Freelance)`;
    }

    // Direct High-Priority Intent: Full Work Experience (All 3 Companies)
    if (!matchedAnswer && (
        /\b(experience|experiance|work|worked|working|company|companies|history|career|roles?)\b/i.test(q) ||
        /\b(experience|work|company)\b/i.test(normalizedQ))) {
      matchedCategory = 'Experience';
      matchedAnswer = `Shubham Kumar has extensive full-stack engineering experience across the following companies and roles:\n\n1. **APK Elite Services** — Freelance Full Stack Software Developer (2024 - Present)\n   • Engineered scalable Spring Boot microservices, high-speed PostgreSQL databases, and modern Angular and React frontends.\n   • Handled end-to-end SDLC, REST API security, and client production deployments.\n\n2. **Tipco Engineering** — Website Developer (Jul 2026 - Aug 2026)\n   • Engineered scalable microservices and intuitive user interfaces.\n   • Collaborated actively with cross-functional agile teams and optimized production database performance.\n\n3. **SetTribe** — Full Stack Developer Intern (Feb 2024 - Nov 2024)\n   • Contributed to customer-facing web applications and engineered reusable UI components.\n   • Developed and consumed RESTful APIs and collaborated in agile sprint cycles.`;
    }

    // 1. Fetch trained knowledge items from MongoDB or PostgreSQL
    let knowledgeList: any[] = [];
    if (!matchedAnswer && process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        knowledgeList = await ChatbotKnowledge.find().lean();
      } catch (err) {
        console.warn('MongoDB knowledge fetch notice:', err);
      }
    }

    if (!matchedAnswer && knowledgeList.length === 0) {
      try {
        knowledgeList = await getChatbotKnowledgeFromPostgres();
      } catch (err) {
        console.error('PostgreSQL knowledge fetch error:', err);
      }
    }

    // 2. High-precision knowledge matching (prevents hallucinating on random questions or greetings)
    // Common stop words that must never trigger a knowledge match
    const stopWords = new Set(['hi', 'hii', 'hello', 'hey', 'is', 'a', 'the', 'what', 'who', 'how', 'where', 'when', 'why', 'can', 'you', 'do', 'i', 'me', 'my', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'it', 'this', 'that']);

    // Clean user query tokens
    const queryTokens = `${q} ${normalizedQ}`
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t: string) => t.length >= 2 && !stopWords.has(t));

    let bestScore = 0;

    for (const item of knowledgeList) {
      const qText = (item.question || '').toLowerCase().trim();
      const rawKeywords = (item.keywords || []).map((k: string) => k.toLowerCase().trim());

      // A. Exact question match (highest confidence)
      const cleanQText = qText.replace(/[^\w\s]/g, '').trim();
      const cleanQuery = q.replace(/[^\w\s]/g, '').trim();

      if (cleanQuery.length >= 5 && (cleanQuery === cleanQText || cleanQuery.includes(cleanQText))) {
        matchedAnswer = item.answer;
        matchedCategory = item.category;
        bestScore = 100;
        break;
      }

      // B. Whole-word keyword matching with threshold scoring
      let score = 0;
      for (const kw of rawKeywords) {
        if (!kw || kw.length < 3 || stopWords.has(kw)) continue;

        // Use strict word boundary so 'hi' doesn't match 'this' or 'white'
        const kwRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (kwRegex.test(q)) {
          score += kw.length >= 5 ? 3 : 1.5;
        }
      }

      // Check if question tokens overlap significantly with user tokens
      if (queryTokens.length > 0) {
        const qTextTokens = qText.replace(/[^\w\s]/g, ' ').split(/\s+/).filter((t: string) => t.length >= 3 && !stopWords.has(t));
        for (const qt of queryTokens) {
          if (qTextTokens.includes(qt)) {
            score += 2;
          }
        }
      }

      // Only accept matches that meet confidence threshold (at least 2.5 points)
      if (score >= 2.5 && score > bestScore) {
        bestScore = score;
        matchedAnswer = item.answer;
        matchedCategory = item.category;
      }
    }

    // 3. If no direct rule matched, run Vector RAG Retrieval & Synthesis!
    let ragSources: string[] = [];
    if (!matchedAnswer && q.length >= 5) {
      try {
        const { retrieveRelevantChunks } = await import('@/lib/rag/indexer');
        const { generateRAGResponse } = await import('@/lib/rag/generator');

        let relevantChunks = await retrieveRelevantChunks(q, 4);
        if ((!relevantChunks || relevantChunks.length === 0 || relevantChunks[0].score < 0.18) && normalizedQ !== q) {
          relevantChunks = await retrieveRelevantChunks(normalizedQ, 4);
        }

        if (relevantChunks.length > 0 && relevantChunks[0].score >= 0.18) {
          const ragResult = await generateRAGResponse({
            query: userMessage,
            contextChunks: relevantChunks,
          });
          if (ragResult.answer) {
            matchedAnswer = ragResult.answer;
            matchedCategory = 'RAG Knowledge';
            ragSources = ragResult.sources;
          }
        }
      } catch (ragErr) {
        console.warn('RAG retrieval fallback notice:', ragErr);
      }
    }

    // 4. Persist the chat interaction (dual write to MongoDB and PostgreSQL)
    const finalResponse = matchedAnswer || botResponse || '';
    const finalIntent = matchedCategory || intent || 'general';
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        await ChatLog.create({
          sessionId: sessionId || 'anon-session',
          userMessage,
          botResponse: finalResponse,
          intent: finalIntent,
          ipAddress: clientIp,
          userAgent,
        });
      } catch (mongoErr) {
        console.warn('MongoDB chat log save notice:', mongoErr);
      }
    }

    try {
      await saveChatToPostgres({
        sessionId: sessionId || 'anon-session',
        userMessage,
        botResponse: finalResponse,
        intent: finalIntent,
        ipAddress: clientIp,
        userAgent,
      });
    } catch (pgErr) {
      console.warn('PostgreSQL chat log save notice:', pgErr);
    }

    return NextResponse.json(
      {
        success: true,
        hasCustomAnswer: Boolean(matchedAnswer),
        answer: matchedAnswer,
        category: matchedCategory,
        sources: ragSources,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
