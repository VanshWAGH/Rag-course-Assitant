import { embedBatchBase } from './geminiClient.js';
import { logger } from './logger.js';

/**
 * Embeds an array of texts using batch processing and concurrency control.
 * @param {string[]} texts 
 * @param {Object} options 
 * @returns {Promise<number[][]>} Array of vectors in the same order
 */
export async function embedBatch(texts, { model = 'gemini-embedding-2', batchSize = 90 } = {}) {
  const batches = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }
  
  // Gemini free tier limits embed requests to 100 per minute.
  // We must process batches strictly sequentially and sleep to respect quotas.
  const allVectors = [];
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const vectors = await embedBatchBase(batch, { model });
    allVectors.push(...vectors);
    
    if (i < batches.length - 1) {
      logger.info(`Sleeping for 60 seconds to respect Gemini API quota (100 req/min)...`);
      await new Promise(r => setTimeout(r, 60000));
    }
  }

  return allVectors;
}