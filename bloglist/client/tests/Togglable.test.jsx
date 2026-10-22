import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect } from 'vitest'
import Togglable from '../src/components/Togglable'

test('<Togglable /> shows its children only after the button is clicked, and hides them again on cancel', async () => {
  const user = userEvent.setup()

  render(
    <Togglable buttonLabel="show...">
      <div>secret content</div>
    </Togglable>
  )

  expect(screen.getByText('secret content')).not.toBeVisible()

  await user.click(screen.getByText('show...'))
  expect(screen.getByText('secret content')).toBeVisible()

  await user.click(screen.getByText('cancel'))
  expect(screen.getByText('secret content')).not.toBeVisible()
})
