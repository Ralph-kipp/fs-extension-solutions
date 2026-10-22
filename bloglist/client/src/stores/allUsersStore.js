import { create } from 'zustand'
import userService from '../services/users'

export const useAllUsersStore = create((set) => ({
  users: [],
  loaded: false, // true once the first fetch has finished, also when it failed
  initializeUsers: async () => {
    try {
      const users = await userService.getAll()
      set({ users })
    } finally {
      set({ loaded: true })
    }
  }
}))
