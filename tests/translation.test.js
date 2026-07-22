import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/services/geminiClient.js', () => ({
  generateText: vi.fn(),
}));

import { generateText } from '../src/services/geminiClient.js';
import {
  rewriteForRetrieval,
  buildQueryVariants,
} from '../src/query/translation/index.js';

describe('translation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls rewrite before building parallel query variants', async () => {
    generateText.mockResolvedValue('expanded expo sensor tutorial query');

    const variants = await buildQueryVariants('expo sensors');

    expect(generateText).toHaveBeenCalledTimes(1);
    expect(variants).toEqual([
      'expo sensors',
      'expanded expo sensor tutorial query',
    ]);
  });

  it('falls back to the original query when rewrite fails', async () => {
    generateText.mockRejectedValue(new Error('quota exceeded'));

    const rewritten = await rewriteForRetrieval('gyroscope basics');

    expect(rewritten).toBe('gyroscope basics');
  });
});
