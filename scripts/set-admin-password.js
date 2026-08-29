#!/usr/bin/env node

/**
 * Script to set admin password in the database
 * 
 * Usage:
 * node scripts/set-admin-password.js <password>
 * 
 * Example:
 * node scripts/set-admin-password.js "Shubham@20"
 */

const { Pool } = require('pg');
const crypto = require('crypto');

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ Error: POSTGRES_URL environment variable is not set');
  process.exit(1);
}

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Password argument is required');
  console.log('Usage: node scripts/set-admin-password.js <password>');
  process.exit(1);
}

if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long');
  process.exit(1);
}

async function setAdminPassword() {
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Create admin_credentials table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL DEFAULT 'admin',
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Admin credentials table ensured');

    // Hash the password
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Insert or update the admin password
    const result = await pool.query(
      `INSERT INTO admin_credentials (username, password_hash, updated_at)
       VALUES ('admin', $1, NOW())
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
       RETURNING id, username, updated_at;`,
      [hashedPassword]
    );

    console.log('✅ Admin password has been successfully set!');
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   Updated at: ${result.rows[0].updated_at}`);
    console.log('\n📝 You can now login with:');
    console.log(`   Username: admin`);
    console.log(`   Password: ${password}`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin password:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setAdminPassword();
