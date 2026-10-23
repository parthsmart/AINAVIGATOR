import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('overview foundation', () => {
  it('shows the assessment entry point', () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /find work that feels like yours/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /interest assessment/i })).toBeInTheDocument()
  })
})
