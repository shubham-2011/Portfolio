import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Education from '@/components/Education';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
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

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      <Hero content={content.hero} />
      <About content={content.about} />
      <Skills categories={content.skills} />
      <Projects projects={content.projects} />
      <Education education={content.education} experience={content.experience} />
      <ContactForm />
      <Footer />
    </main>
  );
}
