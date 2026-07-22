import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.js';
import { logger } from './logger.js';

// Initialize Qdrant Client
export const qdrantClient = new QdrantClient({
  url: config.QDRANT_URL,
  apiKey: config.QDRANT_API_KEY || undefined,
  checkCompatibility: false,
});

/**
 * Creates the collection if it doesn't already exist.
 * Uses 3072 dimensions for Gemini gemini-embedding-2.
 */
export async function createCollectionIfNotExists() {
  const collectionName = config.QDRANT_COLLECTION_NAME;
  try {
    const res = await qdrantClient.getCollections();
    const exists = res.collections.some(c => c.name === collectionName);
    
    if (!exists) {
      logger.info(`Creating Qdrant collection: ${collectionName}`);
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 3072, // gemini-embedding-2 dimension
          distance: 'Cosine',
        },
      });
      logger.success('Collection created.');
    } else {
      logger.info(`Collection ${collectionName} already exists.`);
    }
  } catch (error) {
    logger.error('Failed to create/check Qdrant collection', error);
    throw error;
  }
}

/**
 * Upsert chunks into Qdrant.
 * @param {Object[]} chunks 
 */
export async function upsertChunks(chunks) {
  const collectionName = config.QDRANT_COLLECTION_NAME;
  
  // Format chunks for Qdrant
  const points = chunks.map(chunk => ({
    id: chunk.chunkId,
    vector: chunk.vector,
    payload: {
      text: chunk.text,
      startMs: chunk.startMs,
      endMs: chunk.endMs,
      moduleName: chunk.moduleName,
      className: chunk.className,
      lessonName: chunk.lessonName,
      sourceFile: chunk.sourceFile,
    }
  }));

  await qdrantClient.upsert(collectionName, {
    wait: true,
    points,
  });
}

/**
 * Search Qdrant for similar vectors.
 * @param {number[]} vector 
 * @param {Object} options 
 * @returns {Promise<Object[]>}
 */
export async function search(vector, { filter = undefined, limit = 5 } = {}) {
  const collectionName = config.QDRANT_COLLECTION_NAME;
  
  const searchResult = await qdrantClient.search(collectionName, {
    vector,
    filter,
    limit,
    with_payload: true,
  });
  
  return searchResult.map(res => ({
    score: res.score,
    id: res.id,
    ...res.payload, // Spread payload (text, lessonName, etc)
  }));
}