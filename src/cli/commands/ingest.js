import fs from 'fs';
import path from 'path';
import { logger } from '../../services/logger.js';
import { parseSRT } from '../../ingestion/parseSRT.js';
import { parseVTT } from '../../ingestion/parseVTT.js';
import { chunkCues } from '../../ingestion/chunker.js';
import { buildMetadata } from '../../ingestion/metadataBuilder.js';
import { embedAndStore } from '../../ingestion/embedAndStore.js';
import { createCollectionIfNotExists } from '../../services/qdrantClient.js';

// Helper to recursively get all files
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

export default async function ingestCommand() {
  const rawDir = path.join(process.cwd(), 'data', 'raw');
  
  if (!fs.existsSync(rawDir)) {
    logger.error(`Raw data directory not found: ${rawDir}`);
    return;
  }

  // Get all files recursively, then filter
  const allFiles = getAllFiles(rawDir);
  let filesToProcess = allFiles.filter(f => f.endsWith('.srt') || f.endsWith('.vtt'));
  
  // Prefer VTT over SRT if both exist
  const vttFiles = new Set(filesToProcess.filter(f => f.endsWith('.vtt')).map(f => f.replace('.vtt', '')));
  filesToProcess = filesToProcess.filter(f => {
    if (f.endsWith('.srt') && vttFiles.has(f.replace('.srt', ''))) {
      return false; // Skip SRT if VTT exists
    }
    return true;
  });
  
  if (filesToProcess.length === 0) {
    logger.warn(`No .srt or .vtt files found in ${rawDir}`);
    return;
  }

  logger.info(`Starting ingestion for ${filesToProcess.length} files...`);
  await createCollectionIfNotExists();

  let allChunks = [];

  for (const filePath of filesToProcess) {
    const relativePath = path.relative(rawDir, filePath);
    logger.step('Process', `Processing ${relativePath}...`);
    
    let cues = [];
    if (filePath.endsWith('.srt')) cues = parseSRT(filePath);
    else if (filePath.endsWith('.vtt')) cues = parseVTT(filePath);
    
    const chunks = chunkCues(cues, 300);
    // Pass the relative path to metadata builder to extract folder info
    const chunksWithMeta = buildMetadata(chunks, relativePath);
    
    allChunks.push(...chunksWithMeta);
  }

  logger.info(`Total chunks created: ${allChunks.length}`);
  await embedAndStore(allChunks);
  logger.success('Ingestion completed successfully!');
}
