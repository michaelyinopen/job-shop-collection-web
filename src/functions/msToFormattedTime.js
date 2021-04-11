function replaceNaN(num) {
  if (isNaN(num)) { return 0 }
  return num;
}

// note milliseconds are truncated
// note > 24 hurs will show as 25+ hour, therefore the result is not a time
export default function msToFormattedTime(duration) {
  var seconds = replaceNaN(Math.floor((duration / 1000) % 60));
  var minutes = replaceNaN(Math.floor((duration / (1000 * 60)) % 60));
  var hours = replaceNaN(Math.floor((duration / (1000 * 60 * 60))));

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return `${hours}:${minutes}:${seconds}`;
}