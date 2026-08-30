const fs = require('fs');
const path = require('path');

// 1. Load Local Vector Store
const vectorFilePath = path.join(__dirname, '..', 'data', 'vectors', 'portfolio_embeddings.json');
const portfolioContentPath = path.join(__dirname, '..', 'src', 'data', 'portfolioContent.json');

const rawVectors = fs.existsSync(vectorFilePath) ? JSON.parse(fs.readFileSync(vectorFilePath, 'utf-8')) : [];
const portfolioContent = fs.existsSync(portfolioContentPath) ? JSON.parse(fs.readFileSync(portfolioContentPath, 'utf-8')) : {};

// 2. Cosine Similarity & Vector Projection (exact duplicate of embeddings.ts)
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

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
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] = vec[i] / norm;
    }
  }
  return Array.from(vec);
}

// 3. Raw Vector Retrieval Function (Without LLM)
function rawRetrieve(query, topK = 20) {
  const queryEmbedding = generateLocalSemanticVector(query, 384);
  const scored = rawVectors.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// 4. Ground-Truth Test Cases (30 cases)
const testCases = [
  // Exact Identifiers / Lookup (1-5)
  {
    id: 'TC-01',
    type: 'Exact Identifier',
    question: 'What is Shubham phone number?',
    expected_chunk: 'website-contact-info',
    expected_answer: '+91 9322887529',
    important_keywords: ['phone', '9322887529', 'contact']
  },
  {
    id: 'TC-02',
    type: 'Exact Identifier',
    question: 'What is Shubham contact email address?',
    expected_chunk: 'website-contact-info',
    expected_answer: 'shubhammisra800@gmail.com',
    important_keywords: ['email', 'shubhammisra800@gmail.com']
  },
  {
    id: 'TC-03',
    type: 'Exact Identifier',
    question: 'What is the GitHub repository for the Movie Ticket Booking backend?',
    expected_chunk: 'website-project-1',
    expected_answer: 'https://github.com/shubham-2011/Movie-ticket-Backend',
    important_keywords: ['github', 'Movie-ticket-Backend']
  },
  {
    id: 'TC-04',
    type: 'Exact Identifier',
    question: 'What is the live website URL for APK Elite Services?',
    expected_chunk: 'website-project-3',
    expected_answer: 'https://www.apkeliteservices.in/',
    important_keywords: ['apkeliteservices.in']
  },
  {
    id: 'TC-05',
    type: 'Exact Identifier',
    question: 'Where can I download Shubham resume?',
    expected_chunk: 'website-hero',
    expected_answer: '/Skills/Shubham_Kumar_Resume.pdf',
    important_keywords: ['resume', 'pdf']
  },

  // Semantic Queries & Paraphrases (6-11)
  {
    id: 'TC-06',
    type: 'Semantic Query',
    question: 'How do customers reserve seats in cinema system?',
    expected_chunk: 'website-project-1',
    expected_answer: 'interactive seat reservation workflow',
    important_keywords: ['booking', 'seat', 'cinema']
  },
  {
    id: 'TC-07',
    type: 'Semantic Query',
    question: 'Which tool does he use to containerize microservices?',
    expected_chunk: 'website-skills-3-cloud-&-tools',
    expected_answer: 'Docker',
    important_keywords: ['docker', 'container']
  },
  {
    id: 'TC-08',
    type: 'Semantic Query',
    question: 'What library handles reactive asynchronous streams in frontend?',
    expected_chunk: 'website-project-1',
    expected_answer: 'RxJS in Angular',
    important_keywords: ['rxjs', 'angular']
  },
  {
    id: 'TC-09',
    type: 'Semantic Query',
    question: 'Does Shubham build asynchronous event-driven architectures with Kafka?',
    expected_chunk: 'website-project-4',
    expected_answer: 'Cloud-Native Microservices E-Commerce Gateway using Kafka',
    important_keywords: ['kafka', 'event', 'microservices']
  },
  {
    id: 'TC-10',
    type: 'Semantic Query',
    question: 'How does the product management app track remaining stock items?',
    expected_chunk: 'website-project-2',
    expected_answer: 'FIFO logic and real-time inventory monitoring',
    important_keywords: ['fifo', 'inventory', 'stock']
  },
  {
    id: 'TC-11',
    type: 'Semantic Query',
    question: 'What protocol powers live multi-user document synchronization?',
    expected_chunk: 'website-project-5',
    expected_answer: 'WebSockets and Redis pub/sub',
    important_keywords: ['websockets', 'redis']
  },

  // Numerical Queries (12-16)
  {
    id: 'TC-12',
    type: 'Numerical Query',
    question: 'How many years of software development experience does Shubham have?',
    expected_chunk: 'website-hero',
    expected_answer: '2+ years',
    important_keywords: ['2+', 'years']
  },
  {
    id: 'TC-13',
    type: 'Numerical Query',
    question: 'What score or percentage did he receive in Bachelor in Computer Science?',
    expected_chunk: 'website-education-1',
    expected_answer: 'Score: 60%',
    important_keywords: ['60%', 'score']
  },
  {
    id: 'TC-14',
    type: 'Numerical Query',
    question: 'What was his CGPA in Higher Secondary grade 10?',
    expected_chunk: 'website-education-3',
    expected_answer: 'CGPA: 7.0',
    important_keywords: ['7.0', 'cgpa']
  },
  {
    id: 'TC-15',
    type: 'Numerical Query',
    question: 'What is his joining notice period in days?',
    expected_chunk: 'website-contact-info',
    expected_answer: '0 days notice period (immediately available)',
    important_keywords: ['0 days', 'immediate']
  },
  {
    id: 'TC-16',
    type: 'Numerical Query',
    question: 'What Java version was utilized in the product management backend?',
    expected_chunk: 'website-project-2',
    expected_answer: 'Java 17 with Spring Boot',
    important_keywords: ['java 17']
  },

  // Date / Timeline Queries (17-20)
  {
    id: 'TC-17',
    type: 'Date / Timeline',
    question: 'When did Shubham work at Tipco Engineering?',
    expected_chunk: 'website-experience-0-tipco',
    expected_answer: 'Jul 2026 - Aug 2026',
    important_keywords: ['jul 2026', 'aug 2026', 'tipco']
  },
  {
    id: 'TC-18',
    type: 'Date / Timeline',
    question: 'During what months was he an intern at SetTribe?',
    expected_chunk: 'website-experience-1-settribe',
    expected_answer: 'Feb 2024 - Nov 2024',
    important_keywords: ['feb 2024', 'nov 2024', 'settribe']
  },
  {
    id: 'TC-19',
    type: 'Date / Timeline',
    question: 'When did he graduate with his Bachelor Degree?',
    expected_chunk: 'website-education-1',
    expected_answer: '2020 - 2023',
    important_keywords: ['2020', '2023']
  },
  {
    id: 'TC-20',
    type: 'Date / Timeline',
    question: 'When does his Master of Science degree take place?',
    expected_chunk: 'website-education-0',
    expected_answer: '2025 - Present',
    important_keywords: ['2025', 'present', 'indira']
  },

  // Multi-Document & Comparison Queries (21-24)
  {
    id: 'TC-21',
    type: 'Multi-Document',
    question: 'Compare the backend frameworks between project 1 and project 2',
    expected_chunk: 'website-project-1', // or website-project-2
    expected_answer: 'Project 1 uses ASP.NET Core with C#; Project 2 uses Spring Boot with Java 17',
    important_keywords: ['asp.net', 'spring boot']
  },
  {
    id: 'TC-22',
    type: 'Multi-Document',
    question: 'What relational databases does Shubham use across his stack?',
    expected_chunk: 'website-skills-2-database',
    expected_answer: 'PostgreSQL, MySQL, and Oracle DB',
    important_keywords: ['postgresql', 'mysql', 'oracle']
  },
  {
    id: 'TC-23',
    type: 'Multi-Document',
    question: 'What frontends are used across project 1, 2, and 5?',
    expected_chunk: 'website-project-1',
    expected_answer: 'Angular 18 for project 1 & 2, React 19 for project 5',
    important_keywords: ['angular', 'react']
  },
  {
    id: 'TC-24',
    type: 'Multi-Document',
    question: 'What university is he enrolled in for postgraduate studies in Pune?',
    expected_chunk: 'website-education-0',
    expected_answer: 'Indira University, Pune',
    important_keywords: ['indira university', 'pune']
  },

  // Multi-Chunk & Holistic Queries (25-27)
  {
    id: 'TC-25',
    type: 'Multi-Chunk',
    question: 'Tell me all companies Shubham has worked at and his roles',
    expected_chunk: 'website-experience-0-tipco',
    expected_answer: 'APK Elite Services (Freelance Full Stack), Tipco Engineering (Website Developer), SetTribe (Intern)',
    important_keywords: ['apk elite', 'tipco', 'settribe']
  },
  {
    id: 'TC-26',
    type: 'Multi-Chunk',
    question: 'What is his academic path from secondary school to master degree?',
    expected_chunk: 'website-education-0',
    expected_answer: 'Higher Secondary (Saraswati Vidya Mandir), Senior Secondary (PC College), BSc CS, MSc CS (Indira Univ)',
    important_keywords: ['msc', 'bsc', 'secondary']
  },
  {
    id: 'TC-27',
    type: 'Multi-Chunk',
    question: 'What architectural patterns does he use for enterprise distributed systems?',
    expected_chunk: 'website-project-4',
    expected_answer: 'Microservices with API Gateway, Kafka event bus, Docker, and PostgreSQL connection pooling',
    important_keywords: ['microservices', 'gateway', 'kafka']
  },

  // Negative / Out-of-Domain Queries (28-30)
  {
    id: 'TC-28',
    type: 'Negative Query',
    question: 'What is the CEO home address and personal car license plate?',
    expected_chunk: 'NONE',
    expected_answer: 'OUT_OF_DOMAIN',
    important_keywords: []
  },
  {
    id: 'TC-29',
    type: 'Negative Query',
    question: 'Give me the secret recipe for Italian chocolate pizza with truffles',
    expected_chunk: 'NONE',
    expected_answer: 'OUT_OF_DOMAIN',
    important_keywords: []
  },
  {
    id: 'TC-30',
    type: 'Negative Query',
    question: 'What cryptocurrency token did Shubham invest his savings into in 2021?',
    expected_chunk: 'NONE',
    expected_answer: 'OUT_OF_DOMAIN',
    important_keywords: []
  }
];

// Run Tests and Compute Metrics
console.log('=== RUNNING PRODUCTION RAG AUDIT SUITE ===\n');

let recallAt1 = 0;
let recallAt3 = 0;
let recallAt5 = 0;
let recallAt10 = 0;
let recallAt20 = 0;
let positiveCount = 0;

const failureMatrix = [];

testCases.forEach((tc, idx) => {
  const isNegative = tc.type === 'Negative Query';
  const retrieved = rawRetrieve(tc.question, 20);

  if (isNegative) {
    // For negative queries: Top-1 score should be LOW (< 0.25)
    const topScore = retrieved.length > 0 ? retrieved[0].score : 0;
    const passed = topScore < 0.25;
    failureMatrix.push({
      test: tc.id,
      type: tc.type,
      question: tc.question,
      expected: 'REJECT / OUT_OF_DOMAIN',
      retrieved: retrieved[0]?.chunk?.chunk_id || 'NONE',
      score: topScore.toFixed(3),
      rank: passed ? '—' : 1,
      result: passed ? 'PASS' : 'FAIL',
      rootCause: passed ? '—' : 'HALLUCINATION_RISK (High similarity on OOD query)'
    });
    return;
  }

  positiveCount++;
  const rank = retrieved.findIndex(r => r.chunk.chunk_id === tc.expected_chunk);
  const actualRank = rank !== -1 ? rank + 1 : 999;

  if (actualRank <= 1) recallAt1++;
  if (actualRank <= 3) recallAt3++;
  if (actualRank <= 5) recallAt5++;
  if (actualRank <= 10) recallAt10++;
  if (actualRank <= 20) recallAt20++;

  let status = 'PASS';
  let rootCause = '—';

  if (actualRank === 999) {
    status = 'FAIL';
    rootCause = 'RETRIEVAL_FAILURE (Not in Top 20)';
  } else if (actualRank > 5) {
    status = 'FAIL';
    rootCause = 'RANKING_FAILURE (Rank > 5)';
  } else if (actualRank > 1) {
    status = 'WARN';
    rootCause = 'RANKING_SUBOPTIMAL (Rank > 1)';
  }

  const topMatch = retrieved[0];
  failureMatrix.push({
    test: tc.id,
    type: tc.type,
    question: tc.question,
    expected: tc.expected_chunk,
    retrieved: topMatch ? topMatch.chunk.chunk_id : 'NONE',
    score: topMatch ? topMatch.score.toFixed(3) : '0',
    rank: actualRank <= 20 ? actualRank : '>20',
    result: status,
    rootCause
  });
});

console.log('--- RECALL METRICS ---');
console.log(`Recall@1:  ${((recallAt1 / positiveCount) * 100).toFixed(1)}% (${recallAt1}/${positiveCount})`);
console.log(`Recall@3:  ${((recallAt3 / positiveCount) * 100).toFixed(1)}% (${recallAt3}/${positiveCount})`);
console.log(`Recall@5:  ${((recallAt5 / positiveCount) * 100).toFixed(1)}% (${recallAt5}/${positiveCount})`);
console.log(`Recall@10: ${((recallAt10 / positiveCount) * 100).toFixed(1)}% (${recallAt10}/${positiveCount})`);
console.log(`Recall@20: ${((recallAt20 / positiveCount) * 100).toFixed(1)}% (${recallAt20}/${positiveCount})\n`);

console.log('--- DETAILED FAILURE MATRIX ---');
console.table(failureMatrix);

// Output sample queries with full inspectable chunks
console.log('\n--- SAMPLE INSPECTABLE RETRIEVAL DETAILS ---');
['What is Shubham phone number?', 'When did Shubham work at Tipco Engineering?', 'Compare the backend frameworks between project 1 and project 2'].forEach(q => {
  console.log(`\n========================================`);
  console.log(`QUERY: "${q}"`);
  const res = rawRetrieve(q, 3);
  res.forEach((r, i) => {
    console.log(`\nRESULT #${i + 1}`);
    console.log(`Document / Chunk ID: ${r.chunk.chunk_id}`);
    console.log(`Title: ${r.chunk.title}`);
    console.log(`Score: ${r.chunk.embedding ? r.score.toFixed(4) : 'N/A'}`);
    console.log(`Metadata: ${JSON.stringify(r.chunk.metadata)}`);
    console.log(`Text snippet: ${r.chunk.content.substring(0, 160)}...`);
  });
});
