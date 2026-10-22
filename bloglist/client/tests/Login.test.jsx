import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect, vi } from 'vitest'
import Login from '../src/components/Login'

// Wraps Login the same way App does: the parent owns the username/password
// state and hands Login controlled values plus change/submit handlers.
const LoginWrapper = ({ onSubmit }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ username, password })
  }

  return (
    <Login
      username={username}
      password={password}
      handleUsernameChange={({ target }) => setUsername(target.value)}
      handlePasswordChange={({ target }) => setPassword(target.value)}
      handleSubmit={handleSubmit}
    />
  )
}

test('<Login /> renders a username field and a password field', () => {
  render(<LoginWrapper onSubmit={() => {}} />)

  expect(screen.getByLabelText('username')).toBeInTheDocument()
  expect(screen.getByLabelText('password')).toBeInTheDocument()
})

test('<Login /> calls handleSubmit with the typed username and password', async () => {
  const onSubmit = vi.fn()
  const user = userEvent.setup()

  render(<LoginWrapper onSubmit={onSubmit} />)

  const usernameInput = screen.getByLabelText('username')
  const passwordInput = screen.getByLabelText('password')
  const sendButton = screen.getByText('login')

  await user.type(usernameInput, 'mluukkai')
  await user.type(passwordInput, 'salainen')
  await user.click(sendButton)

  expect(onSubmit.mock.calls).toHaveLength(1)
  expect(onSubmit.mock.calls[0][0]).toEqual({
    username: 'mluukkai',
    password: 'salainen'
  })
})
