import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession, isAdmin, isAdminAuthConfigured, setAdminSession, verifyAdminPassword } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authenticated = isAdmin(request);
  return NextResponse.json({ success: true, authenticated });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearAdminSession(response);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Try to verify password (from database or environment variable)
    const isPasswordCorrect = await verifyAdminPassword(password);
    
    if (!password || !isPasswordCorrect) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    );

    setAdminSession(response);

    return response;
  } catch (error) {
    // Silent catch - return generic error for security
    return NextResponse.json(
      { success: false, error: 'Login error occurred' },
      { status: 500 }
    );
  }
}
