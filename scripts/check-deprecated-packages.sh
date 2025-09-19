#!/bin/bash

# Script to check for deprecated npm packages
# This script should be run in CI to prevent deprecated packages from being used

set -e

echo "🔍 Checking for deprecated npm packages..."

# List of known deprecated packages and their replacements
declare -A DEPRECATED_PACKAGES=(
  ["rollup-plugin-terser"]="@rollup/plugin-terser"
  ["rimraf@2"]="rimraf@^4.0.0"
  ["rimraf@3"]="rimraf@^4.0.0"
  ["eslint@8"]="eslint@^9.0.0"
)

EXIT_CODE=0

# Check package.json for deprecated packages
for package in "${!DEPRECATED_PACKAGES[@]}"; do
  if grep -q "$package" package.json 2>/dev/null; then
    echo "❌ Found deprecated package: $package"
    echo "   Please update to: ${DEPRECATED_PACKAGES[$package]}"
    EXIT_CODE=1
  fi
done

# Run npm ls to check for deprecated packages in dependencies
echo "Running npm audit for security vulnerabilities..."
if ! npm audit --audit-level=moderate; then
  echo "❌ Security vulnerabilities found"
  EXIT_CODE=1
fi

# Check for deprecation warnings in npm install output
echo "Checking for deprecation warnings..."
if npm list --depth=0 2>&1 | grep -i "deprecated" > /tmp/deprecated.log; then
  echo "⚠️ Deprecated packages found in dependency tree:"
  cat /tmp/deprecated.log
  echo "Consider updating these packages"
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ No critical deprecated packages found"
fi

exit $EXIT_CODE