import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { parseSRT } from '../src/ingestion/parseSRT.js';
import { chunkCues } from '../src/ingestion/chunker.js';

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,000
Hello world from the course.

2
00:00:05,000 --> 00:00:08,000
This is the second subtitle cue.

3
00:00:20,000 --> 00:00:23,000
After a long pause, we continue.
`;

describe('ingestion pipeline', () => {
  it('parseSRT returns cues with text and timestamps', () => {
    const tempFile = path.join(os.tmpdir(), `sample-${Date.now()}.srt`);
    fs.writeFileSync(tempFile, SAMPLE_SRT, 'utf-8');

    try {
      const cues = parseSRT(tempFile);

      expect(cues).toHaveLength(3);
      expect(cues[0]).toMatchObject({
        text: 'Hello world from the course.',
        startMs: 1000,
        endMs: 4000,
      });
      expect(cues[1].startMs).toBe(5000);
      expect(cues[2].endMs).toBe(23000);
    } finally {
      fs.unlinkSync(tempFile);
    }
  });

  it('chunker merges cues and splits on long pauses', () => {
    const longIntro = Array.from({ length: 80 }, (_, i) => `word${i}`).join(' ');
    const cues = [
      { text: longIntro, startMs: 0, endMs: 2000 },
      { text: 'Bridge after pause.', startMs: 12000, endMs: 14000 },
      { text: 'Final cue.', startMs: 15000, endMs: 16000 },
    ];

    const chunks = chunkCues(cues, 300);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].text).toContain('Bridge after pause.');
    expect(chunks[1].text).toBe('Final cue.');
  });
});
