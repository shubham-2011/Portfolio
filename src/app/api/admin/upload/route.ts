import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isCloudinaryConfigured, uploadImageToCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/admin-auth';
import { saveMediaToPostgres } from '@/lib/postgres';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const formData = await request.formData();
    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const targetFolder = (formData.get('folder') as string) || 'Skills';

    const filesToProcess: File[] = [];
    if (rawFiles && rawFiles.length > 0) {
      filesToProcess.push(...rawFiles.filter((f) => f && f.size > 0));
    } else if (singleFile && singleFile.size > 0) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json({ success: false, error: 'No files uploaded.' }, { status: 400 });
    }

    const folderName = targetFolder === 'Skills' ? 'Skills' : 'uploads';
    const diskTargetDir = path.join(process.cwd(), 'public', folderName);
    try {
      await fs.promises.mkdir(diskTargetDir, { recursive: true });
    } catch {
      // Ignored if read-only
    }

    const results = [];

    for (const file of filesToProcess) {
      const originalExt = (path.extname(file.name) || '').toLowerCase();
      const isImage = file.type.startsWith('image/') || file.type === 'image/svg+xml';
      const isPdf = file.type === 'application/pdf' || originalExt === '.pdf';

      if (!isImage && !isPdf) {
        continue;
      }

      if (file.size > 20 * 1024 * 1024) {
        continue;
      }

      const baseName = path
        .basename(file.name, originalExt)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      const sanitizedName = `${baseName}${originalExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let fileUrl = `/api/media/${sanitizedName}`;

      // 1. Try Cloudinary if explicitly configured
      let uploadedToCloudinary = false;
      if (isCloudinaryConfigured()) {
        try {
          const cFolder = targetFolder === 'Skills' ? 'portfolio/skills' : 'portfolio/projects';
          const cUrl = await uploadImageToCloudinary(file, sanitizedName, cFolder);
          if (cUrl) {
            fileUrl = cUrl;
            uploadedToCloudinary = true;
          }
        } catch (cErr) {
          console.warn('Cloudinary upload fallback to PostgreSQL/disk:', cErr);
        }
      }

      // 2. Persist to Neon PostgreSQL Cloud Database (Permanent on Netlify)
      try {
        await saveMediaToPostgres(sanitizedName, folderName, file.type, buffer);
      } catch (dbErr) {
        console.error('Failed saving to PostgreSQL media table:', dbErr);
      }

      // 3. Also persist to local disk if writable
      try {
        const filePath = path.join(diskTargetDir, sanitizedName);
        await fs.promises.writeFile(filePath, buffer);
      } catch {
        // Read-only on Netlify serverless functions, database serves as primary
      }

      results.push({
        filename: sanitizedName,
        url: fileUrl,
        size: file.size,
        type: file.type,
        folder: folderName,
      });
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid image files could be processed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: results[0].url,
      filename: results[0].filename,
      files: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const message = isDev ? error?.message || String(error) : 'Failed to upload file.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

