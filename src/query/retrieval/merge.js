/**
 * Takes results from all query variants' searches, dedupes by chunkId, keeps the highest score per chunk.
 * @param {Object[][]} searchResultArrays 
 * @returns {Object[]}
 */
export function mergeResults(searchResultArrays) {
  const mergedMap = new Map();
  
  for (const results of searchResultArrays) {
    for (const chunk of results) {
      if (!mergedMap.has(chunk.id) || mergedMap.get(chunk.id).score < chunk.score) {
        mergedMap.set(chunk.id, chunk);
      }
    }
  }
  
  return Array.from(mergedMap.values());
}