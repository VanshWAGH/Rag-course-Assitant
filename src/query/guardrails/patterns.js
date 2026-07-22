export const piiPatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email pattern
];

export const systemPromptLeakPatterns = [
  "ignore all previous instructions",
  "system prompt",
  "you are a helpful assistant",
];

export const BLOCKED_OUTPUT_MESSAGE =
  '[Response blocked due to policy violation.]';
