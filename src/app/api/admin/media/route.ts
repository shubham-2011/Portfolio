import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/admin-auth';
import { listMediaFromPostgres, deleteMediaFromPostgres } from '@/lib/postgres';

export const runtime = 'nodejs';

const VALID_IMAGE_EXTS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.avif', '.pdf']);

interface MediaAsset {
  id: string;
  name: string;
  folder: 'Skills' | 'uploads';
  url: string;
  size: number;
  modifiedAt: string;
  extension: string;
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const rootDir = process.cwd();
    const folders: Array<'Skills' | 'uploads'> = ['Skills', 'uploads'];
    const assetMap = new Map<string, MediaAsset>();

    // 1. Fetch persistent assets from PostgreSQL database (Neon Tech)
    try {
      const dbRows = await listMediaFromPostgres();
      for (const row of dbRows) {
        const ext = path.extname(row.filename).toLowerCase().replace('.', '');
        assetMap.set(row.filename, {
          id: `db_${row.id}`,
          name: row.filename,
          folder: row.folder || 'Skills',
          url: `/api/media/${row.filename}`,
          size: row.size_bytes || 0,
          modifiedAt: new Date(row.created_at).toISOString(),
          extension: ext,
        });
      }
    } catch (dbErr) {
      console.warn('Could not read media from PostgreSQL:', dbErr);
    }

    // 2. Scan local public/ directory (disk assets)
    for (const folder of folders) {
      const folderPath = path.join(rootDir, 'public', folder);

      try {
        await fs.promises.access(folderPath);
        const files = await fs.promises.readdir(folderPath);

        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (!VALID_IMAGE_EXTS.has(ext)) continue;

          // If already in map from PostgreSQL, keep database entry or update URL
          if (assetMap.has(file)) continue;

          const filePath = path.join(folderPath, file);
          try {
            const stats = await fs.promises.stat(filePath);
            if (!stats.isFile()) continue;

            assetMap.set(file, {
              id: `${folder}_${file}`,
              name: file,
              folder,
              url: `/${folder}/${file}`,
              size: stats.size,
              modifiedAt: stats.mtime.toISOString(),
              extension: ext.replace('.', ''),
            });
          } catch (fileErr) {
            console.warn(`Could not read stat for ${file}:`, fileErr);
          }
        }
      } catch {
        // Folder might be read-only or not present in serverless container
      }
    }

    const assets = Array.from(assetMap.values());
    assets.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    return NextResponse.json({
      success: true,
      count: assets.length,
      assets,
    });
  } catch (error: any) {
    console.error('Media listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve media assets.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const body = await request.json();
    const { filename, folder } = body;

    if (!filename || !folder) {
      return NextResponse.json(
        { success: false, error: 'Filename and folder are required.' },
        { status: 400 }
      );
    }

    const safeFilename = path.basename(filename);

    // 1. Delete from PostgreSQL
    await deleteMediaFromPostgres(safeFilename);

    // 2. Delete from disk if present
    try {
      const filePath = path.join(process.cwd(), 'public', folder, safeFilename);
      await fs.promises.unlink(filePath);
    } catch {
      // Disk file might not exist or be in read-only environment
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${safeFilename} successfully.`,
    });
  } catch (error: any) {
    console.error('Media deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media asset.' },
      { status: 500 }
    );
  }
}

