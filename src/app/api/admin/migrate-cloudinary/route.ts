import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { isCloudinaryConfigured, uploadImageToCloudinary } from '@/lib/cloudinary';
import { getPortfolioContent, savePortfolioContent } from '@/lib/postgres';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

function mimeType(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  return ({ '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' } as Record<string, string>)[extension] || 'application/octet-stream';
}

async function sourceToBlob(source: string) {
  if (source.startsWith('/')) {
    const publicDir = path.resolve(process.cwd(), 'public');
    const filename = path.resolve(publicDir, `.${source}`);
    if (!filename.startsWith(`${publicDir}${path.sep}`)) throw new Error('Invalid local image path.');
    const bytes = await fs.readFile(filename);
    return { blob: new Blob([bytes], { type: mimeType(filename) }), filename: path.basename(filename) };
  }

  const url = new URL(source);
  if (url.protocol !== 'https:' || url.hostname !== 'images.unsplash.com') {
    throw new Error(`Unsupported image source: ${source}`);
  }
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not download ${source}`);
  return {
    blob: new Blob([await response.arrayBuffer()], { type: response.headers.get('content-type') || 'image/jpeg' }),
    filename: 'project-image.jpg',
  };
}

async function migrateImage(source: string, folder: 'portfolio/skills' | 'portfolio/projects' | 'portfolio/profile') {
  if (source.includes('res.cloudinary.com')) return source;
  const { blob, filename } = await sourceToBlob(source);
  return uploadImageToCloudinary(blob, filename, folder);
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ success: false, error: 'Cloudinary image storage is not configured.' }, { status: 503 });
  }

  try {
    const content = await getPortfolioContent();
    if (!content) throw new Error('No portfolio content was found.');
    const updated = structuredClone(content);
    let migrated = 0;

    if (updated.hero?.profileImage) {
      updated.hero.profileImage = await migrateImage(updated.hero.profileImage, 'portfolio/profile');
      migrated++;
    }
    for (const category of updated.skills || []) {
      for (const skill of category.skills || []) {
        skill.icon = await migrateImage(skill.icon, 'portfolio/skills');
        migrated++;
      }
    }
    for (const project of updated.projects || []) {
      project.image = await migrateImage(project.image, 'portfolio/projects');
      migrated++;
    }

    const result = await savePortfolioContent(updated);
    return NextResponse.json({ success: true, migrated, content: updated, result });
  } catch (error: any) {
    console.error('Cloudinary migration error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Migration failed.' }, { status: 500 });
  }
}
