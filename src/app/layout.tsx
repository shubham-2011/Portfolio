import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0e17',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Shubham - Full Stack Software Developer | Java | Angular | Cloud',
  description:
    'Shubham is a Computer Engineer specializing in full-stack development with Java, Angular, React, and cloud technologies. Explore my portfolio, skills, and projects.',
  keywords: [
    'Software Developer',
    'Full Stack Developer',
    'Java',
    'Angular',
    'React',
    'Next.js',
    'Spring Boot',
    'Cloud Technologies',
    'Web Development',
  ],
  authors: [{ name: 'Shubham' }],
  metadataBase: new URL('https://www.skm-tech.xyz/'),
  alternates: {
    canonical: 'https://www.skm-tech.xyz/',
  },
  icons: {
    icon: '/logorm.png',
  },
  openGraph: {
    type: 'website',
    title: 'Shubham - Full Stack Software Developer',
    description: 'Computer Engineer specializing in Java, Angular, React, and cloud technologies',
    url: 'https://www.skm-tech.xyz/',
    siteName: 'Shubham Portfolio',
    images: [
      {
        url: '/Skills/shubham3-rm.png',
        width: 800,
        height: 800,
        alt: 'Shubham - Full Stack Developer Profile Picture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shubham - Full Stack Software Developer',
    description: 'Computer Engineer specializing in Java, Angular, React, and cloud technologies',
    images: ['/Skills/shubham3-rm.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shubham',
    jobTitle: 'Full Stack Software Developer',
    url: 'https://www.skm-tech.xyz/',
    image: 'https://www.skm-tech.xyz/Skills/shubham3-rm.png',
    sameAs: [
      'https://www.linkedin.com/in/shubham-kumar-48b57023b/',
      'https://github.com/Shubham200020',
      'https://x.com/shubhammisra800',
      'https://www.instagram.com/skm.20.11',
    ],
    knowsAbout: [
      'Java',
      'Spring Boot',
      'Angular',
      'React',
      'Next.js',
      'Cloud Technologies',
      'Full Stack Development',
    ],
    workLocation: {
      '@type': 'Place',
      name: 'Pune, MH',
    },
  };

  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0a0e17] text-white selection:bg-cyan-500 selection:text-black antialiased">
        {children}
      </body>
    </html>
  );
}
