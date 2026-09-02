export interface KnowledgeEntry {
  id?: string | number;
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
}

export interface MatchBreakdown {
  id?: string | number;
  question: string;
  category: string;
  score: number;
  exactQuestion: boolean;
  exactKeywords: string[];
  exactTerms: string[];
  fuzzyTerms: Array<{ query: string; matched: string }>;
}

export interface KnowledgeMatch {
  entry: KnowledgeEntry;
  score: number;
  ranking: MatchBreakdown[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'did', 'do',
  'does', 'for', 'from', 'had', 'has', 'have', 'having', 'he', 'hello', 'hey',
  'hi', 'hii', 'hiii', 'him', 'his', 'how', 'i', 'in', 'is', 'it', 'its', 'like',
  'many', 'me', 'much', 'my', 'of', 'on', 'or', 'our', 'so', 'some', 'tell',
  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to',
  'us', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'who', 'whom',
  'why', 'will', 'with', 'would', 'you', 'your',
]);

const INTENT_BOOST: Record<string, number> = {
  skills: 5.0,
  skill: 5.0,
  technologies: 5.0,
  tech: 4.0,
  stack: 4.5,
  frontend: 4.0,
  backend: 4.0,
  database: 4.0,
  cloud: 4.0,
  projects: 5.0,
  project: 5.0,
  experience: 5.0,
  career: 4.0,
  education: 5.0,
  degree: 5.0,
  university: 4.0,
  college: 4.0,
  contact: 5.0,
  hire: 5.0,
  email: 4.0,
  phone: 4.0,
  whatsapp: 4.0,
  resume: 5.0,
  cv: 5.0,
  location: 4.0,
};

function tokens(value: string): string[] {
  return value.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function editDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (Math.abs(left.length - right.length) > 2) return 3;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[right.length];
}

function isFuzzyMatch(queryToken: string, candidateToken: string): boolean {
  if (queryToken === candidateToken || queryToken.length < 4 || candidateToken.length < 4) return false;
  const allowedDistance = Math.max(queryToken.length, candidateToken.length) >= 8 ? 2 : 1;
  return editDistance(queryToken, candidateToken) <= allowedDistance;
}

function inverseDocumentFrequency(term: string, documentTerms: Set<string>[]): number {
  const documentFrequency = documentTerms.filter((terms) => terms.has(term)).length;
  return Math.log((documentTerms.length + 1) / (documentFrequency + 1)) + 1;
}

/**
 * Ranks CMS knowledge entries using phrase matches, rarity-weighted token overlap,
 * and a small edit-distance allowance for misspellings. It intentionally returns
 * the full ranking so operational diagnostics can explain a selection.
 */
export function rankKnowledgeEntries(query: string, entries: KnowledgeEntry[]): MatchBreakdown[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = tokens(normalizedQuery);
  const documentTerms = entries.map((entry) => new Set(tokens(`${entry.question} ${(entry.keywords || []).join(' ')}`)));

  return entries.map((entry, index) => {
    const question = entry.question.toLowerCase();
    const keywordPhrases = (entry.keywords || []).map((keyword) => keyword.toLowerCase().trim()).filter(Boolean);
    const questionTerms = new Set(tokens(entry.question));
    const keywordTerms = new Set(tokens(keywordPhrases.join(' ')));
    const exactKeywords: string[] = [];
    const exactTerms: string[] = [];
    const fuzzyTerms: Array<{ query: string; matched: string }> = [];
    const cleanQuestion = question.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanQuery = normalizedQuery.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const exactQuestion = cleanQuery.length >= 5 && (cleanQuery === cleanQuestion || cleanQuery.includes(cleanQuestion));
    let score = exactQuestion ? 100 : 0;

    for (const phrase of keywordPhrases) {
      const phraseTokens = tokens(phrase);
      if (phraseTokens.length === 0) continue;
      const phraseRegex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'i');
      if (phraseRegex.test(normalizedQuery)) {
        const specificity = phraseTokens.reduce((sum, term) => sum + inverseDocumentFrequency(term, documentTerms), 0) / phraseTokens.length;
        score += (phraseTokens.length === 1 ? 1.5 : 5 * phraseTokens.length) * specificity;
        exactKeywords.push(phrase);
      }
    }

    for (const queryToken of queryTokens) {
      const boost = INTENT_BOOST[queryToken] || 1.0;
      if (questionTerms.has(queryToken)) {
        score += 2 * boost * inverseDocumentFrequency(queryToken, documentTerms);
        exactTerms.push(queryToken);
        continue;
      }
      if (keywordTerms.has(queryToken)) {
        score += boost * inverseDocumentFrequency(queryToken, documentTerms);
        exactTerms.push(queryToken);
        continue;
      }
      const fuzzyQuestionTerm = [...questionTerms].find((term) => isFuzzyMatch(queryToken, term));
      if (fuzzyQuestionTerm) {
        score += 1.8 * boost * inverseDocumentFrequency(fuzzyQuestionTerm, documentTerms);
        fuzzyTerms.push({ query: queryToken, matched: fuzzyQuestionTerm });
        continue;
      }
      const fuzzyKeywordTerm = [...keywordTerms].find((term) => isFuzzyMatch(queryToken, term));
      if (fuzzyKeywordTerm) {
        score += 0.9 * boost * inverseDocumentFrequency(fuzzyKeywordTerm, documentTerms);
        fuzzyTerms.push({ query: queryToken, matched: fuzzyKeywordTerm });
      }
    }

    return { id: entry.id, question: entry.question, category: entry.category || 'General', score, exactQuestion, exactKeywords, exactTerms, fuzzyTerms };
  }).sort((left, right) => right.score - left.score);
}

export function findKnowledgeMatch(query: string, entries: KnowledgeEntry[], minimumScore = 2.5): KnowledgeMatch | null {
  const ranking = rankKnowledgeEntries(query, entries);
  const winner = ranking[0];
  if (!winner || winner.score < minimumScore) return null;
  const entry = entries.find((item) => item.id === winner.id && item.question === winner.question) || entries.find((item) => item.question === winner.question);
  return entry ? { entry, score: winner.score, ranking } : null;
}

/** Returns up to topK relevant CMS entries for grounded answer generation. */
export function findTopKnowledgeMatches(
  query: string,
  entries: KnowledgeEntry[],
  topK = 3,
  minimumScore = 2.5,
): KnowledgeMatch[] {
  const ranking = rankKnowledgeEntries(query, entries);
  return ranking
    .filter((candidate) => candidate.score >= minimumScore)
    .slice(0, topK)
    .flatMap((candidate) => {
      const entry = entries.find((item) => item.id === candidate.id && item.question === candidate.question)
        || entries.find((item) => item.question === candidate.question);
      return entry ? [{ entry, score: candidate.score, ranking }] : [];
    });
}

export function isDirectContactIntent(query: string): boolean {
  return /\b(contact|contect|cntact|phone|number|mobile|call|whatsapp|watsapp|email|reach)\b/i.test(query);
}
