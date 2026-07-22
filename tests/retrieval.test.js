import { describe, it, expect } from 'vitest';
import { mergeResults } from '../src/query/retrieval/merge.js';

describe('retrieval merge', () => {
  it('dedupes overlapping results and keeps the highest score', () => {
    const firstSearch = [
      { id: 'chunk-a', score: 0.72, text: 'A' },
      { id: 'chunk-b', score: 0.65, text: 'B' },
    ];
    const secondSearch = [
      { id: 'chunk-a', score: 0.91, text: 'A' },
      { id: 'chunk-c', score: 0.58, text: 'C' },
    ];

    const merged = mergeResults([firstSearch, secondSearch]);

    expect(merged).toHaveLength(3);
    expect(merged.find((item) => item.id === 'chunk-a').score).toBe(0.91);
    expect(merged.find((item) => item.id === 'chunk-b').score).toBe(0.65);
    expect(merged.find((item) => item.id === 'chunk-c').score).toBe(0.58);
  });
});
