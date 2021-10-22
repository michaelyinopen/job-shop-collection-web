import { backwardCompose } from './backwardCompose'

const numToStringQuestion = (a: number) => a.toString() + '?'
const stringExclamation = (b: string) => b + '!'
const stringToArrayWithDuplicate = (c: string) => [c, c]

test('Can backward compose two functions', () => {
  const numToQuestionExclamation = backwardCompose(numToStringQuestion, stringExclamation)
  const actual = numToQuestionExclamation(1)
  expect(actual).toEqual('1?!')
})

test('Can backward compose three functions', () => {
  const numToQuestionExclamationDuplicate = backwardCompose(
    numToStringQuestion,
    stringExclamation,
    stringToArrayWithDuplicate
  )
  const actual = numToQuestionExclamationDuplicate(1)
  expect(actual).toEqual(['1?!', '1?!'])
})