import { useState } from 'react'

const Blog = ({ blog, handleLike, handleDelete, user }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const showDelete = user && blog.user && user.username === blog.user.username

  return (
    <div>
      {blog.title} {blog.author}
      <button onClick={toggleVisibility}>{visible ? 'hide' : 'view'}</button>
      {visible && (
        <div>
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}
            <button onClick={() => handleLike(blog)}>like</button>
          </div>
          <div>{blog.user ? blog.user.name : null}</div>
          {showDelete && (
            <div>
              <button onClick={() => handleDelete(blog)}>delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
