import { embedBatch } from '../services/embeddings.js';
import { upsertChunks } from '../services/qdrantClient.js';
import { logger } from '../services/logger.js';

/**
 * Orchestrates: load chunks -> embed -> store.
 * @param {Object[]} chunksWithMetadata 
 */
export async function embedAndStore(chunksWithMetadata) {
  if (chunksWithMetadata.length === 0) {
    logger.warn('No chunks to embed and store.');
    return;
  }

  logger.step('Embed', `Creating embeddings for ${chunksWithMetadata.length} chunks...`);
  
  const texts = chunksWithMetadata.map(c => c.text);
  const vectors = await embedBatch(texts, { model: 'gemini-embedding-2' });

  if (vectors.length !== chunksWithMetadata.length) {
    throw new Error(
      `Embedding count mismatch: expected ${chunksWithMetadata.length}, got ${vectors.length}`,
    );
  }

  const readyChunks = chunksWithMetadata.map((chunk, i) => ({
    ...chunk,
    vector: vectors[i],
  }));

  logger.step('Store', `Upserting ${readyChunks.length} chunks to Qdrant...`);
  await upsertChunks(readyChunks);
  logger.success('Upsert complete.');
}
