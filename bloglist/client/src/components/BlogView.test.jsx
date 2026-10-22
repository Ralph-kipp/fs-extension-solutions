import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
const renderView = (user, props = {}) =>
  render(
    <BlogView blog={blog} user={user} handleLike={vi.fn()} handleDelete={vi.fn()} handleComment={vi.fn()} {...props} />
  )

test('unauthenticated user sees info and likes, but no like or delete buttons', () => {
  renderView(null)
  expect(screen.getByText('Testing Ann')).toBeDefined()
  expect(screen.getByText(/likes 5/)).toBeDefined()
  expect(screen.queryByRole('button', { name: 'like' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'delete' })).toBeNull()
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

test('renders the existing comments, and an empty list when the field is missing', () => {
  renderView(null, { blog: { ...blog, comments: ['first comment', 'second comment'] } })
  expect(screen.getByText('first comment')).toBeDefined()
  expect(screen.getByText('second comment')).toBeDefined()
})

test('a blog without a comments field renders without comments', () => {
  renderView(null)
  expect(screen.getByRole('heading', { name: 'comments' })).toBeDefined()
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

test('submitting the comment form calls the handler with the text and clears the input', async () => {
  const handleComment = vi.fn().mockResolvedValue(true)
  renderView(null, { handleComment })

  const input = screen.getByRole('textbox', { name: /comment/i })
  await userEvent.type(input, 'nice post')
  await userEvent.click(screen.getByRole('button', { name: 'add comment' }))

  expect(handleComment).toHaveBeenCalledWith(blog, 'nice post')
  expect(input).toHaveValue('')
})

test('the input is kept when saving the comment failed, and empty input is ignored', async () => {
  const handleComment = vi.fn().mockResolvedValue(false)
  renderView(null, { handleComment })

  await userEvent.click(screen.getByRole('button', { name: 'add comment' }))
  expect(handleComment).not.toHaveBeenCalled()

  const input = screen.getByRole('textbox', { name: /comment/i })
  await userEvent.type(input, 'keep me')
  await userEvent.click(screen.getByRole('button', { name: 'add comment' }))
  expect(input).toHaveValue('keep me')
})
