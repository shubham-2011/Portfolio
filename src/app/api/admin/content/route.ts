import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioContent, savePortfolioContent } from '@/lib/postgres';

export async function GET() {
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
