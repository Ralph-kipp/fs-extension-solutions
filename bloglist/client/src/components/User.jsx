import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material'

const User = ({ user }) => (
  <div>
    <Typography variant="h4" component="h2" sx={{ mt: 3, mb: 1 }}>
      {user.name}
    </Typography>
    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
      added blogs
    </Typography>
    <Paper variant="outlined">
      <List dense disablePadding>
        {user.blogs.map((blog, i) => (
          <ListItem key={blog.id} divider={i < user.blogs.length - 1}>
            <ListItemText primary={blog.title} />
          </ListItem>
        ))}
      </List>
    </Paper>
  </div>
)

export default User
