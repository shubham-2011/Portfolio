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
  provider: 'gemini-flash' | 'gemini-2.5-flash-lite' | 'generation-unavailable';
};

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
].filter(Boolean) as string[];

const GEMINI_TIMEOUT_MS = 10_000;
const GEMINI_MAX_ATTEMPTS = 2;
const GENERATION_UNAVAILABLE_MESSAGE = `I'm temporarily unable to generate a portfolio answer right now. Please try again in a moment or contact Shubham directly at shubhammisra800@gmail.com.`;

function getGeminiText(data: any): string | null {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const textParts = parts
      .filter((p: any) => typeof p?.text === 'string' && !p.thought)
      .map((p: any) => p.text.trim())
      .filter(Boolean);
    if (textParts.length > 0) return textParts.join('\n\n');
    if (typeof parts[0]?.text === 'string') return parts[0].text.trim();
  }
  const directText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof directText === 'string' && directText.trim() ? directText.trim() : null;
}

async function generateWithGemini(
  apiKey: string,
  prompt: string,
  config?: { temperature?: number; maxOutputTokens?: number }
): Promise<string | null> {
  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: config?.temperature ?? 0.25,
      maxOutputTokens: config?.maxOutputTokens ?? 1000,
    },
  };

  for (const modelName of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
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
          console.warn(`Gemini model ${modelName} returned no text.`);
          return null;
        }

        const isNotFound = response.status === 404;
        const retryable = response.status === 429 || response.status >= 500;
        console.warn(`Gemini (${modelName}) request failed with HTTP ${response.status} (attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}).`);

        if (isNotFound) {
          // Model name not available in current API tier/region, fall back to next model candidate
          break;
        }
        if (!retryable || attempt === GEMINI_MAX_ATTEMPTS) break;
      } catch (err) {
        console.warn(`Gemini (${modelName}) request exception (attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}):`, err);
        if (attempt === GEMINI_MAX_ATTEMPTS) break;
      }
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
    if (answer) return { answer, sources, provider: 'gemini-flash' };
  }

  // Fallback to older deterministic RAG model when Gemini token/quota ends
  if (entries.length > 0) {
    return {
      answer: entries[0].answer,
      sources,
      provider: 'generation-unavailable',
    };
  }

  return {
    answer: `I don't have that specific information in Shubham's portfolio records.\n\nYou can reach Shubham directly:\n• **Phone / WhatsApp**: [+91 9322887529](tel:+919322887529)\n• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)\n\nYou can also leave a message using the contact form on this website!`,
    sources,
    provider: 'generation-unavailable',
  };
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

  // 1. Google Gemini Flash Generation
  if (apiKey && validChunks.length > 0) {
    try {
      const systemInstruction = `You are a Retrieval-Augmented Generation assistant representing Shubham Kumar's Full Stack Developer Portfolio. You answer strictly using the CONTEXT provided below, which was retrieved from a verified knowledge base.

Follow these strict rules:

1. GROUNDING
   - Answer only from the given CONTEXT. Do not use outside knowledge unless the user explicitly asks for it.
   - If the CONTEXT does not contain enough information to answer, state plainly:
     "I don't have that specific information in Shubham's portfolio records. You can contact Shubham directly at +91 9322887529 or shubhammisra800@gmail.com, or leave a message in the contact form!" instead of guessing.

2. CITATION
   - Attribute factual claims to the source chunk where appropriate.

3. SCOPE CONTROL
   - If the query is out of scope or unknown, state that clearly and provide Shubham's direct contact details (+91 9322887529, shubhammisra800@gmail.com) and mention the contact form.

4. FORMAT
   - Default to concise, professional prose.`;

      const userPrompt = `CONTEXT:
${contextText}

QUERY:
${query}

Answer strictly based on the CONTEXT above:`;

      const text = await generateWithGemini(apiKey, `${systemInstruction}\n\n${userPrompt}`);
      if (text) return { answer: text, sources, provider: 'gemini-flash' };
    } catch (err) {
      console.warn('Gemini RAG generation exception.', err);
    }
  }

  // Fallback to older deterministic RAG model when Gemini token/quota ends
  if (validChunks.length > 0) {
    return {
      answer: validChunks[0].chunk.content,
      sources,
      provider: 'generation-unavailable',
    };
  }

  return {
    answer: `I don't have that specific information in Shubham's portfolio records.\n\nYou can reach Shubham directly:\n• **Phone / WhatsApp**: [+91 9322887529](tel:+919322887529)\n• **Email**: [shubhammisra800@gmail.com](mailto:shubhammisra800@gmail.com)\n\nYou can also leave a message using the contact form on this website!`,
    sources,
    provider: 'generation-unavailable',
  };
}

/** Generates dynamic, varied, natural conversational answers for greetings or general queries */
export async function generateConversationalResponse(query: string): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { answer: '', sources: [], provider: 'generation-unavailable' };
  }

  const prompt = `You are the AI Assistant for Shubham Kumar's developer portfolio.

Visitor's input: "${query}"

INSTRUCTIONS:
1. GREETINGS (hi, hello, hey, what's up, etc.):
   - Give a warm, natural, and charismatic 1-2 sentence response.
   - DO NOT recite a repetitive laundry list of skills or technologies.
   - Be varied, fresh, and friendly every time. Ask how you can help them explore Shubham's work, projects, or background.

2. QUESTIONS ABOUT SHUBHAM / CONTACT / HIRING:
   - Speak accurately and conversationally.
   - Shubham is an experienced Full Stack Software Engineer (Java, Spring Boot, React, Angular, PostgreSQL).
   - If they ask how to contact him:
     • Phone / WhatsApp: +91 9322887529
     • Email: shubhammisra800@gmail.com
     • Mention they can also leave a message using the contact form on this page.

3. UNKNOWN / OUT-OF-SCOPE QUESTIONS:
   - Politely say you specialize in Shubham's engineering portfolio, and provide his direct email (shubhammisra800@gmail.com) and phone (+91 9322887529) if they'd like to get in touch.

4. TONE:
   - Friendly, modern, confident, and professional. Never robotic or formulaic.`;

  const answer = await generateWithGemini(apiKey, prompt, { temperature: 0.75 });
  if (answer) {
    return { answer, sources: ['Portfolio Assistant'], provider: 'gemini-flash' };
  }
  return { answer: '', sources: [], provider: 'generation-unavailable' };
}
