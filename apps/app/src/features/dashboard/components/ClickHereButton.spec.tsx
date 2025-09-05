import { describe, it, vi, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ClickHereButton } from './ClickHereButton'

const mockCapture = vi.fn()

vi.mock('@atlas/react', () => ({
  useAtlas: () => ({
    atlasClient: {
      events: {
        capture: mockCapture,
      },
    },
  }),
}))

describe('ClickHereButton:rendering', () => {
  it('should render correctly', () => {
    render(<ClickHereButton />)

    expect(screen.getByRole('button', { name: /click here/i })).toBeDefined()
  })
})

describe('ClickHereButton:interaction', async () => {
  it('should handle click events correctly', () => {
    render(<ClickHereButton />)

    const trigger = screen.getByRole('button')

    fireEvent.click(trigger)

    expect(mockCapture).toHaveBeenCalledWith({ event: 'Button Clicked' })
  })
})
