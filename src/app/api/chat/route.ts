import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ChatbotKnowledge from '@/models/ChatbotKnowledge';
import ChatLog from '@/models/ChatLog';
import { findTopKnowledgeMatches, isDirectContactIntent } from '@/lib/chat/knowledgeMatcher';
import { generateKnowledgeEntryResponse } from '@/lib/rag/generator';
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
    if (false && (isDirectContactIntent(q) || isDirectContactIntent(normalizedQ))) {
      matchedCategory = 'Contact';
      matchedAnswer = `You can contact Shubham Kumar directly:\n\n• **Phone / WhatsApp**: [+91 9322887529](tel:+919322887529)\n• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)\n• **Location**: Pune, Maharashtra, India\n• **LinkedIn**: [linkedin.com/in/shubham-kumar-48b57023b](https://www.linkedin.com/in/shubham-kumar-48b57023b/)\n• **Availability**: Immediately Available (0 Days Notice for Full-Time & Freelance)`;
    }

    // Direct High-Priority Intent: Full Work Experience (All 3 Companies)
    if (false && !matchedAnswer && (
        /\b(experience|experiance|work|worked|working|company|companies|history|career|roles?)\b/i.test(q) ||
        /\b(experience|work|company)\b/i.test(normalizedQ))) {
      matchedCategory = 'Experience';
      matchedAnswer = `Shubham Kumar has extensive full-stack engineering experience across the following companies and roles:\n\n1. **APK Elite Services** — Freelance Full Stack Software Developer (2024 - Present)\n   • Engineered scalable Spring Boot microservices, high-speed PostgreSQL databases, and modern Angular and React frontends.\n   • Handled end-to-end SDLC, REST API security, and client production deployments.\n\n2. **Tipco Engineering** — Website Developer (Jul 2026 - Aug 2026)\n   • Engineered scalable microservices and intuitive user interfaces.\n   • Collaborated actively with cross-functional agile teams and optimized production database performance.\n\n3. **SetTribe** — Full Stack Developer Intern (Feb 2024 - Nov 2024)\n   • Contributed to customer-facing web applications and engineered reusable UI components.\n   • Developed and consumed RESTful APIs and collaborated in agile sprint cycles.`;
    }

    // 1. Fetch trained knowledge items from MongoDB or PostgreSQL
    let knowledgeList: any[] = [];
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        knowledgeList = await ChatbotKnowledge.find().lean();
      } catch (err) {
        console.warn('MongoDB knowledge fetch notice:', err);
      }
    }

    if (knowledgeList.length === 0) {
      try {
        knowledgeList = await getChatbotKnowledgeFromPostgres();
      } catch (err) {
        console.error('PostgreSQL knowledge fetch error:', err);
      }
    }

    // 2. Rarity-weighted, typo-tolerant knowledge matching.
    // Contact intents above are intentionally narrow; “hire” belongs to recruiter knowledge.
    let ragSources: string[] = [];
    const knowledgeMatches = findTopKnowledgeMatches(q, knowledgeList, 3);
    if (knowledgeMatches.length > 0) {
      const result = await generateKnowledgeEntryResponse({
        query: userMessage,
        entries: knowledgeMatches.map((match) => match.entry),
      });
      matchedAnswer = result.answer || null;
      matchedCategory = knowledgeMatches[0].entry.category || 'General';
      ragSources = result.sources;
    }

    // 3. Fall back to vector RAG only when no trained entry is relevant.
    if (!matchedAnswer && q.length >= 4) {
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

    // 4. Dynamic conversational response for greetings / open queries via Gemini
    if (!matchedAnswer && process.env.GEMINI_API_KEY) {
      try {
        const { generateConversationalResponse } = await import('@/lib/rag/generator');
        const convResult = await generateConversationalResponse(userMessage);
        if (convResult.answer) {
          matchedAnswer = convResult.answer;
          matchedCategory = 'Conversational';
          ragSources = convResult.sources;
        }
      } catch (convErr) {
        console.warn('Conversational AI generation notice:', convErr);
      }
    }

    // 5. Ultimate fallback if query has no matching answer in knowledge base
    if (!matchedAnswer) {
      matchedAnswer = `I don't have that specific information in Shubham's verified portfolio records.\n\nYou can reach Shubham directly:\n• **Phone / WhatsApp**: [+91 9322887529](tel:+919322887529)\n• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)\n\nYou can also leave a message using the in-chat contact form or the website contact section!`;
      matchedCategory = 'Contact';
      ragSources = ['Direct Contact Channels'];
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
