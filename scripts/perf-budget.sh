#!/bin/bash

# Performance Budget Script for Skolapp v3
# Checks bundle sizes and performance metrics

set -e

echo "⚡ Running performance budget checks..."

# Create reports directory
mkdir -p reports

# Build the application for analysis
echo "🏗️ Building application for analysis..."
ANALYZE=true npm run build 2>&1 | tee reports/build-output.txt

# Check bundle sizes
echo "📦 Checking bundle sizes..."

# Define size limits (in bytes)
MAX_JS_BUNDLE=204800    # 200KB gzipped
MAX_CSS_BUNDLE=51200    # 50KB gzipped
MAX_TOTAL_BUNDLE=409600 # 400KB gzipped

# Check if bundle analyzer files exist
if [ -d ".next/analyze" ]; then
  echo "📊 Bundle analysis files found"
  
  # Parse bundle sizes (this would be more sophisticated in practice)
  # For now, we'll do basic checks on the .next output
  
  JS_SIZE=$(find .next/static/chunks -name "*.js" -exec wc -c {} + | tail -1 | awk '{print $1}' || echo "0")
  CSS_SIZE=$(find .next/static/css -name "*.css" -exec wc -c {} + | tail -1 | awk '{print $1}' || echo "0")
  
  echo "JavaScript bundle size: $(echo $JS_SIZE | numfmt --to=iec) bytes"
  echo "CSS bundle size: $(echo $CSS_SIZE | numfmt --to=iec) bytes"
  
  # Budget checks
  BUDGET_FAILED=false
  
  if [ "$JS_SIZE" -gt "$MAX_JS_BUNDLE" ]; then
    echo "❌ JavaScript bundle exceeds budget: $JS_SIZE > $MAX_JS_BUNDLE bytes"
    BUDGET_FAILED=true
  else
    echo "✅ JavaScript bundle within budget"
  fi
  
  if [ "$CSS_SIZE" -gt "$MAX_CSS_BUNDLE" ]; then
    echo "❌ CSS bundle exceeds budget: $CSS_SIZE > $MAX_CSS_BUNDLE bytes"
    BUDGET_FAILED=true
  else
    echo "✅ CSS bundle within budget"
  fi
  
  TOTAL_SIZE=$((JS_SIZE + CSS_SIZE))
  if [ "$TOTAL_SIZE" -gt "$MAX_TOTAL_BUNDLE" ]; then
    echo "❌ Total bundle exceeds budget: $TOTAL_SIZE > $MAX_TOTAL_BUNDLE bytes"
    BUDGET_FAILED=true
  else
    echo "✅ Total bundle within budget"
  fi
  
  # Generate budget report
  cat > reports/performance-budget.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "budgets": {
    "javascript": {
      "limit": $MAX_JS_BUNDLE,
      "actual": $JS_SIZE,
      "passed": $([ "$JS_SIZE" -le "$MAX_JS_BUNDLE" ] && echo "true" || echo "false")
    },
    "css": {
      "limit": $MAX_CSS_BUNDLE,
      "actual": $CSS_SIZE,
      "passed": $([ "$CSS_SIZE" -le "$MAX_CSS_BUNDLE" ] && echo "true" || echo "false")
    },
    "total": {
      "limit": $MAX_TOTAL_BUNDLE,
      "actual": $TOTAL_SIZE,
      "passed": $([ "$TOTAL_SIZE" -le "$MAX_TOTAL_BUNDLE" ] && echo "true" || echo "false")
    }
  }
}
EOF
  
  if [ "$BUDGET_FAILED" = true ]; then
    echo "❌ Performance budget check failed"
    echo "💡 Consider:"
    echo "   - Code splitting large components"
    echo "   - Tree shaking unused dependencies"
    echo "   - Lazy loading non-critical features"
    echo "   - Optimizing images and assets"
    
    if [ "$CI" = "true" ]; then
      exit 1
    fi
  else
    echo "✅ All performance budgets passed"
  fi
  
else
  echo "⚠️ Bundle analyzer output not found"
  echo "💡 Run 'npm run analyze' to generate detailed bundle analysis"
fi

# Check for common performance anti-patterns
echo "🔍 Checking for performance anti-patterns..."

PERF_ISSUES=false

# Check for large images in public directory
LARGE_IMAGES=$(find public -name "*.jpg" -o -name "*.png" -o -name "*.gif" 2>/dev/null | xargs ls -la 2>/dev/null | awk '$5 > 500000 {print $9, $5}' || true)
if [ -n "$LARGE_IMAGES" ]; then
  echo "⚠️ Large images found (>500KB):"
  echo "$LARGE_IMAGES"
  echo "💡 Consider optimizing these images"
  PERF_ISSUES=true
fi

# Check for synchronous imports of large libraries
SYNC_IMPORTS=$(grep -r "import.*moment\|import.*lodash\|import.*material-ui" src/ 2>/dev/null | grep -v "dynamic\|lazy" || true)
if [ -n "$SYNC_IMPORTS" ]; then
  echo "⚠️ Potentially heavy synchronous imports found:"
  echo "$SYNC_IMPORTS"
  echo "💡 Consider dynamic imports for large libraries"
  PERF_ISSUES=true
fi

if [ "$PERF_ISSUES" = false ]; then
  echo "✅ No obvious performance anti-patterns found"
fi

echo "📊 Performance budget check complete"
echo "📁 Reports saved to reports/performance-budget.json"

echo "✅ Performance budget check completed"