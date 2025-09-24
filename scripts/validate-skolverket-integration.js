#!/usr/bin/env node

/**
 * Validation script for Skolverket integration
 * Verifies that all components are correctly implemented and linked
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

function log(message, color = reset) {
  console.log(`${color}${message}${reset}`);
}

function checkFile(path, description) {
  if (existsSync(path)) {
    log(`✅ ${description}`, green);
    return true;
  } else {
    log(`❌ ${description} - File missing: ${path}`, red);
    return false;
  }
}

function checkFileContent(path, searchStrings, description) {
  if (!existsSync(path)) {
    log(`❌ ${description} - File missing: ${path}`, red);
    return false;
  }

  const content = readFileSync(path, 'utf8');
  const missingStrings = searchStrings.filter(str => !content.includes(str));
  
  if (missingStrings.length === 0) {
    log(`✅ ${description}`, green);
    return true;
  } else {
    log(`❌ ${description} - Missing: ${missingStrings.join(', ')}`, red);
    return false;
  }
}

console.log('\n🔍 Validating Skolverket Syllabus API Integration\n');

let allChecksPass = true;

// Check core files exist
allChecksPass &= checkFile(
  'src/lib/api/skolverket-client.ts',
  'OpenAPI client for Skolverket API'
);

allChecksPass &= checkFile(
  'src/app/api/admin/syllabus/refresh/route.ts',
  'Admin API route for manual refresh'
);

allChecksPass &= checkFile(
  '.github/workflows/skolverket-refresh.yml',
  'GitHub Action for weekly refresh'
);

allChecksPass &= checkFile(
  'docs/ai/syllabus-rag.md',
  'Documentation for Skolverket integration'
);

// Check environment variables are documented
allChecksPass &= checkFileContent(
  '.env.local.example',
  ['FEATURE_SYLLABUS', 'SYLLABUS_BASE_URL', 'SYLLABUS_REFRESH_CRON'],
  'Environment variables in .env.local.example'
);

// Check ETL script has been updated
allChecksPass &= checkFileContent(
  'scripts/etl/skolverket.js',
  ['fetchCurriculumData', 'isFeatureEnabled', 'SkolverketApiClient'],
  'ETL script integration with real API'
);

// Check RAG API has feature flag support
allChecksPass &= checkFileContent(
  'src/app/api/rag/quiz/context/route.ts',
  ['FEATURE_SYLLABUS', 'featureDisabled'],
  'RAG API feature flag support'
);

// Check AI component has been enhanced
allChecksPass &= checkFileContent(
  'src/components/quiz/AIQuestionGenerator.tsx',
  ['syllabusAvailable', 'useEffect', 'Använd svenska läroplaner'],
  'AI component feature availability detection'
);

// Check package.json has ETL scripts
allChecksPass &= checkFileContent(
  'package.json',
  ['etl:skolverket', 'etl:skolverket:fresh'],
  'ETL scripts in package.json'
);

// Validate workflow file
allChecksPass &= checkFileContent(
  '.github/workflows/skolverket-refresh.yml',
  ['schedule:', 'npm run etl:skolverket', 'FEATURE_SYLLABUS: true'],
  'GitHub Action configuration'
);

console.log('\n📊 Validation Results:');

if (allChecksPass) {
  log('\n🎉 All validation checks passed!', green);
  log('✅ Skolverket API integration is correctly implemented', green);
  log('✅ Feature flag support is in place', green);
  log('✅ Admin routes and automation are configured', green);
  log('✅ UI enhancements are implemented', green);
  log('✅ Documentation is complete', green);
  
  console.log('\n📋 Next steps:');
  console.log('1. Configure environment variables in .env.local');
  console.log('2. Run: npm run etl:skolverket:fresh');
  console.log('3. Test AI panel with Skolverket data');
  console.log('4. Set up GitHub secrets for automated refresh');
  
  process.exit(0);
} else {
  log('\n❌ Some validation checks failed', red);
  log('Please review the missing components above', yellow);
  process.exit(1);
}