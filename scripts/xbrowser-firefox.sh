#!/bin/bash

# Cross-browser E2E Testing - Firefox
# Runs critical quiz flows in Firefox browser

set -e

echo "🦊 Running E2E tests in Firefox..."

# Install Playwright browsers if not available
npx playwright install firefox

# Run E2E tests specifically for Firefox with AI mock enabled
AI_MODE=mock npm run e2e:firefox

echo "✅ Firefox E2E tests completed successfully"