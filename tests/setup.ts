import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from './mocks/server'

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers)

// Setup MSW server for API mocking
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  // Clean up after each test case (e.g. clearing jsdom)
  cleanup()
  // Reset MSW handlers
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})