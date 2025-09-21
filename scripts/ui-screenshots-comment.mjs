#!/usr/bin/env node

/**
 * UI Screenshots Comment Script
 * 
 * Tar live-screenshots av Skolapp v3 sidor i olika viewport-storlekar
 * och postar dem som kommentar i GitHub issue.
 * 
 * Usage:
 *   export GITHUB_TOKEN=$(gh auth token)   # eller använd PAT med repo-rättigheter
 *   node scripts/ui-screenshots-comment.mjs --issue ISSUE_NUMBER --base BASE_URL
 * 
 * Exempel:
 *   node scripts/ui-screenshots-comment.mjs --issue 192 --base http://localhost:3000
 */

import { chromium } from 'playwright';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const RUN_ID = Date.now().toString();
const OUT_DIR = path.join('ui-screenshots', RUN_ID);

// Parse command-line arguments
function arg(name, def = null) {
  const args = process.argv;
  const i = args.findIndex(a => a === `--${name}`);
  return i >= 0 ? args[i + 1] : def;
}

const ISSUE_NUMBER = Number(arg('issue'));
const BASE_URL = arg('base');

if (!ISSUE_NUMBER || !BASE_URL) {
  console.error('Usage: node scripts/ui-screenshots-comment.mjs --issue ISSUE_NUMBER --base BASE_URL');
  console.error('Exempel: node scripts/ui-screenshots-comment.mjs --issue 192 --base http://localhost:3000');
  process.exit(1);
}

// Sidor att screenshot:a (uppdaterade vägar baserat på app-struktur)
const pages = [
  { name: 'home', url: '/', title: 'Startsida' },
  { name: 'login', url: '/login', title: 'Logga in' },
  { name: 'signup', url: '/register', title: 'Registrera' },  // signup -> register i den riktiga appen
  { name: 'ai-quiz', url: '/teacher/quiz/create', title: 'Skapa Quiz (AI)' },
  { name: 'profile', url: '/profile', title: 'Profil' }
];

// Viewport-storlekar för olika enheter
const viewports = [
  { name: 'mobile', width: 375, height: 667, title: 'Mobil (iPhone SE)' },
  { name: 'tablet', width: 768, height: 1024, title: 'Surfplatta (iPad)' },
  { name: 'desktop', width: 1280, height: 720, title: 'Desktop' }
];

async function captureAll() {
  console.log(`🚀 Startar UI screenshots för issue #${ISSUE_NUMBER}`);
  console.log(`📍 Bas-URL: ${BASE_URL}`);
  console.log(`📁 Output: ${OUT_DIR}`);
  
  // Skapa output-mapp
  fs.mkdirSync(OUT_DIR, { recursive: true });
  
  // Demo mode för utveckling - skapar mock screenshots  
  if (process.env.DEMO_MODE === 'true') {
    console.log('\n⚠️  DEMO MODE: Skapar mock screenshots istället för riktiga');
    return createMockScreenshots();
  }
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-gpu',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows'
      ]
    });
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const vp of viewports) {
      console.log(`\n📱 ${vp.title} (${vp.width}x${vp.height})`);
      
      const ctx = await browser.newContext({ 
        viewport: vp,
        // Svenska inställningar
        locale: 'sv-SE',
        timezoneId: 'Europe/Stockholm'
      });
      const page = await ctx.newPage();

      // Inaktivera animationer för konsekventa screenshots
      await page.addStyleTag({
        content: `
          * { 
            animation-duration: 1ms !important; 
            transition-duration: 1ms !important; 
            animation-delay: 0ms !important;
            transition-delay: 0ms !important;
          }
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `
      });

      for (const p of pages) {
        try {
          console.log(`  📸 ${p.title} (${p.name})...`);
          
          await page.goto(`${BASE_URL}${p.url}`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });
          
          // Vänta på att sidan ska laddas och animationer ska settle
          await page.waitForTimeout(3000);
          
          const file = path.join(OUT_DIR, `${p.name}-${vp.name}.png`);
          await page.screenshot({ 
            path: file, 
            fullPage: true,
            animations: 'disabled'
          });
          
          console.log(`  ✅ Sparad: ${p.name}-${vp.name}.png`);
          results.push({
            page: p.name,
            viewport: vp.name,
            file: `${p.name}-${vp.name}.png`,
            title: `${p.title} - ${vp.title}`,
            success: true
          });
          successCount++;
          
        } catch (error) {
          console.error(`  ❌ Misslyckades: ${p.name} på ${vp.name}:`, error.message);
          results.push({
            page: p.name,
            viewport: vp.name,
            file: null,
            title: `${p.title} - ${vp.title}`,
            success: false,
            error: error.message
          });
          errorCount++;
        }
      }
      await ctx.close();
    }
    await browser.close();

    return generateMarkdown(results, successCount, errorCount);
    
  } catch (error) {
    console.error('❌ Browser fel:', error.message);
    console.log('💡 Försök med DEMO_MODE=true för att testa scriptet utan browser');
    throw error;
  }
}

