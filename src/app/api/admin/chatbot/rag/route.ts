import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { reindexPortfolioKnowledge } from '@/lib/rag/indexer';
import { getEmbeddingStatsFromPostgres } from '@/lib/postgres';
import { getLocalVectorStoreStats } from '@/lib/rag/localVectorStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const localStats = getLocalVectorStoreStats();
    let pgCount = 0;
    let pgCategories: string[] = [];
    try {
      const pgStats = await getEmbeddingStatsFromPostgres();
      pgCount = pgStats.count;
      pgCategories = pgStats.categories;
    } catch (_) {}

    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const totalCount = Math.max(localStats.totalChunks, pgCount);

    return NextResponse.json({
      success: true,
      stats: {
        totalChunks: totalCount,
        engine: 'Self-Hosted Local Vector Store',
        storagePath: localStats.storagePath,
        lastUpdated: localStats.lastIndexed,
        categories: localStats.categories.length > 0 ? localStats.categories : pgCategories,
        hasGeminiKey: hasGemini,
        embeddingModel: hasGemini ? 'Google text-embedding-004' : 'Local High-Precision Semantic Projection (384-dim)',
        generationModel: hasGemini ? 'Google Gemini Flash' : 'Generation temporarily unavailable',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const result = await reindexPortfolioKnowledge();
    return NextResponse.json({
      success: result.success,
      indexedCount: result.indexedCount,
      model: result.model,
      message: `Successfully indexed ${result.indexedCount} knowledge chunks into Vector Database!`,
    });
  } catch (error: any) {
    console.error('RAG reindexing API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
