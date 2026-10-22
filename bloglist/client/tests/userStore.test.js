import { test, expect, vi, beforeEach } from 'vitest'
import blogService from '../src/services/blogs'
import loginService from '../src/services/login'
import { useUserStore } from '../src/stores/userStore'

vi.mock('../src/services/blogs', () => ({ default: { setToken: vi.fn() } }))
vi.mock('../src/services/login', () => ({ default: { login: vi.fn() } }))

const user = { token: 't0k', username: 'root', name: 'Root' }

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  useUserStore.setState({ user: null })
})

test('login stores the user, saves it and sets the token', async () => {
  loginService.login.mockResolvedValue(user)
  await useUserStore.getState().login({ username: 'root', password: 'x' })
  expect(useUserStore.getState().user).toEqual(user)
  expect(JSON.parse(window.localStorage.getItem('loggedNoteAppUser'))).toEqual(user)
  expect(blogService.setToken).toHaveBeenCalledWith('t0k')
})

test('a failed login throws and leaves no user', async () => {
  loginService.login.mockRejectedValue(new Error('401'))
  await expect(useUserStore.getState().login({})).rejects.toThrow()
  expect(useUserStore.getState().user).toBeNull()
})

test('initializeUser restores a saved user and its token', () => {
  window.localStorage.setItem('loggedNoteAppUser', JSON.stringify(user))
  useUserStore.getState().initializeUser()
  expect(useUserStore.getState().user).toEqual(user)
  expect(blogService.setToken).toHaveBeenCalledWith('t0k')
})

test('a corrupt saved value gives no user', () => {
  window.localStorage.setItem('loggedNoteAppUser', '{not json')
  useUserStore.getState().initializeUser()
  expect(useUserStore.getState().user).toBeNull()
})

test('logout clears storage, token and user', () => {
  window.localStorage.setItem('loggedNoteAppUser', JSON.stringify(user))
  useUserStore.setState({ user })
  useUserStore.getState().logout()
  expect(useUserStore.getState().user).toBeNull()
  expect(window.localStorage.getItem('loggedNoteAppUser')).toBeNull()
  expect(blogService.setToken).toHaveBeenCalledWith(null)
})
