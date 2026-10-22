import { Link } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'

const NotFound = () => (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h4" component="h2" gutterBottom>
      Page not found
    </Typography>
    <Typography sx={{ mb: 3 }}>Sorry, the page you are looking for does not exist.</Typography>
    <Button variant="contained" component={Link} to="/">
      back to the blog list
    </Button>
  </Box>
)

export default NotFound
