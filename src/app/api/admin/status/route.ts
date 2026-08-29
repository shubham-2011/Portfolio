import { NextRequest, NextResponse } from 'next/server';
import { testPostgresConnection } from '@/lib/postgres';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const dbStatus = await testPostgresConnection();
    return NextResponse.json({ success: true, dbStatus }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
