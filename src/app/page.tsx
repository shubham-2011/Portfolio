import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Education from '@/components/Education';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import PortfolioChatbot from '@/components/PortfolioChatbot';
import { getPortfolioContent } from '@/lib/postgres';
import defaultContent from '@/data/portfolioContent.json';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let content = defaultContent;

  try {
    const dbContent = await getPortfolioContent();
    if (dbContent) {
      content = dbContent;
    }
  } catch (err) {
    console.warn('Using default content fallback:', err);
  }

  // Dynamic JSON-LD: ItemList for projects (enables rich search results)
  const projectsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Full Stack Projects by Shubham Kumar',
    description:
      'Portfolio of production-ready full stack projects built with Java, Spring Boot, Angular, React, PostgreSQL, and Cloud technologies.',
    numberOfItems: content.projects?.length || 0,
    itemListElement: (content.projects || []).map((proj: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: proj.title,
        description: proj.description,
        applicationCategory: 'WebApplication',
        operatingSystem: 'Web',
        url: proj.links?.live || proj.links?.frontend || 'https://www.skm-tech.xyz/#projects',
        image: proj.image,
        author: {
          '@type': 'Person',
          name: 'Shubham Kumar',
          url: 'https://www.skm-tech.xyz/',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  // Dynamic JSON-LD: Skill set as proficiency claims
  const allSkillNames = (content.skills || []).flatMap(
    (cat: any) => (cat.skills || []).map((s: any) => s.name)
  );

  const skillsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Technical Skills — Shubham Kumar',
    description:
      'Full stack development skills including frontend, backend, database, and cloud technologies.',
    numberOfItems: allSkillNames.length,
    itemListElement: allSkillNames.map((name: string, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'DefinedTerm',
        name: name,
        description: `${name} — professional proficiency by Shubham Kumar`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Software Development Technologies',
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Dynamic JSON-LD for Projects & Skills */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skillsJsonLd) }}
      />

      <Navbar />
      <Hero content={content.hero} />
      <About content={content.about} />
      <Skills categories={content.skills} />
      <Projects projects={content.projects} />
      <Education education={content.education} experience={content.experience} />
      <ContactForm />
      <Footer />
      <PortfolioChatbot content={content} />
    </main>
  );
}
