import { parseSync } from 'subtitle';
import fs from 'fs';
import { cleanText } from '../utils/textUtils.js';

/**
 * Parses VTT files using subtitle.
 * Strips VTT-specific styling tags via textUtils.js.
 * @param {string} filePath 
 * @returns {{ text: string, startMs: number, endMs: number }[]}
 */
export function parseVTT(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseSync(content);
  
  return parsed
    .filter(node => node.type === 'cue')
    .map(node => ({
      text: cleanText(node.data.text),
      startMs: node.data.start,
      endMs: node.data.end,
    }));
}