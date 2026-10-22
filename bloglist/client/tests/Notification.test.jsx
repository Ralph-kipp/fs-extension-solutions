import { useState } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import Notification from '../src/components/Notification'

// Mirrors App's notify() exactly: set the message, clear it after 5000ms.
const NotifyWrapper = () => {
  const [message, setMessage] = useState(null)

  const notify = (msg) => {
    setMessage({ text: msg, type: 'success' })
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div>
      <button onClick={() => notify('a new blog Test by Author added')}>
        trigger
      </button>
      <Notification message={message} />
    </div>
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('notification is hidden until triggered, then disappears after 5 seconds', () => {
  render(<NotifyWrapper />)

  expect(screen.queryByText('a new blog Test by Author added')).not.toBeInTheDocument()

  fireEvent.click(screen.getByText('trigger'))
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
