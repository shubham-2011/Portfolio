import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authenticated = request.cookies.get('admin_session')?.value === 'authenticated_token';
  return NextResponse.json({ success: true, authenticated });
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Shubham@20';

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set('admin_session', 'authenticated_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Login error occurred' },
      { status: 500 }
    );
  }
}
