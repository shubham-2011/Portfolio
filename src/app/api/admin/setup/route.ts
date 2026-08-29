import { NextRequest, NextResponse } from 'next/server';
import { setAdminPassword } from '@/lib/postgres';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * POST /api/admin/setup
 * 
 * Sets the admin password in the database.
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

    // Set the admin password
    const result = await setAdminPassword(password.trim());

    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin password has been set successfully',
        username: result.username,
        updated_at: result.updated_at
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Setup failed' },
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
