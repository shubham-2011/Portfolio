import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Supports two modes:
// 1) If AWS S3 env vars are provided, upload to S3 (recommended for production).
// 2) Otherwise, fall back to writing into the local `public` folder (works in local dev,
//    but is not persistent on many serverless hosts such as Vercel/Netlify).

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetFolder = (formData.get('folder') as string) || 'Skills';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const uniqueName = `${Date.now()}_${sanitizedName}`;

    // If S3 env vars are present, use S3.
    const S3_BUCKET = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
    const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION;
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

    if (S3_BUCKET && S3_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
      try {
        // dynamic import so local dev doesn't require the package if not used
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

        const s3 = new S3Client({
          region: S3_REGION,
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          },
        });

        const key = `${targetFolder}/${uniqueName}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type || 'application/octet-stream',
            ACL: 'public-read',
          })
        );

        const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

        return NextResponse.json({ success: true, url: publicUrl, filename: uniqueName });
      } catch (s3Error: any) {
        console.error('S3 upload failed:', s3Error);
        // fall through to local fallback
      }
    }

    // Fallback: write to local `public` folder. Note: not persistent on serverless hosts.
    const destinationDir = path.join(process.cwd(), 'public', targetFolder);

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    const filePath = path.join(destinationDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/${targetFolder}/${uniqueName}`;

    return NextResponse.json({ success: true, url: publicUrl, filename: uniqueName });
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
