function replaceNaN(num) {
  if (isNaN(num)) { return 0 }
  return num
}

// note milliseconds are truncated
// note > 24 hurs will show as 25+ hour, therefore the result is not a time
export function msToFormattedTime(duration) {
  const seconds = replaceNaN(Math.floor((duration / 1000) % 60))
    .toString()
    .padStart(2, '0')
  const minutes = replaceNaN(Math.floor((duration / (1000 * 60)) % 60))
    .toString()
    .padStart(2, '0')
  const hours = replaceNaN(Math.floor((duration / (1000 * 60 * 60))))
    .toString()
    .padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}