import { render } from '@testing-library/react'
// import { screen } from '@testing-library/react'
import { App } from './App'

// test('renders learn react link', () => {
//   render(<App />)
//   const linkElement = screen.getByText(/learn react/i)
//   expect(linkElement).toBeInTheDocument()
// })

test('can render App', () => {
  render(<App />)
})