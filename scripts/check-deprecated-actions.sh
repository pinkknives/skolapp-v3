#!/bin/bash

# Script to check for deprecated GitHub Actions
# This script should be run in CI to prevent deprecated actions from being used

set -e

echo "🔍 Checking for deprecated GitHub Actions..."

WORKFLOW_DIR=".github/workflows"
DEPRECATED_ACTIONS=(
  "actions/upload-artifact@v3"
  "actions/download-artifact@v3" 
  "actions/setup-node@v3"
  "actions/checkout@v3"
  "actions/cache@v3"
)

EXIT_CODE=0

for action in "${DEPRECATED_ACTIONS[@]}"; do
  if grep -r "$action" "$WORKFLOW_DIR" 2>/dev/null; then
    echo "❌ Found deprecated action: $action"
    echo "   Please update to the latest version"
    EXIT_CODE=1
  fi
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ No deprecated GitHub Actions found"
fi

exit $EXIT_CODE