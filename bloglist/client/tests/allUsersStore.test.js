import { test, expect, vi, beforeEach } from 'vitest'
import userService from '../src/services/users'
import { useAllUsersStore } from '../src/stores/allUsersStore'

vi.mock('../src/services/users', () => ({ default: { getAll: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
  useAllUsersStore.setState({ users: [], loaded: false })
})

test('initializeUsers sets users and loaded', async () => {
  const users = [{ id: 'u1', name: 'Root', blogs: [] }]
  userService.getAll.mockResolvedValue(users)
  await useAllUsersStore.getState().initializeUsers()
  expect(useAllUsersStore.getState()).toMatchObject({ users, loaded: true })
})

test('initializeUsers sets loaded even when the fetch fails', async () => {
  userService.getAll.mockRejectedValue(new Error('down'))
  await expect(useAllUsersStore.getState().initializeUsers()).rejects.toThrow()
  expect(useAllUsersStore.getState()).toMatchObject({ users: [], loaded: true })
})
