import { generateText } from '../../services/geminiClient.js';

/**
 * Rewrites a user query to improve vector retrieval.
 * @param {string} query
 * @returns {Promise<string>}
 */
export async function rewriteForRetrieval(query) {
  const prompt = `Rewrite the following user query to be highly effective for a vector search engine.
Make it more descriptive and expand on key terms. Only output the rewritten query, nothing else.
Query: "${query}"`;

  try {
    return (await generateText(prompt)).trim();
  } catch {
    return query;
  }
}

/**
 * Builds query variants for parallel retrieval (original + rewritten).
 * @param {string} query
 * @returns {Promise<string[]>}
 */
export async function buildQueryVariants(query) {
  const rewritten = await rewriteForRetrieval(query);
  return [query, rewritten];
}
