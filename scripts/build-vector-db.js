const fs = require('fs');
const path = require('path');

const vectorFilePath = path.join(__dirname, '..', 'data', 'vectors', 'portfolio_embeddings.json');
const portfolioContentPath = path.join(__dirname, '..', 'src', 'data', 'portfolioContent.json');
const qaDatasetPath = path.join(__dirname, '..', 'data', 'chatbot_qa_dataset.json');

const portfolioContent = fs.existsSync(portfolioContentPath) ? JSON.parse(fs.readFileSync(portfolioContentPath, 'utf-8')) : {};
const qaDataset = fs.existsSync(qaDatasetPath) ? JSON.parse(fs.readFileSync(qaDatasetPath, 'utf-8')) : [];

function generateLocalSemanticVector(text, dimensions = 384) {
  const vec = new Float64Array(dimensions);
  const clean = text.toLowerCase().trim();
  if (!clean) return Array.from(vec);

  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of']);
  const words = clean.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean);

  const devBoost = new Set([
    'java', 'spring', 'springboot', 'angular', 'react', 'nextjs', 'postgres', 'postgresql',
    'mongodb', 'microservices', 'rest', 'api', 'docker', 'cloud', 'aws', 'apk', 'elite',
    'pune', 'indira', 'university', 'msc', 'bsc', 'experience', 'worked', 'working', 'warking',
    'notice', 'hire', 'resume', 'fullstack', 'frontend', 'backend', 'database', 'tipco', 'settribe'
  ]);

  for (const word of words) {
    if (stopWords.has(word)) continue;
    const weight = devBoost.has(word) ? 3.0 : 1.0;

    let h = 2166136261;
    for (let i = 0; i < word.length; i++) {
      h ^= word.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % dimensions;
    vec[idx] += weight;

    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const trigram = word.substring(i, i + 3);
        let th = 2166136261;
        for (let j = 0; j < trigram.length; j++) {
          th ^= trigram.charCodeAt(j);
          th = Math.imul(th, 16777619);
        }
        const tidx = Math.abs(th) % dimensions;
        vec[tidx] += 0.45;
      }
    }
  }

  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vec[i] * vec[i];
  }
  const mag = Math.sqrt(sumSq);
  if (mag > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] /= mag;
    }
  }

  return Array.from(vec);
}

async function buildVectorStore() {
  const docs = [];

  // Hero
  const hero = portfolioContent.hero || {};
  docs.push({
    chunkId: 'website-hero',
    title: 'Website Hero Section: Shubham Kumar Overview',
    category: 'Hero & Bio',
    content: `Name: Shubham Kumar. Title: ${hero.title || 'Full Stack Software Developer'}. Summary: ${hero.description || ''} Experience: ${hero.yearsExperience || '2+'} years. Resume: /Skills/Shubham_Kumar_Resume.pdf. Status: Available for Opportunities.`,
    metadata: { section: 'hero', source: 'website' }
  });

  // About
  const about = portfolioContent.about || {};
  docs.push({
    chunkId: 'website-about',
    title: 'Website About Section: Developer Bio & Engineering Philosophy',
    category: 'About',
    content: `About Shubham: ${about.bio || ''} Location: Pune, Maharashtra, India. Phone: +91 9322887529. Email: shubhammisra800@gmail.com.`,
    metadata: { section: 'about', source: 'website' }
  });

  // Skills
  (portfolioContent.skills || []).forEach((cat, idx) => {
    const skillNames = (cat.skills || []).map(s => s.name).join(', ');
    docs.push({
      chunkId: `website-skills-${idx}-${(cat.category || '').toLowerCase().replace(/\s+/g, '-')}`,
      title: `Website Skills: ${cat.category} Technologies`,
      category: 'Skills',
      content: `Skill Category: ${cat.category}. Technologies: ${skillNames}. ${cat.description || ''}`,
      metadata: { section: 'skills', category: cat.category, skills: skillNames, source: 'website' }
    });
  });

  // Projects
  (portfolioContent.projects || []).forEach((proj, idx) => {
    docs.push({
      chunkId: `website-project-${proj.id || idx}`,
      title: `Website Project: ${proj.title}`,
      category: 'Projects',
      content: `Project Title: ${proj.title}. Description: ${proj.description}. Tech: ${proj.tech?.join(', ')}. Features: ${proj.features?.join('. ')}. GitHub: ${proj.links?.frontend || proj.links?.backend || 'https://github.com/shubham-2011'}`,
      metadata: { section: 'projects', title: proj.title, source: 'website' }
    });
  });

  // Education
  (portfolioContent.education || []).forEach((edu, idx) => {
    docs.push({
      chunkId: `website-education-${idx}`,
      title: `Website Education: ${edu.title} at ${edu.university || edu.place}`,
      category: 'Education',
      content: `Academic Qualification: ${edu.title}. Institution: ${edu.university || edu.place}. Year: ${edu.year}. ${edu.extra || ''}. ${edu.description || ''}`,
      metadata: { section: 'education', source: 'website' }
    });
  });

  // Experience
  (portfolioContent.experience || []).forEach((exp, idx) => {
    docs.push({
      chunkId: `website-experience-${idx}-${(exp.company || '').toLowerCase().replace(/\s+/g, '-')}`,
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
    content: `Email: shubhammisra800@gmail.com. Phone / WhatsApp: +91 9322887529. Location: Pune, Maharashtra, India. GitHub: https://github.com/shubham-2011. LinkedIn: https://www.linkedin.com/in/shubham-kumar-48b57023b/. Status: Available for Opportunities.`,
    metadata: { section: 'contact', source: 'website' }
  });

  // Freelance APK Elite Services
  docs.push({
    chunkId: 'db-experience-apk-elite',
    title: 'Work Experience: Full Stack Engineer at APK Elite Services',
    category: 'Experience',
    content: `Company: APK Elite Services (Freelance). Role: Full Stack Software Developer. Duration: 2024 - Present. Responsibilities: Engineered scalable Spring Boot microservices, designed high-throughput PostgreSQL schemas with custom indexing, and deployed dynamic, accessible user interfaces in Angular and React. Delivered client-facing production applications with fast API response times.`,
    metadata: { company: 'APK Elite Services', role: 'Full Stack Software Developer', source: 'website' }
  });

  // Master Curated Q&A dataset
  qaDataset.forEach((qa, idx) => {
    docs.push({
      chunkId: `curated-qa-${idx}-${(qa.intent || 'general').toLowerCase()}`,
      title: `Verified Q&A: ${qa.instruction}`,
      category: qa.intent || 'General',
      content: `Question: ${qa.instruction}. Verified Response: ${qa.response}. Intent: ${qa.intent || ''}.`,
      metadata: { instruction: qa.instruction, intent: qa.intent, source: 'curated_dataset' }
    });
  });

  console.log(`Embedding ${docs.length} total source documents...`);

  const chunks = docs.map((doc) => ({
    chunkId: doc.chunkId,
    chunk_id: doc.chunkId,
    title: doc.title,
    category: doc.category,
    content: doc.content,
    embedding: generateLocalSemanticVector(`${doc.title}\n\n${doc.content}`),
    metadata: doc.metadata
  }));

  const dir = path.dirname(vectorFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(vectorFilePath, JSON.stringify(chunks, null, 2), 'utf-8');
  console.log(`✅ Successfully saved ${chunks.length} dense vector embeddings to ${vectorFilePath}`);
}

buildVectorStore().catch(console.error);
