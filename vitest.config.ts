/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    // Exclude Playwright test files
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.e2e.spec.ts', '**/*.spec.ts'],
    // Include only RTL component tests
    include: ['tests/components/**/*.test.tsx', 'tests/**/*.test.ts'],
    // Use Swedish locale for testing  
    env: {
      TZ: 'Europe/Stockholm',
      LANG: 'sv_SE.UTF-8'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})