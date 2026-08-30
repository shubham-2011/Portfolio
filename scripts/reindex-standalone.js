/**
 * Ingestion script using absolute/relative imports
 */
const path = require('path');
const fs = require('fs');

// Load embeddings module
const { generateEmbedding } = require('../src/lib/rag/embeddings');
const { saveChunksToLocalStore } = require('../src/lib/rag/localVectorStore');

async function run() {
  const defaultContent = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/portfolioContent.json'), 'utf8'));
  const qaDataset = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/chatbot_qa_dataset.json'), 'utf8'));

  const docs = [];

  // Hero
  const hero = defaultContent.hero || {};
  docs.push({
    chunkId: 'website-hero',
    title: 'Website Hero Section: Shubham Kumar Overview',
    category: 'Hero & Bio',
    content: `Name: Shubham Kumar. Title: ${hero.title || 'Full Stack Software Developer'}. Summary: ${hero.description || ''} Experience: ${hero.yearsExperience || '2+'} years. Resume: /Skills/Shubham_Kumar_Resume.pdf. Status: Available for Opportunities.`,
    metadata: { section: 'hero', source: 'website' }
  });

  // About
  const about = defaultContent.about || {};
  docs.push({
    chunkId: 'website-about',
    title: 'Website About Section: Developer Bio & Engineering Philosophy',
    category: 'About',
    content: `About Shubham: ${about.bio || ''} Location: Pune, Maharashtra, India. Phone: +91 9322887529. Email: shubhammisra800@gmail.com.`,
    metadata: { section: 'about', source: 'website' }
  });

  // Skills
  (defaultContent.skills || []).forEach((cat, idx) => {
    const skillNames = (cat.skills || []).map(s => s.name).join(', ');
    docs.push({
      chunkId: `website-skills-${idx}`,
      title: `Website Skills: ${cat.category} Technologies`,
      category: 'Skills',
      content: `Skill Category: ${cat.category}. Technologies: ${skillNames}. ${cat.description || ''}`,
      metadata: { section: 'skills', category: cat.category, skills: skillNames, source: 'website' }
    });
  });

  // Projects
  (defaultContent.projects || []).forEach((proj, idx) => {
    docs.push({
      chunkId: `website-project-${proj.id || idx}`,
      title: `Website Project: ${proj.title}`,
      category: 'Projects',
      content: `Project Title: ${proj.title}. Description: ${proj.description}. Tech: ${proj.tech?.join(', ')}. Features: ${proj.features?.join('. ')}. GitHub: ${proj.links?.frontend || proj.links?.backend || 'https://github.com/shubham-2011'}`,
      metadata: { section: 'projects', title: proj.title, source: 'website' }
    });
  });

  // Education
  (defaultContent.education || []).forEach((edu, idx) => {
    docs.push({
      chunkId: `website-education-${idx}`,
      title: `Website Education: ${edu.title} at ${edu.university || edu.place}`,
      category: 'Education',
      content: `Academic Qualification: ${edu.title}. Institution: ${edu.university || edu.place}. Year: ${edu.year}. ${edu.extra || ''}. ${edu.description || ''}`,
      metadata: { section: 'education', source: 'website' }
    });
  });

  // Experience
  (defaultContent.experience || []).forEach((exp, idx) => {
    docs.push({
      chunkId: `website-experience-${idx}`,
      title: `Professional Experience: ${exp.role} at ${exp.company}`,
      category: 'Experience',
      content: `Company: ${exp.company}. Role: ${exp.role}. Year: ${exp.year}. Description: ${exp.description}`,
      metadata: { section: 'experience', source: 'website' }
    });
  });

  // Contact
  docs.push({
    chunkId: 'website-contact-info',
    title: 'Website Contact & Hiring Channels',
    category: 'Contact',
    content: `Email: shubhammisra800@gmail.com. Phone / WhatsApp: +91 9322887529. Location: Pune, Maharashtra, India. GitHub: https://github.com/shubham-2011. LinkedIn: https://www.linkedin.com/in/shubham-kumar-48b57023b/. Status: Open for Full-Time Software Engineer roles.`,
    metadata: { section: 'contact', source: 'website' }
  });

  // Curated Q&A dataset
  qaDataset.forEach((qa, idx) => {
    docs.push({
      chunkId: `curated-qa-${idx}-${(qa.intent || 'general').toLowerCase()}`,
      title: `Verified Q&A: ${qa.instruction}`,
      category: qa.intent || 'General',
      content: `Question: ${qa.instruction}. Verified Response: ${qa.response}. Intent: ${qa.intent || ''}.`,
      metadata: { instruction: qa.instruction, intent: qa.intent, source: 'curated_dataset' }
    });
  });

  console.log(`Embedding ${docs.length} total source chunks...`);
  const chunks = [];
  for (const doc of docs) {
    const embedResult = await generateEmbedding(`${doc.title}\n\n${doc.content}`);
    chunks.push({
      chunkId: doc.chunkId,
      chunk_id: doc.chunkId,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      embedding: embedResult.embedding,
      metadata: doc.metadata
    });
  }

  const result = saveChunksToLocalStore(chunks);
  console.log('Saved to local vector database successfully:', result);
}

run().catch(console.error);
