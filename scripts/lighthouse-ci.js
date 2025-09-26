#!/usr/bin/env node
const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  try {
    const chromePath = chromium.executablePath();
    const args = ['lhci', 'autorun', '--collect.settings.chromeFlags=--headless=new'];
    const child = spawn('npx', args, {
      stdio: 'inherit',
      env: { ...process.env, CHROME_PATH: chromePath }
    });
    child.on('exit', (code) => process.exit(code || 0));
  } catch (err) {
    console.error('Failed to launch LHCI with Playwright Chromium:', err);
    process.exit(1);
  }
})();
