import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { test, expect, vi, beforeEach } from 'vitest'
import Users from '../src/components/Users'
import userService from '../src/services/users'
import { useAllUsersStore } from '../src/stores/allUsersStore'

vi.mock('../src/services/users', () => ({ default: { getAll: vi.fn() } }))

const users = [
  {
    id: 'u1',
    name: 'Blogging Betty',
    blogs: [
      { id: 'b1', title: 'One' },
      { id: 'b2', title: 'Two' }
    ]
  },
  { id: 'u2', name: 'Lurking Larry', blogs: [] }
]

beforeEach(() => {
  userService.getAll.mockResolvedValue(users)
  useAllUsersStore.setState({ users, loaded: true })
})

test('renders a row per user with a name link and the blog count', async () => {
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  )

  expect(screen.getByRole('heading', { name: 'users' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Blogging Betty' })).toHaveAttribute('href', '/users/u1')
  expect(screen.getByRole('row', { name: /blogging betty/i })).toHaveTextContent('2')
  expect(screen.getByRole('row', { name: /lurking larry/i })).toHaveTextContent('0')
  expect(await screen.findByRole('link', { name: 'Lurking Larry' })).toBeInTheDocument()
  expect(userService.getAll).toHaveBeenCalled() // fetched again on mount
})
