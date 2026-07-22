import {
  systemPromptLeakPatterns,
  piiPatterns,
  BLOCKED_OUTPUT_MESSAGE,
} from './patterns.js';

/**
 * Scans the generated answer for leaked system-prompt content, PII/ID leakage, etc.
 * @param {string} answer
 * @returns {{ valid: boolean, redactedAnswer?: string, reason?: string }}
 */
export function checkOutput(answer) {
  let redacted = answer;
  let hasViolation = false;
  let violationReason = '';

  for (const leakPattern of systemPromptLeakPatterns) {
    if (answer.toLowerCase().includes(leakPattern.toLowerCase())) {
      return {
        valid: false,
        reason: 'System prompt leakage detected.',
        redactedAnswer: BLOCKED_OUTPUT_MESSAGE,
      };
    }
  }

  for (const pattern of piiPatterns) {
    pattern.lastIndex = 0;
    const replaced = redacted.replace(pattern, '[REDACTED PII]');
    if (replaced !== redacted) {
      redacted = replaced;
      hasViolation = true;
      violationReason = 'PII detected in output. Redacted.';
    }
  }

  return {
    valid: !hasViolation,
    redactedAnswer: redacted,
    reason: violationReason,
  };
}
