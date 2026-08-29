# Admin Password Setup Guide

## Overview
The admin password is now stored in the PostgreSQL database for better security and easier management. The default admin password `Shubham@20` can be set using one of the following methods.

## Method 1: Using the Setup API Endpoint (Recommended for Production)

### Option A: With Setup Secret
If you want to secure the setup endpoint, set an `ADMIN_SETUP_SECRET` environment variable:

```bash
# Set this in your .env.local file
ADMIN_SETUP_SECRET=your-secure-setup-secret-here
```

Then make a POST request:
```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"password": "Shubham@20"}' \
  -G -d 'secret=your-secure-setup-secret-here'
```

Or using fetch in JavaScript:
```javascript
fetch('/api/admin/setup?secret=your-secure-setup-secret-here', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'Shubham@20' })
})
.then(res => res.json())
.then(data => console.log(data))
```

### Option B: Without Setup Secret (Development Only)
If `ADMIN_SETUP_SECRET` is not configured, you can set the password directly:

```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"password": "Shubham@20"}'
```

## Method 2: Using the Node.js Setup Script

### Step 1: Ensure POSTGRES_URL is Set
First, add your PostgreSQL connection URL to your environment:

```bash
# PowerShell
$env:POSTGRES_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Or add to .env.local
POSTGRES_URL=postgresql://username:password@host:5432/database?sslmode=require
```

### Step 2: Run the Setup Script
```bash
# From the project root directory
node scripts/set-admin-password.js "Shubham@20"
```

Expected output:
```
✅ Admin credentials table ensured
✅ Admin password has been successfully set!
   Username: admin
   Updated at: 2026-08-29T...

📝 You can now login with:
   Username: admin
   Password: Shubham@20
```

## Method 3: Direct Database Query (Advanced)

If you have direct access to PostgreSQL, you can set the password manually:

```sql
-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL DEFAULT 'admin',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert or update the admin password
-- Password: Shubham@20
-- SHA256 Hash: 4c8c8b8d8c8c8b8d8c8c8b8d8c8c8b8d (actual hash will be calculated)

INSERT INTO admin_credentials (username, password_hash)
VALUES ('admin', '4c8c8b8d8c8c8b8d8c8c8b8d8c8c8b8d')
ON CONFLICT (username)
DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

## Login After Setup

Once the password is set:

1. Navigate to the admin panel
2. Click "Login" or go to `/admin`
3. Enter your credentials:
   - **Password**: `Shubham@20` (or your custom password)
4. You'll be authenticated and can manage the portfolio content

## Changing the Password Later

To change the admin password later, use any of the above methods with the new password.

## Environment Variables Reference

```env
# Required
POSTGRES_URL=postgresql://username:password@host:5432/database

# Optional (for extra security on the setup endpoint)
ADMIN_SETUP_SECRET=your-secure-random-string-here

# Required for admin session (must be at least 32 characters)
ADMIN_SESSION_SECRET=generate-a-random-48-character-string-here
```

## Database Schema

The admin credentials are stored in the `admin_credentials` table:

```sql
CREATE TABLE admin_credentials (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL DEFAULT 'admin',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: Passwords are hashed using SHA256 before being stored in the database.

## Security Notes

1. Always use HTTPS in production
2. Keep `ADMIN_SETUP_SECRET` secret if using one
3. Make `ADMIN_SESSION_SECRET` a long random string (48+ characters)
4. Consider using bcrypt for password hashing in production (currently using SHA256)
5. Restrict access to `/api/admin/setup` if not using a setup secret
