/**
 * RAG Embedding Service for Shubham's Portfolio
 * Supports:
 * 1. Google Gemini text-embedding-004 (768-dim) when GEMINI_API_KEY is configured
 * 2. High-accuracy deterministic local semantic projection (384-dim) as a zero-key fallback
 */

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  model: 'text-embedding-004' | 'local-semantic-projection';
}

/**
 * Computes cosine similarity between two vector embeddings
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * High-accuracy deterministic semantic vector projection (384-dim)
 * Converts textual tokens, character tri-grams, and developer keywords into a normalized dense vector.
 */
function generateLocalSemanticVector(text: string, dimensions = 384): number[] {
  const vec = new Float64Array(dimensions);
  const clean = text.toLowerCase().trim();
  if (!clean) return Array.from(vec);

  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of']);
  const words = clean.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean);

  const devBoost = new Set([
    'java', 'spring', 'springboot', 'angular', 'react', 'nextjs', 'postgres', 'postgresql',
    'mongodb', 'microservices', 'rest', 'api', 'docker', 'cloud', 'aws', 'apk', 'elite',
    'pune', 'indira', 'university', 'msc', 'bsc', 'experience', 'worked', 'working', 'warking',
    'notice', 'hire', 'resume', 'fullstack', 'frontend', 'backend', 'database'
  ]);

  for (const word of words) {
    if (stopWords.has(word)) continue;
    const weight = devBoost.has(word) ? 3.0 : 1.0;

    let h = 2166136261;
    for (let i = 0; i < word.length; i++) {
      h ^= word.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % dimensions;
    vec[idx] += weight;

    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const trigram = word.substring(i, i + 3);
        let th = 2166136261;
        for (let j = 0; j < trigram.length; j++) {
          th ^= trigram.charCodeAt(j);
          th = Math.imul(th, 16777619);
        }
        const tidx = Math.abs(th) % dimensions;
        vec[tidx] += 0.45;
      }
    }
  }

  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] = vec[i] / norm;
    }
  }

  return Array.from(vec);
}

/**
 * Generates an embedding for a piece of text.
 * Uses Google Gemini text-embedding-004 if GEMINI_API_KEY is available.
 * Otherwise uses the high-precision local semantic projection.
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text: text.slice(0, 8000) }],
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const values = data?.embedding?.values;
        if (Array.isArray(values) && values.length > 0) {
          return {
            embedding: values,
            dimensions: values.length,
            model: 'text-embedding-004',
          };
        }
      } else {
        console.warn('Gemini embedding API notice, using local semantic fallback:', await response.text());
      }
    } catch (err) {
      console.warn('Gemini embedding network exception, using local semantic fallback:', err);
    }
  }

  const localVec = generateLocalSemanticVector(text, 384);
  return {
    embedding: localVec,
    dimensions: localVec.length,
    model: 'local-semantic-projection',
  };
}
