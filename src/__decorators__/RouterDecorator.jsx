import { MemoryRouter } from "react-router"

export const RouterDecorator = ({ children }) => {
  return (
    <MemoryRouter>
      {children}
    </MemoryRouter>
  )
}