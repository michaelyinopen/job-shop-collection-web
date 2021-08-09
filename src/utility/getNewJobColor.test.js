import { getNewJobColor } from './getNewJobColor'

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
]

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
]

test("Can get first color", () => {
  const { color, textColor } = getNewJobColor()
  expect(color).toEqual(preDefiendColors[0])
  expect(textColor).toEqual(preDefiendTextColors[0])
})

test("Can get second color", () => {
  const currentColor = preDefiendColors[0]
  const excludeColors = [currentColor]
  const { color, textColor } = getNewJobColor(excludeColors, currentColor)
  const { color: color2, textColor: textColor2 } = getNewJobColor(excludeColors, currentColor)
  expect(color).toEqual(preDefiendColors[1])
  expect(textColor).toEqual(preDefiendTextColors[1])
  expect(color2).toEqual(preDefiendColors[1])
  expect(textColor2).toEqual(preDefiendTextColors[1])
})

test("Cycle through all pre-defined colors", () => {
  expect.assertions(preDefiendColors.length * 2 + 2)
  let currentColor = undefined
  let excludeColors = []
  for (let i = 0; i < preDefiendColors.length; ++i) {
    const { color, textColor } = getNewJobColor(excludeColors, currentColor)
    currentColor = color
    expect(color).toEqual(preDefiendColors[i])
    expect(textColor).toEqual(preDefiendTextColors[i])
  }
  // restart from beginning
  const { color, textColor } = getNewJobColor(excludeColors, currentColor)
  expect(color).toEqual(preDefiendColors[0])
  expect(textColor).toEqual(preDefiendTextColors[0])
})

test("Select color after skipping colors", () => {
  const currentColor = preDefiendColors[5]
  const excludeColors = [
    preDefiendColors[0],
    preDefiendColors[3],
    preDefiendColors[4],
    preDefiendColors[5]
  ]
  const { color, textColor } = getNewJobColor(excludeColors, currentColor)
  expect(color).toEqual(preDefiendColors[6])
  expect(textColor).toEqual(preDefiendTextColors[6])
})

test("Select a skipped color", () => {
  const currentColor = preDefiendColors[0]
  const excludeColors = [
    preDefiendColors[0],
    preDefiendColors[3],
    preDefiendColors[4],
    preDefiendColors[5]
  ];
  const { color, textColor } = getNewJobColor(excludeColors, currentColor)
  expect(color).toEqual(preDefiendColors[1])
  expect(textColor).toEqual(preDefiendTextColors[1])
})

test("Random after all pre-defined colors", () => {
  let currentColor = preDefiendColors[preDefiendColors.length - 1]
  const excludeColors = [...preDefiendColors]
  const { color } = getNewJobColor(excludeColors, currentColor)
  expect(preDefiendColors).not.toContain(color)
  expect(color).toMatch(new RegExp('^#[0123456789abcdef]{6}$')) // start with #, then 6 characters of 0-f
})

test("Cycle the last 4 remaining options and a random color", () => {
  // avoiding preDefiendColors[1, 3, 5, length-2]
  const usedColors = preDefiendColors
    .filter((c, index) => ![1, 3, 5, preDefiendColors.length - 2].includes(index))

  // A: current color is undefined, will return the [1] color
  let currentColor = undefined
  let excludeColors = usedColors
  let { color: colorA, textColor: textColorA } = getNewJobColor(excludeColors, currentColor)
  expect(colorA).toEqual(preDefiendColors[1])
  expect(textColorA).toEqual(preDefiendTextColors[1])

  // B: current color is [1], will return the [3] color
  currentColor = colorA
  excludeColors = [...usedColors, colorA]
  let { color: colorB, textColor: textColorB } = getNewJobColor(excludeColors, currentColor)
  expect(colorB).toEqual(preDefiendColors[3])
  expect(textColorB).toEqual(preDefiendTextColors[3])

  // C: current color is [3], will return the [5] color
  currentColor = colorB
  excludeColors = [...usedColors, colorB]
  let { color: colorC, textColor: textColorC } = getNewJobColor(excludeColors, currentColor)
  expect(colorC).toEqual(preDefiendColors[5])
  expect(textColorC).toEqual(preDefiendTextColors[5])

  // D: current color is [5], will return the [length-2] color
  currentColor = colorC
  excludeColors = [...usedColors, colorC]
  let { color: colorD, textColor: textColorD } = getNewJobColor(excludeColors, currentColor)
  expect(colorD).toEqual(preDefiendColors[preDefiendColors.length - 2])
  expect(textColorD).toEqual(preDefiendTextColors[preDefiendColors.length - 2])

  // E: current color is [length-2], will return a random color
  currentColor = colorD
  excludeColors = [...usedColors, colorD]
  let { color: colorE } = getNewJobColor(excludeColors, currentColor)
  expect(preDefiendColors).not.toContain(colorE)
  expect(colorE).toMatch(new RegExp('^#[0123456789abcdef]{6}$')) // start with #, then 6 characters of 0-f

  // F(≈ A): current color is a randomColor, will return the [1] color
  currentColor = colorE
  excludeColors = [...usedColors, colorE]
  let { color: colorF, textColor: textColorF } = getNewJobColor(excludeColors, currentColor)
  expect(colorF).toEqual(preDefiendColors[1])
  expect(textColorF).toEqual(preDefiendTextColors[1])
})