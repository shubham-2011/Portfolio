/**
 * Script to reindex all knowledge chunks including the curated dataset into the local vector store
 */
const { reindexPortfolioKnowledge } = require('../src/lib/rag/indexer');

async function main() {
  console.log('Indexing portfolio knowledge chunks and curated dataset...');
  const result = await reindexPortfolioKnowledge();
  console.log('Result:', result);
}

main().catch(console.error);
