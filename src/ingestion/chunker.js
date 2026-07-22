import { estimateTokenCount, cleanText } from '../utils/textUtils.js';

/**
 * Takes the raw cue array and merges consecutive cues into larger chunks
 * (target ~300 tokens, to easily fit inside context and retain semantics).
 * @param {{ text: string, startMs: number, endMs: number }[]} cues
 * @param {number} targetTokenCount
 * @returns {{ text: string, startMs: number, endMs: number }[]}
 */
export function chunkCues(cues, targetTokenCount = 300) {
  const chunks = [];
  let currentChunkText = '';
  let currentStartMs = null;
  let currentEndMs = null;
  let previousCueEndMs = null;

  for (const cue of cues) {
    const cleanedCue = cleanText(cue.text);
    if (!cleanedCue) continue;

    const pauseBeforeCueMs =
      previousCueEndMs !== null ? cue.startMs - previousCueEndMs : 0;

    if (currentStartMs === null) {
      currentStartMs = cue.startMs;
    }

    currentChunkText += (currentChunkText ? ' ' : '') + cleanedCue;
    currentEndMs = cue.endMs;

    const currentTokens = estimateTokenCount(currentChunkText);

    if (
      currentTokens >= targetTokenCount ||
      (pauseBeforeCueMs > 5000 && currentTokens >= 100)
    ) {
      chunks.push({
        text: currentChunkText.trim(),
        startMs: currentStartMs,
        endMs: currentEndMs,
      });

      currentChunkText = '';
      currentStartMs = null;
      currentEndMs = null;
    }

    previousCueEndMs = cue.endMs;
  }

  if (currentChunkText) {
    chunks.push({
      text: currentChunkText.trim(),
      startMs: currentStartMs,
      endMs: currentEndMs,
    });
  }

  return chunks;
}
