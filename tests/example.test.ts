// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'

describe('Test Environment Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to vitest globals', () => {
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
  })
})
