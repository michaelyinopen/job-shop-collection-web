function parseIntEnsureNumber(str) {
  var parsed = parseInt(str, 10);
  if (isNaN(parsed)) { return 0 }
  return parsed;
}

export default function formattedTimeToMs(str) {
  const sections = str.split(":");
  const hoursString = sections[0];
  const minutesString = sections[1];
  const secondsString = sections[2];

  const hoursInMilliseconds = parseIntEnsureNumber(hoursString) * 1000 * 60 * 60;
  const minutesInMilliseconds = parseIntEnsureNumber(minutesString) * 1000 * 60;
  const secondsInMilliseconds = parseIntEnsureNumber(secondsString) * 1000;

  return hoursInMilliseconds + minutesInMilliseconds + secondsInMilliseconds;
}