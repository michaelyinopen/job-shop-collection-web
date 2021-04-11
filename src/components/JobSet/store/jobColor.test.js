import getNewColor from './jobColor';

const preDefiendColors = [
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#42d4f4',
  '#f032e6',
  '#bfef45',
  '#fabebe',
  '#469990',
  '#e6beff',
  '#9A6324',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#a9a9a9',
];

const preDefiendTextColors = [
  '#000000',
  '#000000',
  '#ffffff',
  '#000000',
  '#ffffff',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#ffffff',
  '#000000',
  '#ffffff',
  '#000000',
  '#000000',
  '#000000',
  '#ffffff',
  '#000000',
];

test("Can get first color", () => {
  const [resultColor] = getNewColor();
  expect(resultColor).toEqual(preDefiendColors[0]);
});

test("Can get second color", () => {
  const currentColor = preDefiendColors[0];
  const excludeColors = [currentColor];
  const [resultColor] = getNewColor(excludeColors, currentColor);
  expect(resultColor).toEqual(preDefiendColors[1]);
});

test("Can get second color", () => {
  const currentColor = preDefiendColors[0];
  const excludeColors = [currentColor];
  const [resultColor1] = getNewColor(excludeColors, currentColor);
  const [resultColor2] = getNewColor(excludeColors, currentColor);
  expect(resultColor1).toEqual(preDefiendColors[1]);
  expect(resultColor2).toEqual(preDefiendColors[1]);
});

test("All pre-defined colors", () => {
  expect.assertions(preDefiendColors.length);
  let currentColor = undefined;
  let excludeColors = [];
  for (let i = 0; i < preDefiendColors.length; ++i) {
    const [currentResult] = getNewColor(excludeColors, currentColor);
    currentColor = currentResult;
    excludeColors.push(currentResult);
    expect(currentResult).toEqual(preDefiendColors[i]);
  }
});

test("All pre-defined text colors", () => {
  let currentColor = undefined;
  let excludeColors = [];
  let textColorResults = [];
  for (let i = 0; i < preDefiendColors.length; ++i) {
    const [currentResult, currentTextColor] = getNewColor(excludeColors, currentColor);
    currentColor = currentResult;
    excludeColors.push(currentResult);
    textColorResults.push(currentTextColor);
  }
  expect(textColorResults).toEqual(preDefiendTextColors);
});

test("Select color after skipping colors", () => {
  const currentColor = preDefiendColors[5];
  const excludeColors = [
    preDefiendColors[0],
    preDefiendColors[3],
    preDefiendColors[4],
    preDefiendColors[5]
  ];
  const [resultColor] = getNewColor(excludeColors, currentColor);
  expect(resultColor).toEqual(preDefiendColors[6]);
});

test("Select a skipped color", () => {
  const currentColor = preDefiendColors[0];
  const excludeColors = [
    preDefiendColors[0],
    preDefiendColors[3],
    preDefiendColors[4],
    preDefiendColors[5]
  ];
  const [resultColor] = getNewColor(excludeColors, currentColor);
  expect(resultColor).toEqual(preDefiendColors[1]);
});

test("Random after all pre-defined colors", () => {
  let currentColor = preDefiendColors[preDefiendColors.length - 1];
  const excludeColors = [...preDefiendColors];
  const [resultColor] = getNewColor(excludeColors, currentColor);
  expect(preDefiendColors).not.toContain(resultColor);
  expect(resultColor).toMatch(new RegExp('^#[0123456789abcdef]{6}$')); // start with #, then 6 characters of 0-f
});

test("More random colors after all pre-defined colors", () => {
  let currentColor = preDefiendColors[preDefiendColors.length - 1];
  const excludeColors = [...preDefiendColors];
  const [randomColor1] = getNewColor(excludeColors, currentColor);
  excludeColors.push(randomColor1);
  currentColor = randomColor1;
  const [resultColor] = getNewColor(excludeColors, currentColor);
  expect(preDefiendColors).not.toContain(resultColor);
  expect(randomColor1).not.toEqual(resultColor);
  expect(resultColor).toMatch(new RegExp('^#[0123456789abcdef]{6}$')); // start with #, then 6 characters of 0-f
});