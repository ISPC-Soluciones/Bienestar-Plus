import { chromium } from '@playwright/test';
import lighthouse, { generateReport } from 'lighthouse';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Set ${name} in the local test environment before running Lighthouse.`);
  }
  return value;
}

const baseUrl = (process.env.E2E_BASE_URL || 'http://localhost:4200').replace(/\/$/, '');
const email = requiredEnvironment('E2E_TEST_EMAIL');
const password = requiredEnvironment('E2E_TEST_PASSWORD');
const port = Number(process.env.LIGHTHOUSE_REMOTE_DEBUGGING_PORT || 9333);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('LIGHTHOUSE_REMOTE_DEBUGGING_PORT must be an integer between 1024 and 65535.');
}

const evidenceDirectory = path.resolve(process.cwd(), '../reports/lighthouse');
await mkdir(evidenceDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [`--remote-debugging-port=${port}`, '--remote-allow-origins=*'],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`);
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL(/\/perfil\/\d+/);
  await page.goto(`${baseUrl}/habitos`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(evidenceDirectory, 'habitos.png'),
    fullPage: true,
  });

  const audit = await lighthouse(`${baseUrl}/habitos`, {
    port,
    output: 'json',
    onlyCategories: ['accessibility'],
    logLevel: 'error',
  });
  await writeFile(
    path.join(evidenceDirectory, 'habitos.report.json'),
    JSON.stringify(audit.lhr, null, 2),
    'utf8',
  );
  await writeFile(
    path.join(evidenceDirectory, 'habitos.report.html'),
    generateReport(audit.lhr, 'html'),
    'utf8',
  );

  const score = Math.round(audit.lhr.categories.accessibility.score * 100);
  console.log(`Lighthouse accessibility for Habitos: ${score}/100`);
  if (score < 90) process.exitCode = 1;
} finally {
  await browser.close();
}
