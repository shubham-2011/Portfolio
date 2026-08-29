import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession, isAdmin, passwordsMatch, setAdminSession } from '@/lib/admin-auth';

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
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      console.error('ADMIN_PASSWORD is not configured.');
      return NextResponse.json({ success: false, error: 'Admin login is unavailable.' }, { status: 503 });
    }

    if (!password || !passwordsMatch(password, expectedPassword)) {
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
    return NextResponse.json(
      { success: false, error: 'Login error occurred' },
      { status: 500 }
    );
  }
}
