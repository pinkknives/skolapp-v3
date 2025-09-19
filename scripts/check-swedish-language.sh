#!/bin/bash

# Enhanced Swedish Language Validation Script
# Checks for English text in Swedish UI context with whitelist support
# Only scans actual UI strings (JSX text, aria labels, titles, etc.)

set -e

SCRIPT_DIR="$(dirname "$0")"
WHITELIST_FILE="$SCRIPT_DIR/lang/whitelist.txt"

echo "🔍 Checking for English text in Swedish UI context..."

# Check if whitelist file exists
if [ ! -f "$WHITELIST_FILE" ]; then
  echo "❌ Whitelist file not found: $WHITELIST_FILE"
  exit 1
fi

# Common English words that should be in Swedish in UI
ENGLISH_UI_WORDS=(
  "Create"
  "Delete" 
  "Edit"
  "Save"
  "Cancel"
  "Submit"
  "Login"
  "Logout"
  "Home"
  "Settings"
  "Profile"
  "Dashboard"
  "Welcome"
  "Hello"
  "Please"
  "Thank you"
  "Yes"
  "No"
  "OK"
  "Continue"
  "Back"
  "Next"
  "Start"
  "Stop"
  "Complete"
  "Success"
  "Error"
  "Warning"
  "Help"
  "About"
  "Contact"
  "Support"
  "Search"
  "Filter"
  "View"
  "Print"
  "Share"
  "Send"
  "Open"
  "Close"
  "New"
  "Loading"
  "Please wait"
  "Try again"
  "Refresh"
  "Update"
  "Sign in"
  "Sign out"
  "Remember me"
)

# Build pattern for UI words to check
UI_PATTERN=$(IFS='|'; echo "${ENGLISH_UI_WORDS[*]}")

EXIT_CODE=0

echo "Checking TypeScript/React files for English UI text..."

# Create temp directory for processing
mkdir -p /tmp/lang-check

# Check only TSX/TS files for specific UI patterns
while IFS= read -r -d '' file; do
  echo "Checking UI strings in: $(basename "$file")"
  
  # Look for JSX text content, aria-labels, titles, placeholders, button text
  # Match patterns like: >text<, "text", 'text' but only in UI context
  # Exclude imports, variable assignments, and function definitions
  grep -n -E "(>|aria-label=|title=|placeholder=|alt=|children.*=|button.*>|span.*>).*($UI_PATTERN)" "$file" 2>/dev/null | \
    grep -v -E "(import|from|const|let|var|function|class|interface|type|export)" | \
    grep -v -f "$WHITELIST_FILE" > /tmp/lang-check/ui_check.log 2>/dev/null || true
  
  if [ -s /tmp/lang-check/ui_check.log ]; then
    echo "❌ Potential English UI text found in $(basename "$file"):"
    cat /tmp/lang-check/ui_check.log
    EXIT_CODE=1
  fi
done < <(find src/app src/components -name "*.tsx" -print0)

# Check for Swedish characters to ensure Swedish support
echo "Checking for Swedish character support..."
if ! find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -l "[åäöÅÄÖ]" > /dev/null; then
  echo "⚠️ Warning: No Swedish characters found in UI files"
  echo "   Verify that Swedish localization is properly implemented"
else
  echo "✅ Swedish characters detected in codebase"
fi

# Clean up temp files
rm -rf /tmp/lang-check

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ No obvious English UI text found that should be in Swedish"
fi

exit $EXIT_CODE