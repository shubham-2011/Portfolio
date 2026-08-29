import crypto from 'crypto';

const CLOUDINARY_UPLOAD_URL = (cloudName: string) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configuration() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  return { cloudName, apiKey, apiSecret };
}

export async function uploadImageToCloudinary(
  file: Blob,
  filename: string,
  folder: 'portfolio/skills' | 'portfolio/projects' | 'portfolio/profile'
) {
  const { cloudName, apiKey, apiSecret } = configuration();
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

  const form = new FormData();
  form.append('file', file, filename);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);
  form.append('resource_type', 'image');

  const response = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), {
    method: 'POST',
    body: form,
  });
  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    throw new Error(result?.error?.message || 'Cloudinary rejected the upload.');
  }

  return result.secure_url as string;
}
