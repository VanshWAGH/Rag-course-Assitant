/**
 * A wrapper function that retries a failing async call with exponential backoff.
 * @param {Function} fn - The async function to execute
 * @param {Object} options - { retries: number, baseDelayMs: number }
 * @returns {Promise<any>}
 */
export async function withRetry(fn, { retries = 3, baseDelayMs = 2000 } = {}) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      // Specifically target 429 Too Many Requests (Rate Limits)
      const isRateLimit = error.status === 429 || 
                          (error.message && error.message.includes('429')) ||
                          (error.message && error.message.includes('quota'));
                          
      if (!isRateLimit && attempt >= retries) {
        throw error; // Throw immediately if not rate limit or out of retries
      }
      
      if (attempt >= retries) {
        throw error;
      }
      
      let delay = baseDelayMs * Math.pow(2, attempt - 1) + (Math.random() * 500);
      
      if (isRateLimit) {
        // Free tier requires a full minute reset for quota exhausted
        delay = 62000; 
        console.warn(`[Retry] Rate limit hit. Waiting 62 seconds before retry ${attempt}/${retries}...`);
      } else {
        console.warn(`[Retry] Attempt ${attempt}/${retries} failed. Retrying in ${Math.round(delay)}ms...`);
      }
      
      await new Promise(res => setTimeout(res, delay));
    }
  }
}