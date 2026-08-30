/**
 * RAG Generation Service for Shubham's Portfolio
 * Synthesizes retrieved context into an articulate, grounded response.
 * Uses Gemini 2.5 Flash-Lite when GEMINI_API_KEY is present.
 */

import { RAGChunk } from '@/lib/postgres';
import { KnowledgeEntry } from '@/lib/chat/knowledgeMatcher';

interface GenerateOptions {
  query: string;
  contextChunks: { chunk: RAGChunk; score: number }[];
}

interface KnowledgeGenerationOptions {
  query: string;
  entries: KnowledgeEntry[];
}

type GenerationResult = {
  answer: string;
  sources: string[];
  provider: 'gemini-2.5-flash-lite' | 'generation-unavailable';
};

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_TIMEOUT_MS = 8_000;
const GEMINI_MAX_ATTEMPTS = 2;
const GENERATION_UNAVAILABLE_MESSAGE = `I'm temporarily unable to generate a portfolio answer right now. Please try again in a moment or contact Shubham directly at shubhammisra800@gmail.com.`;

function getGeminiText(data: any): string | null {
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

async function generateWithGemini(apiKey: string, prompt: string): Promise<string | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
  };

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      });
      if (response.ok) {
        const answer = getGeminiText(await response.json());
        if (answer) return answer;
        console.warn('Gemini generation returned no text.');
        return null;
      }

      const retryable = response.status === 429 || response.status >= 500;
      console.warn(`Gemini generation failed with HTTP ${response.status} (attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}).`);
      if (!retryable || attempt === GEMINI_MAX_ATTEMPTS) return null;
    } catch (err) {
      console.warn(`Gemini generation request failed (attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}).`, err);
      if (attempt === GEMINI_MAX_ATTEMPTS) return null;
    }
  }

  return null;
}

/** Generates a visitor-facing answer from ranked admin-managed knowledge entries. */
export async function generateKnowledgeEntryResponse({ query, entries }: KnowledgeGenerationOptions): Promise<GenerationResult> {
  const sources = entries.map((entry) => entry.question);
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && entries.length > 0) {
    const knowledgeEntries = entries.map((entry, index) =>
      `[Knowledge Entry ${index + 1}]\nTopic: ${entry.question}\nCategory: ${entry.category || 'General'}\nAnswer: ${entry.answer}`
    ).join('\n\n');
    const prompt = `You are Shubham Kumar's Portfolio Assistant, answering visitor questions
on his behalf. You must speak in first person as Shubham ("I built...",
"I specialize in...") except when describing a client's business (like
APK Elite Services) — there, be clear you're describing work you did
for a client, not describing yourself.

You will be given:
1. The user's question
2. One or more "Knowledge Entries" retrieved from Shubham's trained
   knowledge base — these are your ONLY source of truth

RULES:
- Generate a NEW, natural-sounding answer in your own words. Do NOT
  copy the knowledge entry text verbatim, and do NOT include internal
  labels like "Full Version:" — those are for the admin console only,
  never shown to users.
- Only state facts that are present in the provided knowledge entries.
  Never invent, guess, or extrapolate details not given to you.
- If none of the provided knowledge entries actually answer the
  question, say so honestly and suggest the user contact Shubham
  directly at shubhammisra800@gmail.com — do not force an answer from
  irrelevant context.
- If multiple knowledge entries are provided, synthesize them into one
  coherent answer rather than listing them separately.
- Keep answers concise (2-4 sentences) unless the question clearly
  asks for detail.
- Match tone to context: professional and confident for skills/hiring
  questions, warm and direct for contact questions.
- Never repeat the user's question back to them before answering.

KNOWLEDGE ENTRIES:
${knowledgeEntries}

USER QUESTION:
${query}

Generate Shubham's answer now.`;

    const answer = await generateWithGemini(apiKey, prompt);
    if (answer) return { answer, sources, provider: 'gemini-2.5-flash-lite' };
  }

  return { answer: GENERATION_UNAVAILABLE_MESSAGE, sources, provider: 'generation-unavailable' };
}

export async function generateRAGResponse({
  query,
  contextChunks,
}: GenerateOptions): Promise<GenerationResult> {
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

      const text = await generateWithGemini(apiKey, `${systemInstruction}\n\n${userPrompt}`);
      if (text) return { answer: text, sources, provider: 'gemini-2.5-flash-lite' };
    } catch (err) {
      console.warn('Gemini RAG generation exception.', err);
    }
  }

  return {
    answer: GENERATION_UNAVAILABLE_MESSAGE,
    sources,
    provider: 'generation-unavailable',
  };
}
