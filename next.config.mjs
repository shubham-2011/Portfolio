/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pg', 'mongoose'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