function createMockScreenshots() {
  const results = [];
  let successCount = 0;
  
  for (const vp of viewports) {
    console.log(`\n📱 ${vp.title} (${vp.width}x${vp.height}) [MOCK]`);
    
    for (const p of pages) {
      console.log(`  📸 ${p.title} (${p.name})... [MOCK]`);
      
      // Skapa mock PNG (1x1 pixel transparent PNG)
      const mockPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      const file = path.join(OUT_DIR, `${p.name}-${vp.name}.png`);
      fs.writeFileSync(file, mockPng);
      
      console.log(`  ✅ Mock sparad: ${p.name}-${vp.name}.png`);
      results.push({
        page: p.name,
        viewport: vp.name,
        file: `${p.name}-${vp.name}.png`,
        title: `${p.title} - ${vp.title}`,
        success: true
      });
      successCount++;
    }
  }
  
  return generateMarkdown(results, successCount, 0);
}

function generateMarkdown(results, successCount, errorCount) {
  // Skapa index.md med strukturerad layout
  let markdownContent = `# UI Screenshots\n\n`;
  markdownContent += `**Genererade:** ${new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}\n`;
  markdownContent += `**Framgång:** ${successCount} av ${successCount + errorCount} screenshots\n\n`;
  
  // Gruppera per sida
  const pageNames = [...new Set(results.map(r => r.page))];
  for (const pageName of pageNames) {
    const pageResults = results.filter(r => r.page === pageName);
    const pageInfo = pages.find(p => p.name === pageName);
    
    markdownContent += `## ${pageInfo.title} (\`${pageInfo.url}\`)\n\n`;
    
    const viewportOrder = ['mobile', 'tablet', 'desktop'];
    for (const vpName of viewportOrder) {
      const result = pageResults.find(r => r.viewport === vpName);
      if (result) {
        if (result.success) {
          markdownContent += `### ${result.title}\n![${result.title}](./${result.file})\n\n`;
        } else {
          markdownContent += `### ${result.title}\n⚠️ **Fel:** ${result.error}\n\n`;
        }
      }
    }
  }
  
  fs.writeFileSync(path.join(OUT_DIR, 'index.md'), markdownContent, 'utf8');
  
  console.log(`\n📊 Sammanfattning: ${successCount} lyckade, ${errorCount} misslyckade screenshots`);
  console.log('📝 Genererat index.md med strukturerad layout');
}

function git(cmd) {
  return execSync(`git ${cmd}`, { stdio: 'pipe' }).toString().trim();
}

function ensureBranchAndPush() {
  const BRANCH = 'ui-screenshots';
  console.log(`\n🌿 Skapar/växlar till branch: ${BRANCH}`);
  
  try { 
    git(`fetch origin ${BRANCH}`); 
  } catch(e) { 
    console.log('  📥 Branch finns inte remote, skapar ny'); 
  }
  
  try { 
    git(`switch -C ${BRANCH}`); 
  } catch(e) { 
    git('switch -C ui-screenshots'); 
  }
  
  git('add ui-screenshots');
  
  // Konfigurera Git för automatisk commit
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  
  try { 
    git(`commit -m "Add UI screenshots ${RUN_ID}"`); 
    console.log('  ✅ Commit skapad');
  } catch(e) { 
    console.log('  ⚠️  Inga ändringar att committa'); 
  }
  
  git(`push -u origin ${BRANCH}`);
  console.log('  📤 Pushat till remote');
}

async function commentWithImages() {
  console.log(`\n💬 Skapar kommentar i issue #${ISSUE_NUMBER}`);
  
  const repoFull = git('config --get remote.origin.url')
    .replace(/^git@github.com:/, '')
    .replace(/^https:\/\/github.com\//, '')
    .replace(/\.git$/, '');
  const [owner, repo] = repoFull.split('/');
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN saknas. Kör: export GITHUB_TOKEN=$(gh auth token)');
  }

  const octokit = new Octokit({ auth: token });
  const baseRaw = `https://raw.githubusercontent.com/${owner}/${repo}/ui-screenshots/ui-screenshots/${RUN_ID}`;
  
  const indexPath = path.join(OUT_DIR, 'index.md');
  let body = `### UI screenshots (Tailwind 4 kontroll)\n\nBas-URL: ${BASE_URL}\n\n`;
  
  if (fs.existsSync(indexPath)) {
    let md = fs.readFileSync(indexPath, 'utf8');
    // Ta bort första rubriken eftersom vi har egen
    md = md.replace(/^# UI Screenshots\n\n/, '');
    // Byt lokala relative-länkar till rå-URL:er så de visar inline i kommentaren
    md = md.replace(/\!\[(.*?)\]\(\.\/(.*?)\)/g, (_, alt, file) => `![${alt}](${baseRaw}/${file})`);
    body += md;
  } else {
    body += '_Inga bilder genererades_';
  }

  await octokit.issues.createComment({ 
    owner, 
    repo, 
    issue_number: ISSUE_NUMBER, 
    body 
  });
  
  console.log('✅ Kommenterat i issue #' + ISSUE_NUMBER);
}

(async () => {
  await captureAll();
  ensureBranchAndPush();
  await commentWithImages();
})().catch(err => { 
  console.error('❌ Fel:', err); 
  process.exit(1); 
});