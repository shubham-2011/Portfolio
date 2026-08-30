import { KnowledgeEntry, rankKnowledgeEntries } from '../src/lib/chat/knowledgeMatcher';

const query = process.argv.slice(2).join(' ') || 'why shuld hire shubham kumar';
const entries: KnowledgeEntry[] = [
  { id: 'contact', question: 'How can I contact Shubham Kumar?', answer: '', category: 'Contact', keywords: ['contact', 'hire', 'email', 'phone', 'reach'] },
  { id: 'why-hire', question: 'Why should we hire Shubham Kumar?', answer: '', category: 'General', keywords: ['why hire', 'strengths', 'why choose', 'value', 'qualities', 'interview'] },
];

console.log(JSON.stringify({ query, ranking: rankKnowledgeEntries(query, entries) }, null, 2));
