import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
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
      <Typography variant="h4" component="h2">
        users
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>name</TableCell>
            <TableCell>blogs created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </TableCell>
              <TableCell>{user.blogs.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Users
