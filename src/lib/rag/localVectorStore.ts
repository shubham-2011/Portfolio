import fs from 'fs';
import path from 'path';
import { cosineSimilarity } from './embeddings';

export interface LocalVectorChunk {
  id?: number | string;
  chunk_id?: string;
  chunkId?: string;
  title: string;
  category: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  updated_at?: string;
}

export interface LocalVectorStoreStats {
  engine: 'Self-Hosted Local Vector Store';
  storagePath: string;
  totalChunks: number;
  dimensions: number;
  categories: string[];
  lastIndexed: string | null;
  fileSizeBytes: number;
}

const STORAGE_DIR = path.join(process.cwd(), 'data', 'vectors');
const STORAGE_FILE = path.join(STORAGE_DIR, 'portfolio_embeddings.json');
const TMP_STORAGE_FILE = path.join('/tmp', 'portfolio_embeddings.json');

// In-memory runtime vector cache (fastest, guaranteed across all serverless executions)
let inMemoryStore: LocalVectorChunk[] = [];

/**
 * Ensures the data/vectors directory exists
 */
function ensureStorageDirectory(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (err) {
    // Ignore error if running on read-only filesystem (e.g. AWS Lambda / Netlify functions)
  }
}

/**
 * Reads all vector chunks from in-memory cache or local filesystem
 */
export function getAllChunksFromLocalStore(): LocalVectorChunk[] {
  if (inMemoryStore && inMemoryStore.length > 0) {
    return inMemoryStore;
  }

  try {
    ensureStorageDirectory();
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryStore = parsed;
          return inMemoryStore;
        }
      }
    }
  } catch (_) {}

  // Fallback to /tmp in serverless environments
  try {
    if (fs.existsSync(TMP_STORAGE_FILE)) {
      const raw = fs.readFileSync(TMP_STORAGE_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryStore = parsed;
          return inMemoryStore;
        }
      }
    }
  } catch (_) {}

  return inMemoryStore;
}

/**
 * Saves or updates vector chunks in in-memory cache and on disk
 */
export function saveChunksToLocalStore(chunks: LocalVectorChunk[]): { success: boolean; total: number } {
  try {
    ensureStorageDirectory();
    const existing = getAllChunksFromLocalStore();
    const map = new Map<string, LocalVectorChunk>();

    for (const item of existing) {
      const key = item.chunk_id || item.chunkId;
      if (key) {
        map.set(key, item);
      }
    }

    const now = new Date().toISOString();
    for (const chunk of chunks) {
      const cid = chunk.chunk_id || (chunk as any).chunkId || `chunk-${Date.now()}-${Math.random()}`;
      map.set(cid, {
        ...chunk,
        chunk_id: cid,
        chunkId: cid,
        updated_at: now,
      });
    }

    const updatedList = Array.from(map.values());
    inMemoryStore = updatedList;

    // Try saving to project data folder
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
    } catch (fsErr) {
      // If filesystem is read-only (serverless), fallback to /tmp
      try {
        fs.writeFileSync(TMP_STORAGE_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
      } catch (_) {}
    }

    return { success: true, total: updatedList.length };
  } catch (err) {
    console.error('Error saving to local vector store:', err);
    return { success: false, total: inMemoryStore.length };
  }
}

/**
 * Performs high-speed cosine vector similarity search over the self-hosted local vector store
 */
export function searchLocalVectorStore(
  queryEmbedding: number[],
  topK = 4,
  minThreshold = 0.22
): Array<{ chunk: LocalVectorChunk; similarity: number }> {
  try {
    const all = getAllChunksFromLocalStore();
    if (!all || all.length === 0) return [];

    const scored = all.map((chunk) => {
      const sim = cosineSimilarity(queryEmbedding, chunk.embedding);
      return { chunk, similarity: sim };
    });

    return scored
      .filter((item) => item.similarity >= minThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (err) {
    console.error('Error querying local vector store:', err);
    return [];
  }
}

/**
 * Returns diagnostic stats about the local vector store
 */
export function getLocalVectorStoreStats(): LocalVectorStoreStats {
  try {
    ensureStorageDirectory();
    const all = getAllChunksFromLocalStore();
    let fileSizeBytes = 0;

    if (fs.existsSync(STORAGE_FILE)) {
      fileSizeBytes = fs.statSync(STORAGE_FILE).size;
    }

    const categories = Array.from(new Set(all.map((c) => c.category || 'General')));
    const sample = all[0];
    const dimensions = sample && Array.isArray(sample.embedding) ? sample.embedding.length : 384;
    const lastIndexed = all.length > 0 && all[0].updated_at ? all[0].updated_at : null;

    return {
      engine: 'Self-Hosted Local Vector Store',
      storagePath: 'data/vectors/portfolio_embeddings.json',
      totalChunks: all.length,
      dimensions,
      categories,
      lastIndexed,
      fileSizeBytes,
    };
  } catch (err) {
    return {
      engine: 'Self-Hosted Local Vector Store',
      storagePath: 'data/vectors/portfolio_embeddings.json',
      totalChunks: 0,
      dimensions: 384,
      categories: [],
      lastIndexed: null,
      fileSizeBytes: 0,
    };
  }
}
