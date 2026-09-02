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
import { generateGeminiResponse, isGeminiAvailable } from '@/lib/gemini';

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
    let ragSources: string[] = [];

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

    // 0. Handle Greetings & Small Talk gracefully (with Gemini if available, or rich dynamic offline greeting)
    const cleanQ = q.replace(/[^\w\s]/g, '').trim();
    const isGreetingOrSmallTalk = /^(hi|hii|hiii|hello|helo|hey|heyy|howdy|sup|hola|namaste|yo|good\s*(morning|afternoon|evening)|how\s+are\s+you|how\s+r\s+u|whats?\s+up|who\s+are\s+you|who\s+r\s+u|thanks|thank\s+you|thx|bye|goodbye)$/i.test(cleanQ) ||
      /^(hi|hello|hey)\s+(shubham|there|assistant|bot|bro|sir|buddy)?$/i.test(cleanQ);

    if (isGreetingOrSmallTalk) {
      if (process.env.GEMINI_API_KEY) {
        try {
          const { generateConversationalResponse } = await import('@/lib/rag/generator');
          const convResult = await generateConversationalResponse(userMessage);
          if (convResult.answer) {
            matchedAnswer = convResult.answer;
            matchedCategory = 'Conversational';
            ragSources = convResult.sources;
          }
        } catch (e) {}
      }

      if (!matchedAnswer) {
        if (/^(how\s+are\s+you|how\s+r\s+u|whats?\s+up|hows\s+it\s+going)$/i.test(cleanQ)) {
          matchedAnswer = `I'm doing great, thank you for asking! 😊 I'm here to help you explore Shubham's software projects, technical skills in Java, Spring Boot, React, and Angular, or download his resume. What would you like to check out?`;
        } else if (/^(who\s+are\s+you|who\s+r\s+u|what\s+can\s+you\s+do)$/i.test(cleanQ)) {
          matchedAnswer = `I'm an interactive AI assistant for **Shubham Kumar's developer portfolio**! You can ask me about his work experience, engineering skills, projects, degrees, or how to contact him.`;
        } else if (/^(thanks|thank\s+you|thx)$/i.test(cleanQ)) {
          matchedAnswer = `You're very welcome! 😊 Feel free to ask anything else or connect directly with Shubham if you have an opportunity or project in mind.`;
        } else if (/^(bye|goodbye|cya)$/i.test(cleanQ)) {
          matchedAnswer = `Goodbye! Thanks for stopping by Shubham's portfolio. Have a wonderful day ahead! 👋✨`;
        } else {
          matchedAnswer = `Hello! 👋 Great to meet you! I'm **Shubham's AI Assistant**. Feel free to ask about his full-stack software projects, technical skills in Java, Spring Boot, and Angular, his resume, or how to get in touch. How can I help you today?`;
        }
        matchedCategory = 'Conversational';
        ragSources = ['Portfolio Assistant'];
      }
    }

    if (!matchedAnswer) {
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
    }

    // 3. Use Gemini API as primary fallback for all queries
    if (!matchedAnswer && isGeminiAvailable()) {
      try {
        const geminiResult = await generateGeminiResponse(userMessage);
        if (geminiResult.success && geminiResult.answer) {
          matchedAnswer = geminiResult.answer;
          matchedCategory = 'Gemini AI';
          ragSources = ['Gemini 1.5 Flash'];
        }
      } catch (geminiErr) {
        console.warn('Gemini API fallback notice:', geminiErr);
      }
    }

    // 4. Vector RAG fallback if Gemini is not available
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
