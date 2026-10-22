import { render, screen, act } from '@testing-library/react'
import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import Notification from '../src/components/Notification'
import { useNotificationStore } from '../src/stores/notificationStore'

beforeEach(() => {
  vi.useFakeTimers()
  useNotificationStore.setState({ notification: null })
})

afterEach(() => {
  useNotificationStore.getState().clearNotification()
  vi.useRealTimers()
})

test('notification is hidden until triggered, then disappears after 5 seconds', () => {
  render(<Notification />)

  expect(screen.queryByText('a new blog Test by Author added')).not.toBeInTheDocument()

  act(() => {
    useNotificationStore.getState().setNotification('a new blog Test by Author added')
  })
  expect(screen.getByText('a new blog Test by Author added')).toBeInTheDocument()

  act(() => {
    vi.advanceTimersByTime(4999)
  })
  expect(screen.getByText('a new blog Test by Author added')).toBeInTheDocument()

  act(() => {
    vi.advanceTimersByTime(1)
  })
  expect(screen.queryByText('a new blog Test by Author added')).not.toBeInTheDocument()
})

test('a second notification restarts the timer', () => {
  render(<Notification />)

  act(() => {
    useNotificationStore.getState().setNotification('first', 'error')
  })
  act(() => {
    vi.advanceTimersByTime(3000)
  })
  act(() => {
    useNotificationStore.getState().setNotification('second', 'error')
  })
  act(() => {
    vi.advanceTimersByTime(4999)
  })
  expect(screen.getByText('second')).toBeInTheDocument()

  act(() => {
    vi.advanceTimersByTime(1)
  })
  expect(screen.queryByText('second')).not.toBeInTheDocument()
})
