import { create } from 'zustand'
import blogService from '../services/blogs'

export const useBlogStore = create((set) => ({
  blogs: [],
  loaded: false, // true once the first fetch has finished, also when it failed
  initializeBlogs: async () => {
    try {
      const blogs = await blogService.getAll()
      set({ blogs })
    } finally {
      set({ loaded: true })
    }
  },
  createBlog: async (blogObject) => {
    const newBlog = await blogService.create(blogObject)
    // the POST response has an unpopulated user, so reload the list to get every blog with its user filled in
    const blogs = await blogService.getAll()
    set({ blogs })
    return newBlog
  },
  likeBlog: async (blog) => {
    const updatedBlog = {
      user: blog.user ? blog.user.id : undefined,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }
    const returnedBlog = await blogService.update(blog.id, updatedBlog)
    // the PUT response may not populate user, so keep the user we already have
    set((state) => ({
      blogs: state.blogs.map((b) => (b.id === blog.id ? { ...returnedBlog, user: blog.user } : b))
    }))
  },
  addComment: async (id, comment) => {
    const returnedBlog = await blogService.addComment(id, comment)
    // keep the user we already have, only take the comments from the server
    set((state) => ({
      blogs: state.blogs.map((b) => (b.id === id ? { ...b, comments: returnedBlog.comments } : b))
    }))
  },
  deleteBlog: async (id) => {
    await blogService.remove(id)
    set((state) => ({ blogs: state.blogs.filter((b) => b.id !== id) }))
  }
}))
