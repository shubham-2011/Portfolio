import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { connectToDatabase } from '@/lib/mongodb';
import ChatbotKnowledge from '@/models/ChatbotKnowledge';
import {
  saveChatbotKnowledgeToPostgres,
  getChatbotKnowledgeFromPostgres,
  deleteChatbotKnowledgeFromPostgres,
} from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  let knowledgeList: any[] = [];
  let source = 'postgres';

  // 1. Try MongoDB if configured
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const mongoDocs = await ChatbotKnowledge.find().sort({ createdAt: -1 }).lean();
      if (mongoDocs && mongoDocs.length > 0) {
        knowledgeList = mongoDocs.map((doc: any) => ({
          id: doc._id.toString(),
          question: doc.question,
          answer: doc.answer,
          category: doc.category || 'General',
          keywords: doc.keywords || [],
          createdAt: doc.createdAt,
        }));
        source = 'mongodb';
      }
    } catch (mongoErr) {
      console.warn('MongoDB knowledge fetch notice:', mongoErr);
    }
  }

  // 2. Fallback to PostgreSQL
  if (knowledgeList.length === 0) {
    try {
      const pgDocs = await getChatbotKnowledgeFromPostgres();
      knowledgeList = pgDocs.map((doc: any) => ({
        id: doc.id.toString(),
        question: doc.question,
        answer: doc.answer,
        category: doc.category || 'General',
        keywords: doc.keywords || [],
        createdAt: doc.created_at,
      }));
      source = 'postgres';
    } catch (pgErr) {
      console.error('PostgreSQL knowledge fetch error:', pgErr);
    }
  }

  return NextResponse.json({ success: true, knowledge: knowledgeList, source }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { question, answer, category, keywords, id } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required.' },
        { status: 400 }
      );
    }

    const cleanKeywords = Array.isArray(keywords)
      ? keywords.map((k: string) => k.trim()).filter(Boolean)
      : typeof keywords === 'string'
      ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [];

    let savedToMongo = false;
    let savedToPostgres = false;

    // 1. Save to MongoDB
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        if (id && id.length === 24) {
          await ChatbotKnowledge.findByIdAndUpdate(
            id,
            { question: question.trim(), answer: answer.trim(), category, keywords: cleanKeywords },
            { new: true }
          );
        } else {
          await ChatbotKnowledge.create({
            question: question.trim(),
            answer: answer.trim(),
            category: category || 'General',
            keywords: cleanKeywords,
          });
        }
        savedToMongo = true;
      } catch (mongoErr) {
        console.warn('MongoDB knowledge save notice:', mongoErr);
      }
    }

    // 2. Save to PostgreSQL
    try {
      const pgId = id && !isNaN(Number(id)) ? Number(id) : undefined;
      await saveChatbotKnowledgeToPostgres({
        id: pgId,
        question,
        answer,
        category,
        keywords: cleanKeywords,
      });
      savedToPostgres = true;
    } catch (pgErr) {
      console.error('PostgreSQL knowledge save error:', pgErr);
    }

    return NextResponse.json(
      {
        success: savedToMongo || savedToPostgres,
        message: 'Chatbot training information saved successfully!',
        savedToMongo,
        savedToPostgres,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving chatbot knowledge:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    let deletedFromMongo = false;
    let deletedFromPostgres = false;

    // MongoDB deletion
    if (process.env.MONGODB_URI && id.length === 24) {
      try {
        await connectToDatabase();
        await ChatbotKnowledge.findByIdAndDelete(id);
        deletedFromMongo = true;
      } catch (err) {
        console.warn('MongoDB deletion notice:', err);
      }
    }

    // PostgreSQL deletion
    if (!isNaN(Number(id))) {
      try {
        deletedFromPostgres = await deleteChatbotKnowledgeFromPostgres(Number(id));
      } catch (err) {
        console.warn('PostgreSQL deletion notice:', err);
      }
    }

    return NextResponse.json({
      success: true,
      deletedFromMongo,
      deletedFromPostgres,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
