/**
 * RAG Generation Service for Shubham's Portfolio
 * Synthesizes retrieved context into an articulate, grounded response.
 * Uses Google Gemini 1.5 Flash when GEMINI_API_KEY is present,
 * with clean local synthesis fallback.
 */

import { RAGChunk } from '@/lib/postgres';

interface GenerateOptions {
  query: string;
  contextChunks: { chunk: RAGChunk; score: number }[];
}

export async function generateRAGResponse({
  query,
  contextChunks,
}: GenerateOptions): Promise<{
  answer: string;
  sources: string[];
  provider: 'gemini-1.5-flash' | 'local-rag-synthesis';
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Filter chunks with reasonable similarity
  const validChunks = contextChunks.filter((c) => c.score > 0.25);
  const sources = validChunks.map((c) => c.chunk.title);

  const contextText = validChunks
    .map((c, i) => `[Source ${i + 1}: ${c.chunk.title}]\n${c.chunk.content}`)
    .join('\n\n');

  // 1. Google Gemini 1.5 Flash Generation
  if (apiKey && validChunks.length > 0) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const systemInstruction = `You are Shubham Kumar's official AI Portfolio Assistant.
Your mission is to represent Shubham's software engineering background accurately, professionally, and enthusiastically to recruiters and engineering managers.

STRICT GUIDELINES:
1. Rely ONLY on the verified Context provided below. Never invent or hallucinate facts, dates, companies, or degrees.
2. If asked about his skills, experience, or projects, highlight his mastery of Java, Spring Boot, PostgreSQL, Angular, and React.
3. If the user asks something completely outside Shubham's portfolio (e.g. general trivia, politics, recipes), politely decline and offer to share Shubham's projects or resume.
4. Format responses cleanly with markdown bolding and bullet points. Keep responses concise (2 to 4 paragraphs maximum).`;

      const userPrompt = `Context Information:\n${contextText}\n\nVisitor Question: "${query}"\n\nPlease answer the question based on the verified context above:`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return {
            answer: text.trim(),
            sources,
            provider: 'gemini-1.5-flash',
          };
        }
      } else {
        console.warn('Gemini generateContent error, falling back to local synthesis:', await response.text());
      }
    } catch (err) {
      console.warn('Gemini generateContent network exception, falling back to local synthesis:', err);
    }
  }

  // 2. Intelligent Local Synthesis Fallback
  if (validChunks.length > 0 && validChunks[0].score >= 0.35) {
    const top = validChunks[0].chunk;
    return {
      answer: top.content,
      sources,
      provider: 'local-rag-synthesis',
    };
  }

  // Out of domain fallback
  return {
    answer: `I'm an AI assistant dedicated specifically to **Shubham Kumar's developer portfolio, technical skills, and engineering projects** (Java, Spring Boot, Angular, React, PostgreSQL).\n\nI don't have information on this specific topic in Shubham's verified portfolio, but feel free to ask about his backend architecture, featured applications, or how to contact him!`,
    sources: [],
    provider: 'local-rag-synthesis',
  };
}
