import assert from 'node:assert/strict';
import test from 'node:test';
import { KnowledgeEntry, findKnowledgeMatch, findTopKnowledgeMatches, isDirectContactIntent } from '../src/lib/chat/knowledgeMatcher';

const entries: KnowledgeEntry[] = [
  { id: 'contact', question: 'How can I contact Shubham Kumar?', answer: '', category: 'Contact', keywords: ['contact', 'hire', 'email', 'phone', 'reach', 'whatsapp'] },
  { id: 'why-hire', question: 'Why should we hire Shubham Kumar?', answer: '', category: 'General', keywords: ['why hire', 'strengths', 'why choose', 'value', 'qualities', 'interview'] },
  { id: 'experience', question: 'Where has Shubham worked?', answer: '', category: 'Experience', keywords: ['work', 'working', 'company', 'experience', 'employer', 'employment'] },
  { id: 'availability', question: 'What is Shubham’s notice period and availability?', answer: '', category: 'Career', keywords: ['notice period', 'immediate', 'join', 'availability', 'start date', 'hiring'] },
  { id: 'relocation', question: 'Is Shubham willing to relocate?', answer: '', category: 'Career', keywords: ['relocate', 'relocation', 'location', 'pune', 'bangalore', 'remote'] },
  { id: 'frontend', question: 'What frontend technologies does Shubham use?', answer: '', category: 'Skills', keywords: ['frontend', 'angular', 'react', 'ui', 'javascript'] },
  { id: 'backend', question: 'What backend languages does Shubham use?', answer: '', category: 'Skills', keywords: ['backend', 'java', 'spring boot', 'api', 'microservices'] },
  { id: 'database', question: 'What databases has Shubham worked with?', answer: '', category: 'Skills', keywords: ['database', 'postgresql', 'mongodb', 'mysql', 'oracle'] },
  { id: 'cloud', question: 'What cloud and DevOps tools does Shubham use?', answer: '', category: 'Skills', keywords: ['cloud', 'aws', 'docker', 'devops', 'linux'] },
  { id: 'projects', question: 'What projects has Shubham built?', answer: '', category: 'Projects', keywords: ['projects', 'built', 'portfolio', 'applications'] },
  { id: 'education', question: 'What is Shubham’s education?', answer: '', category: 'Education', keywords: ['education', 'degree', 'msc', 'bsc', 'university'] },
  { id: 'identity', question: 'Who is Shubham Kumar?', answer: '', category: 'About', keywords: ['who', 'about', 'introduction', 'developer'] },
];

function expectMatch(query: string, expectedId: string) {
  const result = findKnowledgeMatch(query, entries);
  assert.ok(result, `Expected a match for: ${query}`);
  assert.equal(result.entry.id, expectedId, `Unexpected result for: ${query}`);
}

test('typo and paraphrase variants select Why hire rather than Contact', () => {
  for (const query of [
    'why shuld hire shubham kumar', 'why should we hire shubham', 'what makes shubham a strong hire',
    'why choose shubham for this role', 'tell me shubhams strengths', 'what value would shubham bring',
  ]) expectMatch(query, 'why-hire');
});

test('genuine contact queries remain direct Contact intents', () => {
  for (const query of ['how do I email you', "what's your phone number", 'how can I reach shubham on whatsapp']) {
    assert.equal(isDirectContactIntent(query), true, `Expected direct contact intent for: ${query}`);
  }
  assert.equal(isDirectContactIntent('why shuld hire shubham kumar'), false);
});

test('retrieval supplies at most the requested top-K entries for answer generation', () => {
  const matches = findTopKnowledgeMatches('why shuld hire shubham kumar', entries, 3);
  assert.ok(matches.length > 0 && matches.length <= 3);
  assert.equal(matches[0].entry.id, 'why-hire');
});

test('near-duplicate intent cases rank the expected current knowledge entry', () => {
  const cases: Array<[string, string]> = [
    ['which company did shubham work for', 'experience'], ['can he join immediatly', 'availability'],
    ['is he open to relocating', 'relocation'], ['does he know react for frontend ui', 'frontend'],
    ['does he build java spring boot apis', 'backend'], ['has he used postgress or mongo database', 'database'],
    ['does he know docker and aws cloud', 'cloud'], ['show applications he has built', 'projects'],
    ['what university degree does he have', 'education'], ['give an introduction about shubham', 'identity'],
  ];
  for (const [query, expected] of cases) expectMatch(query, expected);
});
