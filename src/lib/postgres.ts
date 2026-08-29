import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const connectionString = process.env.POSTGRES_URL;

// Global pool caching for Next.js serverless environments
let pool: Pool | undefined = (global as any).postgresPool;

if (!pool && connectionString) {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  (global as any).postgresPool = pool;
}

export function isPostgresConfigured() {
  return Boolean(connectionString);
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

export default pool;
