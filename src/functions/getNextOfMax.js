export default function getNextOfMax(array) {
  if (array.length === 0)
    return 1;
  return Math.max.apply(Math, array) + 1;
}