/**
 * Rough token/word count estimator. (1 token ~= 0.75 words, or 1 word ~= 1.33 tokens)
 * @param {string} text 
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.33);
}

/**
 * Strips HTML-ish tags VTT sometimes embeds (<c>, <v Speaker>), 
 * collapses whitespace, strips music/sound annotations like [Music].
 * @param {string} text 
 * @returns {string} Cleaned text
 */
export function cleanText(text) {
  if (!text) return '';
  return text
    // Strip VTT tags like <v Speaker Name>, </v>, <c>, </c>
    .replace(/<[^>]+>/g, '')
    // Strip annotations like [Music], (Applause)
    .replace(/\[.*?\]|\(.*?\)/g, '')
    // Replace multiple spaces/newlines with a single space
    .replace(/\s+/g, ' ')
    .trim();
}