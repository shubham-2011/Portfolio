import { NextRequest, NextResponse } from 'next/server';
import { getVisitorsFromPostgres, getVisitorStatsFromPostgres, clearVisitorsFromPostgres } from '@/lib/postgres';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const logs = await getVisitorsFromPostgres(100);
    const stats = await getVisitorStatsFromPostgres();

    return NextResponse.json({
      success: true,
      stats,
      logs,
    });
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await clearVisitorsFromPostgres();
    return NextResponse.json({ success: true, message: 'Visitor logs cleared successfully.' });
  } catch (error: any) {
    console.error('Error clearing analytics logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
