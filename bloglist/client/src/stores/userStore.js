import { create } from 'zustand'
import blogService from '../services/blogs'
import loginService from '../services/login'
import { getUser, saveUser, removeUser } from '../services/persistentUser'

export const useUserStore = create((set) => ({
  user: null, // null or { token, username, name }
  initializeUser: () => {
    const user = getUser()
    if (user) {
      blogService.setToken(user.token)
      set({ user })
    }
  },
  login: async (credentials) => {
    const user = await loginService.login(credentials)
    saveUser(user)
    blogService.setToken(user.token)
    set({ user })
  },
  logout: () => {
    removeUser()
    blogService.setToken(null)
    set({ user: null })
  }
}))
