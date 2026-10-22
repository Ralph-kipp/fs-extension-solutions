import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { test, expect, vi, beforeEach } from 'vitest'
import App from '../src/App'
import { useBlogStore } from '../src/stores/blogStore'

vi.mock('../src/services/blogs', () => ({
  default: { getAll: () => Promise.resolve([]), setToken: () => {} }
}))

beforeEach(() => {
  useBlogStore.setState({ blogs: [], loaded: false })
})

test('renders the login form on /login when no user is logged in', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  )

  expect(screen.getByText('log in to application')).toBeInTheDocument()
})
