/**
 * Converts SRT time format (00:01:23,450) and VTT time format (00:01:23.450) into milliseconds.
 * @param {string} timeString 
 * @returns {number} milliseconds
 */
export function timeStringToMs(timeString) {
  if (!timeString) return 0;
  
  // Replace comma with dot to unify SRT and VTT formats
  const unified = timeString.replace(',', '.');
  const match = unified.match(/(?:(\d{2,}):)?(\d{2}):(\d{2})(?:\.(\d{3}))?/);
  
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const milliseconds = parseInt(match[4] || '0', 10);
  
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
}

/**
 * Converts milliseconds back into a clean hh:mm:ss string.
 * Uses mm:ss if less than an hour.
 * @param {number} ms 
 * @returns {string} 
 */
export function msToTimeString(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (num) => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}