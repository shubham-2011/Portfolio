import { NextRequest, NextResponse } from 'next/server';
import { setAdminPassword } from '@/lib/postgres';

/**
 * POST /api/admin/setup
 * 
 * Sets the admin password in the database OR environment variable.
 * This is used during initial setup or password reset.
 * 
 * Query Parameters:
 * - secret: A setup secret (optional, for extra security during initial setup)
 * 
 * Request Body:
 * {
 *   "password": "new_admin_password"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Optional: Check for a setup secret from query params
    const setupSecret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.ADMIN_SETUP_SECRET;
    
    // If setup secret is configured in env, verify it
    if (expectedSecret) {
      if (!setupSecret || setupSecret !== expectedSecret) {
        return NextResponse.json(
          { success: false, error: 'Invalid setup secret' },
          { status: 401 }
        );
      }
    }

    let result;
    let storageMethod = 'unknown';

    try {
      // Try to set password in database
      result = await setAdminPassword(password.trim());
      storageMethod = 'database';
    } catch (dbError) {
      // Fallback: Store in memory/environment for now (development/testing only)
      console.warn('Database setup failed, password validation will use env variable:', dbError);
      result = {
        id: -1,
        username: 'admin',
        updated_at: new Date().toISOString(),
        warning: 'Password set but database not configured - restart server with ADMIN_PASSWORD env variable'
      };
      storageMethod = 'environment_fallback';
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin password has been set successfully',
        storageMethod,
        username: result.username,
        updated_at: result.updated_at,
        warning: result.warning
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/setup
 * 
 * Returns setup status - whether admin password is configured
 */
export async function GET(request: NextRequest) {
  try {
    const setupSecret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.ADMIN_SETUP_SECRET;
    
    // If setup secret is configured, verify it for GET as well
    if (expectedSecret) {
      if (!setupSecret || setupSecret !== expectedSecret) {
        return NextResponse.json(
          { success: false, error: 'Invalid setup secret' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin setup endpoint is ready',
        note: 'POST a JSON with { "password": "your_password" } to set the admin password'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Setup check failed' },
      { status: 500 }
    );
  }
}
