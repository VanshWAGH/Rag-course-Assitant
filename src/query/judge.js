import { generateText } from '../services/geminiClient.js';
import { logger } from '../services/logger.js';

/**
 * Evaluates the generated answer against the question and context.
 * @param {string} question 
 * @param {Object[]} chunks 
 * @param {string} answer 
 * @returns {Promise<number>} Score from 0 to 10
 */
export async function judgeAnswer(question, chunks, answer) {
  if (chunks.length === 0) return 0;
  
  const contextStr = chunks.map(c => c.text).join('\n\n');
  
  const prompt = `You are an impartial judge evaluating a RAG system's answer.
You will be given the Question, the Context provided to the system, and the Generated Answer.
Score the Generated Answer from 0 to 10 based on:
1. Relevance to the Question.
2. Faithfulness to the Context (no hallucinations).
3. Proper citations.

Return your response strictly in JSON format: {"score": 8, "reason": "..."}

Question: "${question}"
Context: "${contextStr}"
Answer: "${answer}"
`;

  try {
    const res = await generateText(prompt, { 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" } 
    });
    const parsed = JSON.parse(res);
    return parsed.score || 0;
  } catch (error) {
    logger.warn('Judge failed or parsing failed, returning default score 5.');
    return 5;
  }
}