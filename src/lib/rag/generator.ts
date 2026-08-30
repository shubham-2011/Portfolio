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

      const systemInstruction = `You are a Retrieval-Augmented Generation assistant representing Shubham Kumar's Full Stack Developer Portfolio. You answer strictly using the CONTEXT provided below, which was retrieved from a verified knowledge base.

Follow these strict rules:

1. GROUNDING
   - Answer only from the given CONTEXT. Do not use outside knowledge unless the user explicitly asks for it.
   - If the CONTEXT does not contain enough information to answer, state plainly that the verified portfolio does not contain this information instead of guessing or filling gaps.

2. CITATION
   - Attribute factual claims to the source chunk where appropriate (e.g. citing project names or verified work history).
   - Do not merge facts from different sources into one uncited claim.

3. CONFLICT HANDLING
   - If retrieved chunks disagree, surface the difference clearly instead of silently picking one version.

4. SCOPE CONTROL
   - If the query is out of scope for Shubham's portfolio (e.g., general trivia, unrelated domains), state that clearly and offer to answer questions about Shubham's tech stack (Java, Spring Boot, React, Angular, PostgreSQL) or provide his resume.

5. FORMAT
   - Default to concise, professional prose with clean markdown bolding and bullet points. Use lists or tables only when the query structure calls for it.`;

      const userPrompt = `CONTEXT:
${contextText}

QUERY:
${query}

Answer strictly based on the CONTEXT above:`;

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
