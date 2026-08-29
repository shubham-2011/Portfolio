import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioContent, isPostgresConfigured, savePortfolioContent } from '@/lib/postgres';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const content = await getPortfolioContent();
    return NextResponse.json({ success: true, data: content }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve portfolio content.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isPostgresConfigured()) {
    return NextResponse.json({ success: false, error: 'Content storage is not configured.' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content payload is required.' },
        { status: 400 }
      );
    }

    const result = await savePortfolioContent(content);
    if (!result.savedToDb) {
      return NextResponse.json({ success: false, error: 'Content could not be saved to the database.' }, { status: 503 });
    }
    return NextResponse.json(
      { success: true, message: 'Portfolio content saved successfully.', result },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to save portfolio content.' },
      { status: 500 }
    );
  }
}
