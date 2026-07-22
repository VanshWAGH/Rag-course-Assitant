import { logger } from '../services/logger.js';
import { checkReject, checkMask } from './guardrails/inputGuardrails.js';
import { checkOutput } from './guardrails/outputGuardrails.js';
import { vectorSearch } from './retrieval/vectorSearch.js';
import { mergeResults } from './retrieval/merge.js';
import { rerank } from './retrieval/rerank.js';
import { generateAnswer } from './answer.js';
import { judgeAnswer } from './judge.js';
import { rewriteForRetrieval } from './translation/index.js';

const JUDGE_SCORE_THRESHOLD = 6;
const MAX_CORRECTIVE_RETRIES = 2;

/**
 * Orchestrates the whole ask flow.
 * @param {string} rawQuestion 
 */
export async function run(rawQuestion) {
  logger.step('Guardrails', 'Checking input guardrails...');
  const rejectCheck = await checkReject(rawQuestion);
  
  if (rejectCheck.reject) {
    logger.warn(`Query rejected: ${rejectCheck.reason}`);
    return `Query rejected: ${rejectCheck.reason}`;
  }
  
  let question = checkMask(rawQuestion);
  if (question !== rawQuestion) {
    logger.info('Query was masked for PII.');
  }

  let attempt = 0;
  let currentQueries = [question];
  let bestAttempt = null;

  while (attempt <= MAX_CORRECTIVE_RETRIES) {
    if (attempt > 0) {
      logger.step('Corrective Loop', `Attempt ${attempt}/${MAX_CORRECTIVE_RETRIES}. Rewriting query...`);
      const rewritten = await rewriteForRetrieval(question);
      logger.info(`Rewritten query: ${rewritten}`);
      currentQueries = [question, rewritten]; // use both original and rewritten for retrieval
    } else {
      logger.step('Corrective Loop', 'Attempt 0 (Initial)');
    }

    // 1. Retrieval
    logger.step('Retrieval', `Searching vectors for ${currentQueries.length} query variant(s)...`);
    const searchPromises = currentQueries.map(q => vectorSearch(q, { limit: 10 }));
    const searchResultsArrays = await Promise.all(searchPromises);
    
    // 2. Merge
    const mergedCandidates = mergeResults(searchResultsArrays);
    logger.info(`Merged down to ${mergedCandidates.length} unique candidates.`);

    // 3. Rerank
    logger.step('Rerank', 'Reranking candidates with Gemini...');
    const topCandidates = await rerank(question, mergedCandidates, 5);

    // 4. Answer
    logger.step('Answer', 'Generating answer from top candidates...');
    const answer = await generateAnswer(question, topCandidates);

    // 5. Output Guardrails
    const outCheck = checkOutput(answer);
    let finalAnswer = answer;
    if (!outCheck.valid) {
      logger.warn(`Output Guardrail Triggered: ${outCheck.reason}`);
      finalAnswer = outCheck.redactedAnswer ?? answer;
    }

    // 6. Judge
    logger.step('Judge', 'Evaluating answer quality...');
    const score = await judgeAnswer(question, topCandidates, finalAnswer);
    logger.info(`Judge Score: ${score}/10`);

    const attemptData = { score, answer: finalAnswer, candidates: topCandidates };
    if (!bestAttempt || score > bestAttempt.score) {
      bestAttempt = attemptData;
    }

    if (score >= JUDGE_SCORE_THRESHOLD) {
      logger.success('Answer meets quality threshold.');
      return finalAnswer;
    }

    attempt++;
  }

  logger.warn('Exhausted corrective retries. Returning best attempt with low confidence flag.');
  return `[Low Confidence Answer] ${bestAttempt.answer}`;
}
