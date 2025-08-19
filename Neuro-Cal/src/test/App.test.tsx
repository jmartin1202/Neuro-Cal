import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

describe('Basic Test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('can do basic math', () => {
    expect(2 + 2).toBe(4)
  })
})
