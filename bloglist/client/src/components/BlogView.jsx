import { Card, CardContent, CardActions, Typography, Button, Link as MuiLink } from '@mui/material'

const BlogView = ({ blog, user, handleLike, handleDelete }) => {
  if (!blog) return null                  // blogs not loaded yet (e.g. after a page reload)

  const isCreator = user && blog.user && blog.user.username === user.username

  return (
    <Card style={{ marginTop: 20 }}>
      <CardContent>
        <Typography variant="h4">{blog.title} {blog.author}</Typography>
        <Typography>
          <MuiLink href={blog.url}>{blog.url}</MuiLink>
        </Typography>
        <Typography>likes {blog.likes}</Typography>
        {/* Rendered unguarded on purpose (exercise 9): a blog without a user throws here,
            so the ErrorBoundary in App.jsx catches it */}
        <Typography color="text.secondary">added by {blog.user.name}</Typography>
      </CardContent>
      {user && (
        <CardActions>
          <Button variant="contained" onClick={() => handleLike(blog)}>like</Button>
          {isCreator && (
            <Button color="error" onClick={() => handleDelete(blog)}>delete</Button>
          )}
        </CardActions>
      )}
    </Card>
  )
}

export default BlogView
