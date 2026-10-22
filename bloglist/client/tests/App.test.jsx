import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { test, expect, vi } from 'vitest'
import App from '../src/App'

vi.mock('../src/services/blogs', () => ({
  default: { getAll: () => Promise.resolve([]), setToken: () => {} }
}))

test('renders the login form on /login when no user is logged in', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  )

  expect(screen.getByText('log in to application')).toBeInTheDocument()
})
