import { test, expect, vi, beforeEach } from 'vitest'
import blogService from '../src/services/blogs'
import { useBlogStore } from '../src/stores/blogStore'

vi.mock('../src/services/blogs', () => ({
  default: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), addComment: vi.fn() }
}))

const user = { id: 'u1', username: 'root', name: 'Root' }
const blog = { id: 'b1', title: 'T', author: 'A', url: 'http://x', likes: 1, user }

beforeEach(() => {
  vi.clearAllMocks()
  useBlogStore.setState({ blogs: [], loaded: false })
})

test('initializeBlogs sets loaded even when the fetch fails', async () => {
  blogService.getAll.mockRejectedValue(new Error('down'))
  await expect(useBlogStore.getState().initializeBlogs()).rejects.toThrow()
  expect(useBlogStore.getState().loaded).toBe(true)
})

test('createBlog reloads the list so users are populated', async () => {
  blogService.create.mockResolvedValue({ ...blog, user: 'u1' })
  blogService.getAll.mockResolvedValue([blog])
  await useBlogStore.getState().createBlog({ title: 'T' })
  expect(useBlogStore.getState().blogs[0].user).toEqual(user)
})

test('likeBlog adds one like and keeps the populated user', async () => {
  useBlogStore.setState({ blogs: [blog] })
  blogService.update.mockResolvedValue({ ...blog, likes: 2, user: 'u1' })
  await useBlogStore.getState().likeBlog(blog)
  expect(useBlogStore.getState().blogs[0]).toMatchObject({ likes: 2, user })
})

test('deleteBlog removes the blog from the list', async () => {
  useBlogStore.setState({ blogs: [blog] })
  blogService.remove.mockResolvedValue()
  await useBlogStore.getState().deleteBlog('b1')
  expect(useBlogStore.getState().blogs).toEqual([])
})

test('addComment updates the comments and keeps the populated user', async () => {
  useBlogStore.setState({ blogs: [blog] })
  blogService.addComment.mockResolvedValue({ ...blog, user: 'u1', comments: ['hello'] })
  await useBlogStore.getState().addComment('b1', 'hello')
  expect(blogService.addComment).toHaveBeenCalledWith('b1', 'hello')
  expect(useBlogStore.getState().blogs[0]).toMatchObject({ comments: ['hello'], user })
})

test('addComment throws on failure and leaves the blog unchanged', async () => {
  useBlogStore.setState({ blogs: [blog] })
  blogService.addComment.mockRejectedValue(new Error('500'))
  await expect(useBlogStore.getState().addComment('b1', 'hello')).rejects.toThrow()
  expect(useBlogStore.getState().blogs[0]).toEqual(blog)
})
