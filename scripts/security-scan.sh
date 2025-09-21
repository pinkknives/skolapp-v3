#!/bin/bash

# Security Scan Script for Skolapp v3
# Performs basic security checks on the codebase

set -e

echo "🔐 Running security scan..."

# Create reports directory
mkdir -p reports

# Check for common security issues using npm audit
echo "📦 Running npm audit..."
npm audit --audit-level=moderate > reports/npm-audit.txt 2>&1 || {
  echo "⚠️ npm audit found vulnerabilities"
  cat reports/npm-audit.txt
  echo ""
  echo "Run 'npm audit fix' to attempt automatic fixes"
}

# Check for hardcoded secrets (basic patterns)
echo "🔍 Scanning for potential secrets..."
SECRET_PATTERNS=(
  "password\s*=\s*['\"][^'\"]*['\"]"
  "secret\s*=\s*['\"][^'\"]*['\"]"
  "api[_-]?key\s*=\s*['\"][^'\"]*['\"]"
  "sk-[a-zA-Z0-9]{48}"
  "pk_[a-z]+_[a-zA-Z0-9]{24}"
  "eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*"
)

SECRET_FOUND=false
for pattern in "${SECRET_PATTERNS[@]}"; do
  if grep -r -E "$pattern" src/ --exclude-dir=node_modules --exclude="*.test.*" --exclude="*.spec.*" 2>/dev/null; then
    echo "❌ Potential secret found matching pattern: $pattern"
    SECRET_FOUND=true
  fi
done

if [ "$SECRET_FOUND" = false ]; then
  echo "✅ No obvious secrets found in source code"
fi

# Check for dangerous functions
echo "🚨 Checking for dangerous functions..."
DANGEROUS_PATTERNS=(
  "eval\s*\("
  "innerHTML\s*="
  "document\.write\s*\("
  "Function\s*\("
  "setTimeout\s*\(['\"][^'\"]*['\"]"
)

DANGER_FOUND=false
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if grep -r -E "$pattern" src/ --exclude-dir=node_modules --exclude="*.test.*" --exclude="*.spec.*" 2>/dev/null; then
    echo "⚠️ Potentially dangerous pattern found: $pattern"
    DANGER_FOUND=true
  fi
done

if [ "$DANGER_FOUND" = false ]; then
  echo "✅ No dangerous functions found"
fi

# Check for insecure dependencies
echo "📋 Checking for known insecure packages..."
INSECURE_PACKAGES=("lodash@<4.17.21" "axios@<0.21.2" "node-fetch@<2.6.7")

for package in "${INSECURE_PACKAGES[@]}"; do
  if npm list "$package" 2>/dev/null; then
    echo "❌ Insecure package version found: $package"
  fi
done

echo "📊 Security scan complete. Check reports/npm-audit.txt for detailed vulnerability information."

# If this is CI, fail on high/critical vulnerabilities
if [ "$CI" = "true" ]; then
  npm audit --audit-level=high --json > reports/npm-audit.json 2>/dev/null || {
    echo "❌ High or critical vulnerabilities found in CI"
    exit 1
  }
fi

echo "✅ Security scan completed successfully"