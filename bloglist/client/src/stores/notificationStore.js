import { create } from 'zustand'

// the timer id lives outside the store: it is not UI state, and keeping it here lets us cancel the previous timer
let timeoutId = null

export const useNotificationStore = create((set) => ({
  notification: null, // null or { text, type }
  setNotification: (text, type = 'success', seconds = 5) => {
    clearTimeout(timeoutId)
    set({ notification: { text, type } })
    timeoutId = setTimeout(() => set({ notification: null }), seconds * 1000)
  },
  clearNotification: () => {
    clearTimeout(timeoutId)
    set({ notification: null })
  }
}))
