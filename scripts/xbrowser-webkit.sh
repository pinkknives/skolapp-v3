#!/bin/bash

# Cross-browser E2E Testing - WebKit
# Runs critical quiz flows in WebKit browser

set -e

echo "🍎 Running E2E tests in WebKit..."

# Install Playwright browsers if not available
npx playwright install webkit

# Run E2E tests specifically for WebKit
npm run e2e:webkit

echo "✅ WebKit E2E tests completed successfully"