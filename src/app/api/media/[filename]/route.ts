import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getMediaFromPostgres } from '@/lib/postgres';

export const runtime = 'nodejs';

const MIME_MAP: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename) {
      return new NextResponse('File not specified', { status: 400 });
    }

    const safeFilename = path.basename(filename);

    // 1. Check PostgreSQL Cloud Database first (persistent for Netlify)
    const dbAsset = await getMediaFromPostgres(safeFilename);
    if (dbAsset) {
      const headers: Record<string, string> = {
        'Content-Type': dbAsset.mimeType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${safeFilename}"`,
      };
      return new NextResponse(dbAsset.buffer, {
        status: 200,
        headers,
      });
    }

    // 2. Fallback to local disk (public/Skills or public/uploads)
    const folders = ['Skills', 'uploads'];
    for (const folder of folders) {
      const diskPath = path.join(process.cwd(), 'public', folder, safeFilename);
      try {
        await fs.promises.access(diskPath);
        const buffer = await fs.promises.readFile(diskPath);
        const ext = path.extname(safeFilename).toLowerCase();
        const mimeType = MIME_MAP[ext] || 'application/octet-stream';

        const headers: Record<string, string> = {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Disposition': `inline; filename="${safeFilename}"`,
        };

        return new NextResponse(buffer, {
          status: 200,
          headers,
        });
      } catch {
        // Continue searching other folders
      }
    }

    return new NextResponse('Asset not found', { status: 404 });
  } catch (error) {
    console.error('Media fetch error:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}
