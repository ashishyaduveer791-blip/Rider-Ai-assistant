/**
 * Generates formatted recent time strings (e.g. '4:15 PM')
 * @param {number} minutesAgo 
 * @returns {string} Formatted 12-hour time string
 */
export function getRecentTimeString(minutesAgo = 0) {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
