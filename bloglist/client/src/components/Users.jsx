import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Typography,
  Paper,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { useAllUsersStore } from '../stores/allUsersStore'

const Users = () => {
  const users = useAllUsersStore((state) => state.users)
  const initializeUsers = useAllUsersStore((state) => state.initializeUsers)

  // fetch again on mount so the blog counts are fresh after blogs were added
  useEffect(() => {
    initializeUsers().catch(() => {})
  }, [initializeUsers])

  return (
    <div>
      <Typography variant="h4" component="h2" sx={{ mt: 3, mb: 2 }}>
        users
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>blogs created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <MuiLink component={Link} to={`/users/${user.id}`} underline="hover">
                    {user.name}
                  </MuiLink>
                </TableCell>
                <TableCell>{user.blogs.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default Users
