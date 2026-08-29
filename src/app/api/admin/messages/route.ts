import { NextRequest, NextResponse } from 'next/server';
import { getContactsFromPostgres, deleteContactFromPostgres } from '@/lib/postgres';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const messages = await getContactsFromPostgres();
    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve messages from database.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteContactFromPostgres(parseInt(id, 10));
    return NextResponse.json({ success: true, deleted }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting admin message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message from database.' },
      { status: 500 }
    );
  }
}
