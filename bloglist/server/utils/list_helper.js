const _ = require('lodash')

// 4.3 — always returns 1, used to verify test setup works
const dummy = (blogs) => {
  return 1
}

// 4.4 — sum of all likes across every blog
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

// 4.5 — the single blog object with the most likes
const favoriteBlog = (blogs) => {
  return _.maxBy(blogs, 'likes')
}

// 4.6 — the author who has written the most blogs
// Returns: { author: 'Robert C. Martin', blogs: 3 }
const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  // Group into buckets: { 'Author Name': [blog, blog, ...], ... }
  const grouped = _.groupBy(blogs, 'author')

  // Convert to array: [{ author: 'Name', blogs: 3 }, ...]
  const authorCounts = Object.keys(grouped).map(author => ({
    author: author,
    blogs: grouped[author].length
  }))

  // Return the object with the highest blogs count
  return _.maxBy(authorCounts, 'blogs')
}

// 4.7 — the author whose blogs have the most total likes combined
// Returns: { author: 'Edsger W. Dijkstra', likes: 17 }
const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  // Group into buckets by author
  const grouped = _.groupBy(blogs, 'author')

  // Sum up likes per author
  const authorLikes = Object.keys(grouped).map(author => ({
    author: author,
    likes: grouped[author].reduce((sum, blog) => sum + blog.likes, 0)
  }))

  // Return the author with the highest total likes
  return _.maxBy(authorLikes, 'likes')
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }