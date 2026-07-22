import { generateText } from '../../services/geminiClient.js';
import { logger } from '../../services/logger.js';

/**
 * Sends the merged candidate pool + original question to Gemini to score each candidate 0-10.
 * Sorts, returns top TOP_K (5).
 * @param {string} question 
 * @param {Object[]} candidates 
 * @param {number} topK 
 * @returns {Promise<Object[]>}
 */
export async function rerank(question, candidates, topK = 5) {
  if (candidates.length === 0) return [];
  
  // Create a numbered list of candidates to send to Gemini
  const candidatesContext = candidates.map((c, i) => 
    `--- CANDIDATE ${i} ---\n${c.text}\n-------------------`
  ).join('\n\n');

  const prompt = `You are a relevance judge. You will be provided with a user question and a list of candidate context chunks.
Score each candidate chunk from 0 to 10 based on how relevant it is for answering the question.
0 means completely irrelevant, 10 means highly relevant and sufficient.

Return your scores strictly in JSON format as an array of objects:
[{"index": 0, "score": 8, "reason": "..."}]

Question: "${question}"

Candidates:
${candidatesContext}
`;

  try {
    const res = await generateText(prompt, { 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const parsed = JSON.parse(res);
    
    // Attach scores
    const scoredCandidates = candidates.map((c, i) => {
      const scoreData = parsed.find(p => p.index === i);
      return {
        ...c,
        rerankScore: scoreData ? scoreData.score : 0,
        rerankReason: scoreData ? scoreData.reason : 'Failed to score'
      };
    });

    // Sort descending by rerankScore
    scoredCandidates.sort((a, b) => b.rerankScore - a.rerankScore);
    
    return scoredCandidates.slice(0, topK);
  } catch (error) {
    logger.warn('Rerank failed or parsing failed, falling back to original vector scores.');
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, topK);
  }
}