import { embedText } from '../../services/geminiClient.js';
import { search as qdrantSearch } from '../../services/qdrantClient.js';

/**
 * Embeds query and searches Qdrant.
 * @param {string} queryText 
 * @param {Object} options 
 * @returns {Promise<Object[]>} Array of scored chunks
 */
export async function vectorSearch(queryText, { filter = undefined, limit = 10 } = {}) {
  const vector = await embedText(queryText);
  const results = await qdrantSearch(vector, { filter, limit });
  return results;
}