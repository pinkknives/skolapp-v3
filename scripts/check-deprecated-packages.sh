#!/bin/bash

# Script to check for deprecated npm packages
# This script should be run in CI to prevent deprecated packages from being used

set -e

echo "🔍 Checking for deprecated npm packages..."

# Create reports directory
mkdir -p reports

# List of known deprecated packages and their replacements
declare -A DEPRECATED_PACKAGES=(
  ["rollup-plugin-terser"]="@rollup/plugin-terser"
  ["rimraf@2"]="rimraf@^4.0.0"
  ["rimraf@3"]="rimraf@^4.0.0"
  ["eslint@8"]="eslint@^9.0.0"
)

EXIT_CODE=0
REPORT_MD="reports/deprecated-packages.md"

# Initialize Markdown report
cat > "$REPORT_MD" << EOF
# Deprecated Packages Report

Generated: $(date)

## Summary

EOF

# Check package.json for deprecated packages
for package in "${!DEPRECATED_PACKAGES[@]}"; do
  if grep -q "$package" package.json 2>/dev/null; then
    echo "❌ Found deprecated package: $package"
    echo "   Please update to: ${DEPRECATED_PACKAGES[$package]}"
    echo "- ❌ **$package** → Should use: ${DEPRECATED_PACKAGES[$package]}" >> "$REPORT_MD"
    EXIT_CODE=1
  else
    echo "- ✅ **$package** → Not found" >> "$REPORT_MD"
  fi
done

# Run npm audit for security vulnerabilities
echo "" >> "$REPORT_MD"
echo "## Security Audit" >> "$REPORT_MD"
echo "" >> "$REPORT_MD"

if npm audit --audit-level=moderate > reports/npm-audit.txt 2>&1; then
  echo "✅ No moderate+ security vulnerabilities found"
  echo "✅ No moderate+ security vulnerabilities found" >> "$REPORT_MD"
else
  echo "❌ Security vulnerabilities found"
  echo "❌ Security vulnerabilities found" >> "$REPORT_MD"
  echo "" >> "$REPORT_MD"
  echo "\`\`\`" >> "$REPORT_MD"
  cat reports/npm-audit.txt >> "$REPORT_MD"
  echo "\`\`\`" >> "$REPORT_MD"
  EXIT_CODE=1
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ No critical deprecated packages found"
else
  echo "❌ Issues found, check reports/deprecated-packages.md"
fi

exit $EXIT_CODE