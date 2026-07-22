import { generateText } from '../services/geminiClient.js';
import { msToTimeString } from '../utils/timeUtils.js';

/**
 * Takes retrieved chunks + original question, builds the prompt, calls geminiClient.
 * @param {string} question 
 * @param {Object[]} chunks 
 * @returns {Promise<string>}
 */
export async function generateAnswer(question, chunks) {
  if (chunks.length === 0) {
    return "I don't know, there is no relevant context available to answer this question.";
  }

  const contextString = chunks.map((c, i) => {
    const timeStr = msToTimeString(c.startMs || 0);
    // Include module and class in the source tag
    return `[Source: ${c.moduleName} - ${c.className} - hh:mm:ss: ${timeStr}]\n${c.text}`;
  }).join('\n\n---\n\n');

  const prompt = `
You are an advanced teaching assistant for a video course.
Answer the user's question using ONLY the provided context.
If the answer is not in the context, say "I don't have enough information to answer that."

CRITICAL: You MUST cite your sources. For every fact you use, append a citation in this EXACT format:
[Module Name - Class Name - hh:mm:ss]
Example: React Native is faster than Expo [module 1 - 01_what-is-mobile-development_epm - 00:05:20].

Context:
${contextString}

Question: ${question}
`;

  const answer = await generateText(prompt, { model: 'gemini-2.5-flash' });
  return answer;
}