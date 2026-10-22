const key = 'loggedNoteAppUser'

export const getUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch {
    return null // missing or corrupt value
  }
}

export const saveUser = (user) => {
  window.localStorage.setItem(key, JSON.stringify(user))
}

export const removeUser = () => {
  window.localStorage.removeItem(key)
}
