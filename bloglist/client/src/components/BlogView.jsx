import { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link as MuiLink
} from '@mui/material'

const BlogView = ({ blog, user, handleLike, handleDelete, handleComment }) => {
  const [comment, setComment] = useState('')

  if (!blog) return null // blogs not loaded yet (e.g. after a page reload)

  const comments = blog.comments ?? [] // older blogs may not have the field

  const addComment = async (event) => {
    event.preventDefault()
    if (comment.trim() === '') return
    const saved = await handleComment(blog, comment)
    if (saved) setComment('')
  }

  const isCreator = user && blog.user && blog.user.username === user.username

  return (
    <Card style={{ marginTop: 20 }}>
      <CardContent>
        <Typography variant="h4">
          {blog.title} {blog.author}
        </Typography>
        <Typography>
          <MuiLink href={blog.url}>{blog.url}</MuiLink>
        </Typography>
        <Typography>likes {blog.likes}</Typography>
        {/* Rendered unguarded on purpose (exercise 9): a blog without a user throws here,
            so the ErrorBoundary in App.jsx catches it */}
        <Typography color="text.secondary">added by {blog.user.name}</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          comments
        </Typography>
        <form onSubmit={addComment}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="comment"
              size="small"
              fullWidth
              value={comment}
              onChange={({ target }) => setComment(target.value)}
            />
            <Button type="submit" variant="contained" sx={{ flexShrink: 0 }}>
              add comment
            </Button>
          </Stack>
        </form>
        {comments.length === 0 ? (
          <Typography color="text.secondary">no comments yet</Typography>
        ) : (
          <List dense disablePadding>
            {comments.map((c, i) => (
              <ListItem key={i} divider={i < comments.length - 1} disableGutters>
                <ListItemText primary={c} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      {user && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button variant="contained" onClick={() => handleLike(blog)}>
            like
          </Button>
          {isCreator && (
            <Button color="error" onClick={() => handleDelete(blog)}>
              delete
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  )
}

export default BlogView
