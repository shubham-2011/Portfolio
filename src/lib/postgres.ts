import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString =
  process.env.POSTGRES_URL ||
  'postgresql://neondb_owner:npg_hQoR9X2Fgrlt@ep-cool-block-atydsn8b.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Global pool caching for Next.js serverless environments
let pool: Pool | undefined = (global as any).postgresPool;

if (!pool) {
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

let contactsTableInitialized = false;
let contentTableInitialized = false;

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

  // 2. Persist to local JSON file as backup
  try {
    const filePath = path.join(process.cwd(), 'src/data/portfolioContent.json');
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to local JSON file (read-only filesystem in serverless):', err);
  }

  return { success: true, savedToDb };
}

export default pool;
