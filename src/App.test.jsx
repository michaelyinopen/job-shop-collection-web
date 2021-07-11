import { render } from '@testing-library/react'
// import { screen } from '@testing-library/react'
import { App } from './App'

// test('renders learn react link', () => {
//   render(<App />)
//   const linkElement = screen.getByText(/learn react/i)
//   expect(linkElement).toBeInTheDocument()
// })

test('can render App', () => {
  // disable console.error, because MUI CardMedia has error unstable_flushDiscreteUpdates
  // and clutters the console
  const originalError = console.error
  console.error = jest.fn()

  render(<App />)

  
  console.error = originalError
})