import { describe, it, expect } from 'vitest';
import { checkMask } from '../src/query/guardrails/inputGuardrails.js';
import { checkOutput } from '../src/query/guardrails/outputGuardrails.js';
import { BLOCKED_OUTPUT_MESSAGE } from '../src/query/guardrails/patterns.js';

describe('guardrails', () => {
  it('masks known PII strings in queries', () => {
    const masked = checkMask('Contact me at test@example.com or SSN 123-45-6789');

    expect(masked).not.toContain('test@example.com');
    expect(masked).not.toContain('123-45-6789');
    expect(masked).toContain('***');
  });

  it('redacts PII in generated answers', () => {
    const result = checkOutput('Reach out at user@domain.com for help.');

    expect(result.valid).toBe(false);
    expect(result.redactedAnswer).toContain('[REDACTED PII]');
    expect(result.redactedAnswer).not.toContain('user@domain.com');
  });

  it('blocks answers that leak system prompt content', () => {
    const result = checkOutput('As instructed in the system prompt, I will help.');

    expect(result.valid).toBe(false);
    expect(result.redactedAnswer).toBe(BLOCKED_OUTPUT_MESSAGE);
  });
});
