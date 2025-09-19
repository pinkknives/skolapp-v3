#!/bin/bash

# Cross-browser E2E Testing - Chromium
# Runs critical quiz flows in Chromium browser

set -e

echo "🚀 Running E2E tests in Chromium..."

# Install Playwright browsers if not available
npx playwright install chromium

# Run E2E tests specifically for Chromium
npm run e2e:chromium

echo "✅ Chromium E2E tests completed successfully"