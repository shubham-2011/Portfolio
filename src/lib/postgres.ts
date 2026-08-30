import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DEFAULT_POSTGRES_URL = 'postgresql://neondb_owner:npg_hQoR9X2Fgrlt@ep-cool-block-atydsn8b.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require';
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || DEFAULT_POSTGRES_URL;

// Global pool caching for Next.js serverless environments
let pool: Pool | undefined = (global as any).postgresPool;

if (!pool && connectionString) {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  (global as any).postgresPool = pool;
}

export function isPostgresConfigured() {
  return Boolean(connectionString);
}

export async function testPostgresConnection() {
  if (!pool) {
    return { connected: false, error: 'PostgreSQL Pool not initialized' };
  }
  try {
    const res = await pool.query('SELECT 1 as test, current_database() as db');
    return {
      connected: true,
      database: res.rows[0]?.db || 'neondb',
      source: process.env.POSTGRES_URL ? 'POSTGRES_URL' : (process.env.DATABASE_URL ? 'DATABASE_URL' : 'NEON_TECH_CLOUD_DEFAULT'),
    };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}

export function getPool(): Pool | undefined {
  return pool;
}

let contactsTableInitialized = false;
let contentTableInitialized = false;
let adminTableInitialized = false;

async function ensureAdminTable(clientPool: Pool) {
  if (adminTableInitialized) return;

  const query = `
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL DEFAULT 'admin',
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    adminTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring admin_credentials table exists:', err);
    throw err;
  }
}

async function ensureContactsTable(clientPool: Pool) {
  if (contactsTableInitialized) return;

  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    contactsTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring portfolio_contacts table exists:', err);
    throw err;
  }
}

async function ensureContentTable(clientPool: Pool) {
  if (contentTableInitialized) return;

  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_content (
      id VARCHAR(50) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    contentTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring portfolio_content table exists:', err);
    throw err;
  }
}

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export async function saveContactToPostgres(contact: ContactData) {
  if (!pool) {
    throw new Error('PostgreSQL connection pool is not initialized.');
  }

  await ensureContactsTable(pool);

  const insertQuery = `
    INSERT INTO portfolio_contacts (name, email, phone, subject, message)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at;
  `;

  const values = [
    contact.name.trim(),
    contact.email.trim(),
    contact.phone.trim(),
    contact.subject.trim(),
    contact.message.trim(),
  ];

  const result = await pool.query(insertQuery, values);
  return result.rows[0];
}

export async function getContactsFromPostgres() {
  if (!pool) return [];
  await ensureContactsTable(pool);

  const query = `
    SELECT id, name, email, phone, subject, message, created_at
    FROM portfolio_contacts
    ORDER BY created_at DESC
    LIMIT 100;
  `;

  const result = await pool.query(query);
  return result.rows;
}

export async function deleteContactFromPostgres(id: number) {
  if (!pool) return false;
  await ensureContactsTable(pool);

  const query = `DELETE FROM portfolio_contacts WHERE id = $1 RETURNING id;`;
  const result = await pool.query(query, [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getPortfolioContent() {
  // Try reading from PostgreSQL first
  if (pool) {
    try {
      await ensureContentTable(pool);
      const res = await pool.query(`SELECT data FROM portfolio_content WHERE id = 'main';`);
      if (res.rows.length > 0 && res.rows[0].data) {
        return res.rows[0].data;
      }
    } catch (err) {
      console.warn('PostgreSQL content read notice:', err);
    }
  }

  // Fallback to local JSON file
  try {
    const filePath = path.join(process.cwd(), 'src/data/portfolioContent.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Local JSON content read error:', err);
  }

  return null;
}

export async function savePortfolioContent(content: any) {
  let savedToDb = false;

  // 1. Persist to PostgreSQL portfolio_content table
  if (pool) {
    try {
      await ensureContentTable(pool);
      const query = `
        INSERT INTO portfolio_content (id, data, updated_at)
        VALUES ('main', $1, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        RETURNING id;
      `;
      await pool.query(query, [JSON.stringify(content)]);
      savedToDb = true;
    } catch (err) {
      console.error('Error saving content to PostgreSQL:', err);
    }
  }

  // 2. Persist to local JSON file only in development. Serverless filesystems are
  // read-only/ephemeral, so they cannot be treated as a production data store.
  if (process.env.NODE_ENV === 'production') {
    return { success: savedToDb, savedToDb };
  }

  try {
    const filePath = path.join(process.cwd(), 'src/data/portfolioContent.json');
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to local JSON file (read-only filesystem in serverless):', err);
  }

  return { success: savedToDb, savedToDb };
}

// =============================================================================
// 📊 VISITOR ANALYTICS & FINGERPRINTING DATABASE HELPERS
// =============================================================================
let visitorsTableInitialized = false;

async function ensureVisitorsTable(clientPool: Pool) {
  if (visitorsTableInitialized) return;

  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_visitors (
      id SERIAL PRIMARY KEY,
      fingerprint VARCHAR(255) NOT NULL,
      ip_address VARCHAR(100),
      city VARCHAR(100),
      region VARCHAR(100),
      country VARCHAR(100),
      country_code VARCHAR(10),
      browser VARCHAR(100),
      os VARCHAR(100),
      device_type VARCHAR(50),
      screen_resolution VARCHAR(50),
      language VARCHAR(50),
      page_url VARCHAR(255),
      referrer VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    visitorsTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring portfolio_visitors table exists:', err);
  }
}

export interface VisitorData {
  fingerprint: string;
  ip_address?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  browser?: string;
  os?: string;
  device_type?: string;
  screen_resolution?: string;
  language?: string;
  page_url?: string;
  referrer?: string;
}

export async function saveVisitorToPostgres(visitor: VisitorData) {
  if (!pool) return null;
  await ensureVisitorsTable(pool);

  const insertQuery = `
    INSERT INTO portfolio_visitors (
      fingerprint, ip_address, city, region, country, country_code,
      browser, os, device_type, screen_resolution, language, page_url, referrer
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, created_at;
  `;

  const values = [
    visitor.fingerprint || 'unknown',
    visitor.ip_address || 'unknown',
    visitor.city || 'Unknown',
    visitor.region || 'Unknown',
    visitor.country || 'Unknown',
    visitor.country_code || 'XX',
    visitor.browser || 'Unknown',
    visitor.os || 'Unknown',
    visitor.device_type || 'Desktop',
    visitor.screen_resolution || 'Unknown',
    visitor.language || 'en',
    visitor.page_url || '/',
    visitor.referrer || 'direct',
  ];

  const result = await pool.query(insertQuery, values);
  return result.rows[0];
}

export async function getVisitorsFromPostgres(limit = 100) {
  if (!pool) return [];
  await ensureVisitorsTable(pool);

  const query = `
    SELECT id, fingerprint, ip_address, city, region, country, country_code,
           browser, os, device_type, screen_resolution, language, page_url, referrer, created_at
    FROM portfolio_visitors
    ORDER BY created_at DESC
    LIMIT $1;
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
}

export async function getVisitorStatsFromPostgres() {
  if (!pool) {
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      devices: [],
      browsers: [],
      countries: [],
    };
  }

  await ensureVisitorsTable(pool);

  const totalRes = await pool.query(`SELECT COUNT(*) FROM portfolio_visitors;`);
  const uniqueRes = await pool.query(`SELECT COUNT(DISTINCT fingerprint) FROM portfolio_visitors;`);

  const devicesRes = await pool.query(`
    SELECT device_type, COUNT(*)::int as count
    FROM portfolio_visitors
    GROUP BY device_type
    ORDER BY count DESC;
  `);

  const browsersRes = await pool.query(`
    SELECT browser, COUNT(*)::int as count
    FROM portfolio_visitors
    GROUP BY browser
    ORDER BY count DESC
    LIMIT 10;
  `);

  const countriesRes = await pool.query(`
    SELECT country, country_code, COUNT(*)::int as count
    FROM portfolio_visitors
    GROUP BY country, country_code
    ORDER BY count DESC
    LIMIT 10;
  `);

  return {
    totalVisits: parseInt(totalRes.rows[0]?.count || '0', 10),
    uniqueVisitors: parseInt(uniqueRes.rows[0]?.count || '0', 10),
    devices: devicesRes.rows,
    browsers: browsersRes.rows,
    countries: countriesRes.rows,
  };
}

export async function clearVisitorsFromPostgres() {
  if (!pool) return false;
  await ensureVisitorsTable(pool);

  await pool.query(`TRUNCATE portfolio_visitors;`);
  return true;
}

// =============================================================================
// 🔐 ADMIN CREDENTIALS DATABASE HELPERS
// =============================================================================

export async function ensureAdminTableExists() {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized - POSTGRES_URL not configured');
  }
  await ensureAdminTable(pool);
}

export async function getAdminPasswordHash() {
  if (!pool) {
    // Silently fail if pool not available - fallback to env variable will be used
    return null;
  }
  
  try {
    await ensureAdminTable(pool);
    const result = await pool.query(
      `SELECT password_hash FROM admin_credentials WHERE username = 'admin' LIMIT 1;`
    );
    return result.rows.length > 0 ? result.rows[0].password_hash : null;
  } catch (err) {
    // Silently fail - fallback to environment variable
    return null;
  }
}

export async function setAdminPassword(plainPassword: string) {
  if (!pool) {
    // Silently fail - will use environment variable fallback
    return { id: -1, username: 'admin', updated_at: new Date().toISOString() };
  }

  try {
    await ensureAdminTable(pool);
    
    // Hash the password using crypto
    const hashedPassword = crypto
      .createHash('sha256')
      .update(plainPassword)
      .digest('hex');
    
    const result = await pool.query(
      `INSERT INTO admin_credentials (username, password_hash, updated_at)
       VALUES ('admin', $1, NOW())
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
       RETURNING id, username, updated_at;`,
      [hashedPassword]
    );
    
    return result.rows[0];
  } catch (err) {
    // Silently fail - return mock response
    return { id: -1, username: 'admin', updated_at: new Date().toISOString(), error: 'Database unavailable' };
  }
}

// ============================================================================
// PORTFOLIO MEDIA STORAGE (PERSISTENT CLOUD STORAGE FOR NETLIFY/PRODUCTION)
// ============================================================================
let mediaTableInitialized = false;

async function ensureMediaTable(clientPool: Pool) {
  if (mediaTableInitialized) return;

  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_media (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      folder VARCHAR(50) NOT NULL DEFAULT 'Skills',
      mime_type VARCHAR(100) NOT NULL,
      data_base64 TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    mediaTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring portfolio_media table exists:', err);
  }
}

export async function saveMediaToPostgres(
  filename: string,
  folder: string,
  mimeType: string,
  buffer: Buffer
) {
  if (!pool) return null;
  try {
    await ensureMediaTable(pool);
    const dataBase64 = buffer.toString('base64');
    const query = `
      INSERT INTO portfolio_media (filename, folder, mime_type, data_base64, size_bytes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (filename) DO UPDATE
      SET folder = EXCLUDED.folder,
          mime_type = EXCLUDED.mime_type,
          data_base64 = EXCLUDED.data_base64,
          size_bytes = EXCLUDED.size_bytes,
          created_at = CURRENT_TIMESTAMP
      RETURNING id, filename, folder, mime_type, size_bytes, created_at;
    `;
    const res = await pool.query(query, [filename, folder, mimeType, dataBase64, buffer.length]);
    return res.rows[0];
  } catch (err) {
    console.error('Error saving media to PostgreSQL:', err);
    return null;
  }
}

export async function getMediaFromPostgres(filename: string) {
  if (!pool) return null;
  try {
    await ensureMediaTable(pool);
    const query = `SELECT mime_type, data_base64, size_bytes FROM portfolio_media WHERE filename = $1`;
    const res = await pool.query(query, [filename]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      mimeType: row.mime_type,
      buffer: Buffer.from(row.data_base64, 'base64'),
      size: row.size_bytes,
    };
  } catch (err) {
    console.error('Error getting media from PostgreSQL:', err);
    return null;
  }
}

export async function listMediaFromPostgres() {
  if (!pool) return [];
  try {
    await ensureMediaTable(pool);
    const query = `SELECT id, filename, folder, mime_type, size_bytes, created_at FROM portfolio_media ORDER BY created_at DESC`;
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error('Error listing media from PostgreSQL:', err);
    return [];
  }
}

export async function deleteMediaFromPostgres(filename: string) {
  if (!pool) return false;
  try {
    await ensureMediaTable(pool);
    const query = `DELETE FROM portfolio_media WHERE filename = $1`;
    await pool.query(query, [filename]);
    return true;
  } catch (err) {
    console.error('Error deleting media from PostgreSQL:', err);
    return false;
  }
}

// ============================================================================
// CHAT LOGS STORAGE (MONGODB & POSTGRESQL DUAL PERSISTENCE)
// ============================================================================
let chatLogsTableInitialized = false;

async function ensureChatLogsTable(clientPool: Pool) {
  if (chatLogsTableInitialized) return;

  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_chat_logs (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      user_message TEXT NOT NULL,
      bot_response TEXT NOT NULL,
      intent VARCHAR(100) DEFAULT 'general',
      ip_address VARCHAR(100),
      user_agent VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    chatLogsTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring portfolio_chat_logs table exists:', err);
  }
}

export async function saveChatToPostgres(data: {
  sessionId: string;
  userMessage: string;
  botResponse: string;
  intent?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  if (!pool) return null;
  try {
    await ensureChatLogsTable(pool);
    const query = `
      INSERT INTO portfolio_chat_logs (session_id, user_message, bot_response, intent, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at;
    `;
    const res = await pool.query(query, [
      data.sessionId,
      data.userMessage,
      data.botResponse,
      data.intent || 'general',
      data.ipAddress || '127.0.0.1',
      data.userAgent || 'Unknown',
    ]);
    return res.rows[0];
  } catch (err) {
    console.error('Error saving chat to PostgreSQL:', err);
    return null;
  }
}

export async function getChatLogsFromPostgres(limit = 100) {
  if (!pool) return [];
  try {
    await ensureChatLogsTable(pool);
    const query = `
      SELECT id, session_id, user_message, bot_response, intent, ip_address, user_agent, created_at
      FROM portfolio_chat_logs
      ORDER BY created_at DESC
      LIMIT $1;
    `;
    const res = await pool.query(query, [limit]);
    return res.rows;
  } catch (err) {
    console.error('Error getting chat logs from PostgreSQL:', err);
    return [];
  }
}

// ============================================================================
// CHATBOT KNOWLEDGE BASE (TRAINING DATA DUAL-PERSISTENCE)
// ============================================================================
let knowledgeTableInitialized = false;

async function ensureChatbotKnowledgeTable(clientPool: Pool) {
  if (knowledgeTableInitialized) return;

  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_chatbot_knowledge (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(50) DEFAULT 'General',
      keywords TEXT[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    knowledgeTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring portfolio_chatbot_knowledge table exists:', err);
  }
}

export async function saveChatbotKnowledgeToPostgres(data: {
  id?: number;
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
}) {
  if (!pool) return null;
  try {
    await ensureChatbotKnowledgeTable(pool);
    if (data.id) {
      const updateQuery = `
        UPDATE portfolio_chatbot_knowledge
        SET question = $1, answer = $2, category = $3, keywords = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, question, answer, category, keywords, created_at, updated_at;
      `;
      const res = await pool.query(updateQuery, [
        data.question.trim(),
        data.answer.trim(),
        data.category || 'General',
        data.keywords || [],
        data.id,
      ]);
      return res.rows[0];
    } else {
      const insertQuery = `
        INSERT INTO portfolio_chatbot_knowledge (question, answer, category, keywords)
        VALUES ($1, $2, $3, $4)
        RETURNING id, question, answer, category, keywords, created_at, updated_at;
      `;
      const res = await pool.query(insertQuery, [
        data.question.trim(),
        data.answer.trim(),
        data.category || 'General',
        data.keywords || [],
      ]);
      return res.rows[0];
    }
  } catch (err) {
    console.error('Error saving chatbot knowledge to PostgreSQL:', err);
    return null;
  }
}

export async function getChatbotKnowledgeFromPostgres() {
  if (!pool) return [];
  try {
    await ensureChatbotKnowledgeTable(pool);
    const query = `
      SELECT id, question, answer, category, keywords, created_at, updated_at
      FROM portfolio_chatbot_knowledge
      ORDER BY id DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error('Error getting chatbot knowledge from PostgreSQL:', err);
    return [];
  }
}

export async function deleteChatbotKnowledgeFromPostgres(id: number) {
  if (!pool) return false;
  try {
    await ensureChatbotKnowledgeTable(pool);
    const query = `DELETE FROM portfolio_chatbot_knowledge WHERE id = $1;`;
    await pool.query(query, [id]);
    return true;
  } catch (err) {
    console.error('Error deleting chatbot knowledge from PostgreSQL:', err);
    return false;
  }
}

// ============================================================================
// 🧠 RAG VECTOR EMBEDDINGS (SEMANTIC CHUNK PERSISTENCE & SIMILARITY SEARCH)
// ============================================================================
let embeddingsTableInitialized = false;

export async function ensurePortfolioEmbeddingsTable(clientPool: Pool) {
  if (embeddingsTableInitialized) return;

  // Try enabling pgvector if available on Neon
  try {
    await clientPool.query('CREATE EXTENSION IF NOT EXISTS vector;');
  } catch (_) {
    // Falls back gracefully to native float8[] array storage
  }

  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_embeddings (
      id SERIAL PRIMARY KEY,
      chunk_id VARCHAR(120) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(50) DEFAULT 'General',
      content TEXT NOT NULL,
      embedding float8[] NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await clientPool.query(query);
    embeddingsTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring portfolio_embeddings table exists:', err);
  }
}

export interface RAGChunk {
  chunkId: string;
  chunk_id?: string;
  id?: number;
  title: string;
  category: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export async function saveEmbeddingChunksToPostgres(chunks: RAGChunk[]) {
  if (!pool || chunks.length === 0) return 0;
  try {
    await ensurePortfolioEmbeddingsTable(pool);

    let saved = 0;
    for (const chunk of chunks) {
      const query = `
        INSERT INTO portfolio_embeddings (chunk_id, title, category, content, embedding, metadata, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (chunk_id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(query, [
        chunk.chunkId,
        chunk.title,
        chunk.category || 'General',
        chunk.content,
        chunk.embedding,
        JSON.stringify(chunk.metadata || {}),
      ]);
      saved++;
    }
    return saved;
  } catch (err) {
    console.error('Error saving embedding chunks to PostgreSQL:', err);
    return 0;
  }
}

export async function getAllEmbeddingChunksFromPostgres(): Promise<RAGChunk[]> {
  if (!pool) return [];
  try {
    await ensurePortfolioEmbeddingsTable(pool);
    const query = `
      SELECT chunk_id, title, category, content, embedding, metadata
      FROM portfolio_embeddings;
    `;
    const res = await pool.query(query);
    return res.rows.map((r) => ({
      chunkId: r.chunk_id,
      title: r.title,
      category: r.category,
      content: r.content,
      embedding: Array.isArray(r.embedding) ? r.embedding.map(Number) : [],
      metadata: r.metadata || {},
    }));
  } catch (err) {
    console.error('Error fetching all embedding chunks:', err);
    return [];
  }
}

export async function getEmbeddingStatsFromPostgres() {
  if (!pool) return { count: 0, categories: [], lastUpdated: null };
  try {
    await ensurePortfolioEmbeddingsTable(pool);
    const countRes = await pool.query('SELECT COUNT(*) as total, MAX(updated_at) as last_updated FROM portfolio_embeddings;');
    const catRes = await pool.query('SELECT category, COUNT(*) as count FROM portfolio_embeddings GROUP BY category;');

    return {
      count: parseInt(countRes.rows[0]?.total || '0', 10),
      lastUpdated: countRes.rows[0]?.last_updated || null,
      categories: catRes.rows,
    };
  } catch (err) {
    return { count: 0, categories: [], lastUpdated: null };
  }
}

export default pool;

