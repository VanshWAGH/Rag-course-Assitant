import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { withRetry } from '../utils/retry.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

/**
 * Generate text using the Gemini API.
 * @param {string} prompt 
 * @param {Object} options 
 * @returns {Promise<string>}
 */
export async function generateText(prompt, { model = 'gemini-2.5-flash', systemInstruction = undefined, generationConfig = {} } = {}) {
  return withRetry(async () => {
    const aiModel = genAI.getGenerativeModel({ model, systemInstruction });
    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });
    return result.response.text();
  });
}

/**
 * Embed a single piece of text.
 * @param {string} text 
 * @param {Object} options 
 * @returns {Promise<number[]>}
 */
export async function embedText(text, { model = 'gemini-embedding-2' } = {}) {
  return withRetry(async () => {
    const aiModel = genAI.getGenerativeModel({ model });
    const result = await aiModel.embedContent(text);
    return result.embedding.values;
  });
}

/**
 * Batch embed texts.
 * @param {string[]} texts 
 * @param {Object} options 
 * @returns {Promise<number[][]>}
 */
export async function embedBatchBase(texts, { model = 'gemini-embedding-2' } = {}) {
  return withRetry(async () => {
    const aiModel = genAI.getGenerativeModel({ model });
    const requests = texts.map(text => ({ content: { role: 'user', parts: [{ text }] } }));
    const result = await aiModel.batchEmbedContents({ requests });
    return result.embeddings.map(e => e.values);
  });
}