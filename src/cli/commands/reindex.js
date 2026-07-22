import { qdrantClient } from '../../services/qdrantClient.js';
import { config } from '../../config/index.js';
import { logger } from '../../services/logger.js';
import ingestCommand from './ingest.js';

export default async function reindexCommand() {
  const collectionName = config.QDRANT_COLLECTION_NAME;
  
  logger.warn(`Wiping collection: ${collectionName}...`);
  try {
    await qdrantClient.deleteCollection(collectionName);
    logger.success('Collection deleted.');
  } catch (error) {
    logger.warn('Collection might not exist yet, proceeding to ingest...');
  }
  
  logger.info('Starting fresh ingestion...');
  await ingestCommand();
}