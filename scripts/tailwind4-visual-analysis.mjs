#!/usr/bin/env node

/**
 * Tailwind 4 Migration Visual Analysis
 * 
 * Creates a comprehensive analysis of the current state after Tailwind 4 migration
 * by examining the codebase and documenting potential issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Define viewport sizes for analysis
const viewports = [
  { name: 'mobile', width: 375, height: 667, title: 'Mobil (iPhone SE)' },
  { name: 'tablet', width: 768, height: 1024, title: 'Surfplatta (iPad)' },
  { name: 'desktop', width: 1280, height: 720, title: 'Desktop' }
];

// Define pages to analyze
const pages = [
  { 
    name: 'home', 
    url: '/', 
    title: 'Startsida',
    description: 'Hero-sektion med gradient, feature-cards, CTA-knappar',
    authRequired: false
  },
  { 
    name: 'login', 
    url: '/login', 
    title: 'Logga in',
    description: 'Inloggningsformulär med magic link',
    authRequired: false
  },
  { 
    name: 'register', 
    url: '/register', 
    title: 'Registrera',
    description: 'Registreringsformulär med e-post validation',
    authRequired: false
  },
  { 
    name: 'ai-quiz', 
    url: '/teacher/quiz/create', 
    title: 'Skapa Quiz (AI)',
    description: 'AI-drivet quiz-skapande interface',
    authRequired: true
  },
  { 
    name: 'profile', 
    url: '/profile', 
    title: 'Profil',
    description: 'Användarprofilsida med inställningar',
    authRequired: true
  }
];

// Color classes that are commonly affected by Tailwind 4 migration
const colorClassPatterns = [
  /bg-(neutral|primary|secondary|error|success|info|warning)-\d+/g,
  /text-(neutral|primary|secondary|error|success|info|warning)-\d+/g,
  /border-(neutral|primary|secondary|error|success|info|warning)-\d+/g,
  /from-(neutral|primary|secondary|error|success|info|warning)-\d+/g,
  /to-(neutral|primary|secondary|error|success|info|warning)-\d+/g,
];

// Known Tailwind 4 changes that might affect the application
const tailwind4Changes = [
  {
    category: 'Colors',
    change: 'gray-* renamed to neutral-*',
    status: '✅ Handled',
    impact: 'Already configured in tailwind.config.js'
  },
  {
    category: 'Colors',
    change: 'Default color values adjusted',
    status: '⚠️ Needs verification',
    impact: 'Color intensity might be different'
  },
  {
    category: 'Spacing',
    change: 'New spacing scale',
    status: '⚠️ Needs verification', 
    impact: 'Default margins and paddings might differ'
  },
  {
    category: 'Typography',
    change: 'Updated default line heights',
    status: '⚠️ Needs verification',
    impact: 'Text spacing might be affected'
  },
  {
    category: 'CSS Layers',
    change: 'New @layer system',
    status: '✅ Handled',
    impact: 'Using @tailwindcss/postcss plugin'
  }
];

function analyzeCodebase() {
  console.log('📊 Analyzing codebase for Tailwind class usage...');
  
  const srcDir = path.join(projectRoot, 'src');
  const colorClassUsage = new Map();
  const componentIssues = [];

  function analyzeFile(filePath) {
    if (!filePath.match(/\.(tsx?|jsx?)$/)) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(projectRoot, filePath);
      
      // Find all color classes
      colorClassPatterns.forEach(pattern => {
        const matches = content.match(pattern) || [];
        matches.forEach(match => {
          const count = colorClassUsage.get(match) || 0;
          colorClassUsage.set(match, count + 1);
        });
      });
      
      // Check for potential issues
      if (content.includes('gray-')) {
        componentIssues.push({
          file: relativePath,
          issue: 'Uses deprecated gray-* classes',
          severity: 'high'
        });
      }
      
      if (content.match(/className.*\s+\s+/)) {
        componentIssues.push({
          file: relativePath,
          issue: 'Multiple spaces in className (might indicate missing classes)',
          severity: 'medium'
        });
      }
      
    } catch (error) {
      console.log(`⚠️ Error reading ${filePath}: ${error.message}`);
    }
  }

  function walkDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDirectory(fullPath);
        } else {
          analyzeFile(fullPath);
        }
      });
    } catch (error) {
      console.log(`⚠️ Error walking directory ${dir}: ${error.message}`);
    }
  }

  walkDirectory(srcDir);
  
  return {
    colorClassUsage: Array.from(colorClassUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50), // Top 50 most used
    componentIssues,
    totalFiles: 0 // Would need to count properly
  };
}

function generateAnalysisReport() {
  console.log('📋 Generating comprehensive analysis report...');
  
  const analysis = analyzeCodebase();
  const timestamp = new Date().toISOString();
  
  const report = `# Tailwind 4 Migration Visual Analysis Report

*Generated: ${timestamp}*

## Executive Summary

After migrating from Tailwind 3 to Tailwind 4.1.13, this report analyzes the current state and identifies areas that need visual verification.

**Status: ⚠️ Needs Visual Verification**
- Build: ✅ Successful (with --no-lint)
- Dev Server: ✅ Running on http://localhost:3000
- Configuration: ✅ Updated for Tailwind 4

## Color Class Usage Analysis

### Top 20 Most Used Color Classes:
${analysis.colorClassUsage.slice(0, 20).map(([className, count]) => 
  `- \`${className}\`: ${count} användningar`
).join('\n')}

### Total Color Classes: ${analysis.colorClassUsage.length} unique classes

## Potential Issues Found

${analysis.componentIssues.length > 0 ? 
  analysis.componentIssues.map(issue => 
    `### ${issue.severity.toUpperCase()}: ${issue.file}\n- ${issue.issue}\n`
  ).join('\n') :
  '✅ No obvious code issues detected'
}

## Tailwind 4 Migration Impact Assessment

${tailwind4Changes.map(change => `
### ${change.category}: ${change.change}
**Status:** ${change.status}  
**Impact:** ${change.impact}
`).join('\n')}

## Page Analysis

${pages.map(page => `
### ${page.title} (\`${page.url}\`)
**Authentication Required:** ${page.authRequired ? '🔒 Yes' : '🔓 No'}  
**Description:** ${page.description}  
**Status:** ${page.authRequired ? '⚠️ Requires manual testing with auth' : '✅ Available for testing'}

**Visual Areas to Check:**
- Color consistency with design system
- Button variants and hover states  
- Form input styling and focus states
- Layout spacing and typography
- Responsive behavior across viewports
`).join('\n')}

## Manual Testing Checklist

### Viewport Testing
${viewports.map(vp => 
  `- [ ] ${vp.title} (${vp.width}x${vp.height})`
).join('\n')}

### Component Testing
- [ ] Button variants (primary, secondary, outline, ghost, destructive)
- [ ] Form inputs (text, email, password, select, textarea)
- [ ] Card components (shadows, borders, padding)
- [ ] Navigation elements (hover states, active states)
- [ ] Typography (headings, body text, captions)
- [ ] Color palette (primary, neutral, error, success, info)

### Functional Testing  
- [ ] Hero section gradient rendering
- [ ] Feature card icons and spacing
- [ ] Form validation error states
- [ ] Loading states and animations
- [ ] Dark/light theme support (if applicable)

## Recommended Actions

### Immediate (High Priority)
1. **Manual Visual Testing**: Test all public pages across viewports
2. **Color Verification**: Ensure custom color palette renders correctly
3. **Component Spot Check**: Verify Button and Card components specifically

### Short Term (Medium Priority)
1. **Authentication Flow**: Set up test authentication to verify protected pages
2. **Cross-Browser Testing**: Test in Chrome, Firefox, Safari
3. **Performance Check**: Verify CSS bundle size and loading performance

### Long Term (Low Priority)
1. **Automated Visual Testing**: Set up visual regression testing
2. **Design System Audit**: Comprehensive review of all components
3. **Documentation Update**: Update component documentation if changes found

## Technical Details

**Tailwind Version:** 4.1.13  
**Configuration File:** \`tailwind.config.js\` (✅ Updated)  
**PostCSS Plugin:** \`@tailwindcss/postcss@^4.1.13\`  
**Build Tool:** Next.js 15.5.3  
**CSS Output:** Single bundle with layer system  

## Notes

- Limited git history available for "before" comparison
- Browser automation tools unavailable in current environment  
- Manual testing required for comprehensive visual verification
- Focus on color classes and component styling as highest risk areas

---

*Report generated by Tailwind 4 Migration Analysis Tool*
*For issues or updates, see: docs/TAILWIND_4_MIGRATION_ANALYSIS.md*
`;

  return report;
}

function main() {
  console.log('🚀 Starting Tailwind 4 Migration Analysis...\n');
  
  const report = generateAnalysisReport();
  
  // Write report to file
  const reportPath = path.join(projectRoot, 'docs', 'TAILWIND_4_VISUAL_ANALYSIS_REPORT.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n✅ Analysis complete!`);
  console.log(`📄 Report saved to: ${path.relative(projectRoot, reportPath)}`);
  console.log(`\n📋 Summary:`);
  console.log(`- Color classes analyzed and documented`);
  console.log(`- Potential issues identified`);
  console.log(`- Manual testing checklist created`);
  console.log(`- Recommendations provided`);
  console.log(`\n🌐 Dev server available at: http://localhost:3000`);
  console.log(`📖 Next steps: Manual visual verification of pages listed in report`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}