import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Attaches metadata to every chunk, including moduleName and className extracted from the file path.
 * Path is expected to be relative from data/raw: 'module 1/class_name/file.vtt'
 * @param {{ text: string, startMs: number, endMs: number }[]} chunks 
 * @param {string} relativeFilePath 
 * @returns {Object[]}
 */
export function buildMetadata(chunks, relativeFilePath) {
  // Normalize slashes for cross-platform parsing
  const parts = relativeFilePath.split(path.sep).join('/').split('/');
  
  const fileName = path.basename(relativeFilePath, path.extname(relativeFilePath));
  
  let moduleName = 'Unknown Module';
  let className = 'Unknown Class';
  
  if (parts.length >= 3) {
    // e.g. "module 1/01_class/file.vtt"
    moduleName = parts[0];
    className = parts[parts.length - 2];
  } else if (parts.length === 2) {
    // e.g. "module 1/file.vtt"
    moduleName = parts[0];
    className = fileName;
  } else {
    // just "file.vtt"
    className = fileName;
  }

  const lessonName = fileName.replace(/_/g, ' ');

  return chunks.map(chunk => ({
    ...chunk,
    chunkId: uuidv4(),
    moduleName,
    className,
    lessonName,
    sourceFile: relativeFilePath,
  }));
}
