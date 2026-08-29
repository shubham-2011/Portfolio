import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetFolder = (formData.get('folder') as string) || 'Skills';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      return NextResponse.json({ success: false, error: 'Only image files can be uploaded.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image must be 10 MB or smaller.' }, { status: 400 });
    }

    // Cloudinary retains the original asset and returns a permanent HTTPS URL.
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const folder = targetFolder === 'Skills' ? 'portfolio/skills' : 'portfolio/projects';
    const url = await uploadImageToCloudinary(file, sanitizedName, folder);

    return NextResponse.json({ success: true, url, filename: sanitizedName });
  } catch (error: any) {
    console.error('File upload error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const message = isDev ? (error?.message || String(error)) : 'Failed to upload file to server.';
    const details = isDev ? (error?.stack || null) : null;
    return NextResponse.json(
      { success: false, error: message, details },
      { status: 500 }
    );
  }
}
