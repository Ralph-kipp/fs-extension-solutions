import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect, vi } from 'vitest'
import BlogForm from '../src/components/BlogForm'

test('<BlogForm /> calls createBlog with the right details when a new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  await user.type(screen.getByLabelText('title'), 'Testing forms')
  await user.type(screen.getByLabelText('author'), 'Matti Luukkainen')
  await user.type(screen.getByLabelText('URL'), 'http://example.com')
  await user.click(screen.getByText('create'))

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'Testing forms',
    author: 'Matti Luukkainen',
    url: 'http://example.com'
  })
})

test('<BlogForm /> clears the fields after a blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByLabelText('title')
  const authorInput = screen.getByLabelText('author')
  const urlInput = screen.getByLabelText('URL')

  await user.type(titleInput, 'Testing forms')
  await user.type(authorInput, 'Matti Luukkainen')
  await user.type(urlInput, 'http://example.com')
  await user.click(screen.getByText('create'))

  expect(titleInput).toHaveValue('')
  expect(authorInput).toHaveValue('')
  expect(urlInput).toHaveValue('')
})
