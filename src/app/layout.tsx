import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import VisitorTracker from '@/components/VisitorTracker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Shubham Kumar | Full Stack Developer — Java, Angular, React, Spring Boot, PostgreSQL',
    template: '%s | Shubham Kumar Portfolio',
  },
  description:
    'Shubham Kumar is a Full Stack Software Developer specializing in Java, Spring Boot, Angular, React, Next.js, PostgreSQL, and Cloud technologies. Explore projects, technical skills, education, and hire for full-stack development.',
  keywords: [
    'Shubham Kumar',
    'Full Stack Developer',
    'Java Developer',
    'Spring Boot Developer',
    'Angular Developer',
    'React Developer',
    'Next.js Developer',
    'PostgreSQL',
    'Software Engineer',
    'Web Developer Pune',
    'Cloud Technologies',
    'Microservices',
    'REST API Developer',
    'Computer Science Engineer',
    'Hire Full Stack Developer India',
    'Portfolio',
  ],
  authors: [{ name: 'Shubham Kumar', url: 'https://www.skm-tech.xyz/' }],
  creator: 'Shubham Kumar',
  publisher: 'Shubham Kumar',
  metadataBase: new URL('https://www.skm-tech.xyz/'),
  alternates: {
    canonical: 'https://www.skm-tech.xyz/',
  },
  icons: {
    icon: '/logorm.png',
    apple: '/logorm.png',
  },
  openGraph: {
    type: 'website',
    title: 'Shubham Kumar | Full Stack Developer — Java, Angular, React, Spring Boot',
    description:
      'Computer Science Engineer building scalable full-stack applications with Java, Spring Boot, Angular, React, PostgreSQL & Cloud. View projects and hire me.',
    url: 'https://www.skm-tech.xyz/',
    siteName: 'Shubham Kumar — Full Stack Developer Portfolio',
    locale: 'en_IN',
    images: [
      {
        url: '/Skills/shubham3-rm.png',
        width: 800,
        height: 800,
        alt: 'Shubham Kumar — Full Stack Software Developer Profile',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shubham Kumar | Full Stack Developer — Java, Angular, React',
    description:
      'Computer Science Engineer specializing in Java, Spring Boot, Angular, React, PostgreSQL & Cloud. View portfolio projects.',
    creator: '@shubhammisra800',
    images: ['/Skills/shubham3-rm.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification ID here when available
    // google: 'your-google-verification-id',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD: Person schema (enhanced with occupation, alumni, skills)
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://www.skm-tech.xyz/#person',
    name: 'Shubham Kumar',
    givenName: 'Shubham',
    familyName: 'Kumar',
    jobTitle: 'Full Stack Software Developer',
    description:
      'Computer Science Engineer specializing in Java, Spring Boot, Angular, React, PostgreSQL and Cloud technologies.',
    url: 'https://www.skm-tech.xyz/',
    image: 'https://www.skm-tech.xyz/Skills/shubham3-rm.png',
    email: 'mailto:shubhammisra800@gmail.com',
    telephone: '+91-9322887529',
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
      'JavaScript',
      'TypeScript',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Oracle',
      'HTML5',
      'CSS3',
      'Python',
      'C++',
      'ASP.NET',
      'PHP',
      'Docker',
      'AWS Cloud',
      'Linux',
      'REST APIs',
      'Microservices',
      'WebSockets',
      'Full Stack Development',
      'Cloud Technologies',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Full Stack Software Developer',
      occupationLocation: {
        '@type': 'City',
        name: 'Pune',
      },
      skills:
        'Java, Spring Boot, Angular, React, Next.js, PostgreSQL, MySQL, MongoDB, Docker, AWS, REST APIs, Microservices',
    },
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'Indira University',
        url: 'https://www.indirauniversity.edu.in/',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pune',
          addressRegion: 'Maharashtra',
          addressCountry: 'IN',
        },
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    nationality: {
      '@type': 'Country',
      name: 'India',
    },
  };

  // JSON-LD: WebSite schema (enables Google Sitelinks Search Box)
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.skm-tech.xyz/#website',
    url: 'https://www.skm-tech.xyz/',
    name: 'Shubham Kumar — Full Stack Developer Portfolio',
    description:
      'Portfolio of Shubham Kumar, a Full Stack Software Developer specializing in Java, Spring Boot, Angular, React, PostgreSQL, and Cloud technologies.',
    publisher: {
      '@id': 'https://www.skm-tech.xyz/#person',
    },
    inLanguage: 'en-IN',
  };

  // JSON-LD: WebPage schema
  const webpageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.skm-tech.xyz/#webpage',
    url: 'https://www.skm-tech.xyz/',
    name: 'Shubham Kumar | Full Stack Developer — Java, Angular, React, Spring Boot, PostgreSQL',
    description:
      'Shubham Kumar is a Full Stack Software Developer specializing in Java, Spring Boot, Angular, React, Next.js, PostgreSQL, and Cloud technologies.',
    isPartOf: {
      '@id': 'https://www.skm-tech.xyz/#website',
    },
    about: {
      '@id': 'https://www.skm-tech.xyz/#person',
    },
    inLanguage: 'en-IN',
    datePublished: '2026-01-01',
    dateModified: '2026-08-29',
  };

  // JSON-LD: BreadcrumbList schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.skm-tech.xyz/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://www.skm-tech.xyz/#about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Skills',
        item: 'https://www.skm-tech.xyz/#skills',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Projects',
        item: 'https://www.skm-tech.xyz/#projects',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Education',
        item: 'https://www.skm-tech.xyz/#education',
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'Contact',
        item: 'https://www.skm-tech.xyz/#contact',
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </head>
      <body className="bg-black text-white selection:bg-white selection:text-black antialiased">
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
