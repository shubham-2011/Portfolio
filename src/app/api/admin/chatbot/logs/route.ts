import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { connectToDatabase } from '@/lib/mongodb';
import ChatLog from '@/models/ChatLog';
import { getChatLogsFromPostgres } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  let logs: any[] = [];
  let source = 'postgres';

  // 1. Try MongoDB if configured
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const mongoDocs = await ChatLog.find().sort({ createdAt: -1 }).limit(200).lean();
      if (mongoDocs && mongoDocs.length > 0) {
        logs = mongoDocs.map((doc: any) => ({
          id: doc._id.toString(),
          sessionId: doc.sessionId,
          userMessage: doc.userMessage,
          botResponse: doc.botResponse,
          intent: doc.intent || 'general',
          ipAddress: doc.ipAddress || '127.0.0.1',
          createdAt: doc.createdAt,
        }));
        source = 'mongodb';
      }
    } catch (mongoErr) {
      console.warn('MongoDB chat logs notice:', mongoErr);
    }
  }

  // 2. Fallback to PostgreSQL
  if (logs.length === 0) {
    try {
      const pgDocs = await getChatLogsFromPostgres(200);
      logs = pgDocs.map((doc: any) => ({
        id: doc.id.toString(),
        sessionId: doc.session_id,
        userMessage: doc.user_message,
        botResponse: doc.bot_response,
        intent: doc.intent || 'general',
        ipAddress: doc.ip_address || '127.0.0.1',
        createdAt: doc.created_at,
      }));
      source = 'postgres';
    } catch (pgErr) {
      console.error('PostgreSQL chat logs fetch error:', pgErr);
    }
  }

  return NextResponse.json({ success: true, logs, source }, { status: 200 });
}
