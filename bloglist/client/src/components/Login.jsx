import { TextField, Button } from '@mui/material'

const Login = ({ username, password, handleUsernameChange, handlePasswordChange, handleSubmit }) => (
  <div>
    <h2>log in to application</h2>
    <form onSubmit={handleSubmit}>
      <div>
        <TextField label="username" name="Username" value={username} onChange={handleUsernameChange} />
      </div>
      <div>
        <TextField label="password" type="password" name="Password" value={password} onChange={handlePasswordChange} />
      </div>
      <Button type="submit" variant="contained" style={{ marginTop: 10 }}>
        login
      </Button>
    </form>
  </div>
)

export default Login
