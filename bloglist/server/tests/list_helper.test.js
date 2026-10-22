const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

// 4.3
test('dummy returns one', () => {
  const result = listHelper.dummy([])
  assert.strictEqual(result, 1)
})

// 4.4
describe('totalLikes', () => {
  test('of empty list is zero', () => {
    assert.strictEqual(listHelper.totalLikes([]), 0)
  })

  test('of one blog equals its likes', () => {
    assert.strictEqual(listHelper.totalLikes([blogs[0]]), 7)
  })

  test('of all blogs is 36', () => {
    assert.strictEqual(listHelper.totalLikes(blogs), 36)
  })
})

// 4.5
describe('favoriteBlog', () => {
  test('is the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    // Canonical string reduction has 12 likes — the highest
    assert.deepStrictEqual(result, {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0
    })
  })
})

// 4.6
describe('mostBlogs', () => {
  test('returns the author with the most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    // Robert C. Martin has 3 blogs — the most
    assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 })
  })

  test('returns null for empty list', () => {
    assert.strictEqual(listHelper.mostBlogs([]), null)
  })
})

// 4.7
describe('mostLikes', () => {
  test('returns the author with most total likes', () => {
    const result = listHelper.mostLikes(blogs)
    // Edsger W. Dijkstra: 5 + 12 = 17 likes total
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 })
  })

  test('returns null for empty list', () => {
    assert.strictEqual(listHelper.mostLikes([]), null)
  })
})