import { render, screen } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import BlogView from './BlogView'

const blog = {
  id: '1',
  title: 'Testing',
  author: 'Ann',
  url: 'http://x.com',
  likes: 5,
  user: { username: 'ralph', name: 'Ralph' }
}
const renderView = (user) => render(<BlogView blog={blog} user={user} handleLike={vi.fn()} handleDelete={vi.fn()} />)

test('unauthenticated user sees info and likes, but no buttons', () => {
  renderView(null)
  expect(screen.getByText('Testing Ann')).toBeDefined()
  expect(screen.getByText(/likes 5/)).toBeDefined()
  expect(screen.queryByRole('button')).toBeNull()
})

test('logged-in non-creator sees only the like button', () => {
  renderView({ username: 'other', name: 'Other' })
  expect(screen.getByRole('button', { name: 'like' })).toBeDefined()
  expect(screen.queryByRole('button', { name: 'delete' })).toBeNull()
})

test('creator sees like and delete buttons', () => {
  renderView({ username: 'ralph', name: 'Ralph' })
  expect(screen.getByRole('button', { name: 'like' })).toBeDefined()
  expect(screen.getByRole('button', { name: 'delete' })).toBeDefined()
})
