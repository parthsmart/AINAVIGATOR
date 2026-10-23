import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST_ASSETS = path.resolve(process.cwd(), 'dist', 'assets');

// Enforced Performance Budgets (Gzipped KB) for throttled mid-range Android phone (Moto G4 / Slow 4G)
const BUDGETS = {
  maxEntryOrVendorGzipKb: 150,
  maxRouteChunkGzipKb: 40,
  maxTotalCssGzipKb: 20,
};

if (!fs.existsSync(DIST_ASSETS)) {
  console.error(`Error: ${DIST_ASSETS} not found. Run "npm run build" before checking bundle budgets.`);
  process.exit(1);
}

const files = fs.readdirSync(DIST_ASSETS);
let totalCssGzipKb = 0;
let initialJsGzipKb = 0;
let hasFailure = false;

console.log('--- Performance Budget Report (Gzipped) ---');

for (const file of files) {
  const fullPath = path.join(DIST_ASSETS, file);
  const stat = fs.statSync(fullPath);
  if (!stat.isFile()) continue;

  const content = fs.readFileSync(fullPath);
  const gzipBytes = zlib.gzipSync(content).length;
  const gzipKb = Number((gzipBytes / 1024).toFixed(2));
  const rawKb = Number((content.length / 1024).toFixed(2));

  if (file.endsWith('.js')) {
    const isEntryOrVendor = file.startsWith('index-') || file.startsWith('vendor-');
    if (
      file.startsWith('index-') ||
      file.startsWith('vendor-core-') ||
      file.startsWith('vendor-i18n-') ||
      file.startsWith('vendor-query-')
    ) {
      initialJsGzipKb = Number((initialJsGzipKb + gzipKb).toFixed(2));
    }
    const budget = isEntryOrVendor ? BUDGETS.maxEntryOrVendorGzipKb : BUDGETS.maxRouteChunkGzipKb;
    const status = gzipKb <= budget ? 'PASS' : 'FAIL';
    console.log(
      `[${status}] JS ${isEntryOrVendor ? '(entry/vendor)' : '(route chunk)'} ${file}: ${gzipKb} KB gzip (${rawKb} KB raw) / budget <= ${budget} KB`
    );
    if (gzipKb > budget) {
      hasFailure = true;
    }
  } else if (file.endsWith('.css')) {
    totalCssGzipKb = Number((totalCssGzipKb + gzipKb).toFixed(2));
    console.log(`[INFO] CSS ${file}: ${gzipKb} KB gzip (${rawKb} KB raw)`);
  }
}

const initialStatus = initialJsGzipKb <= BUDGETS.maxEntryOrVendorGzipKb ? 'PASS' : 'FAIL';
console.log(
  `[${initialStatus}] Total Initial Critical JS: ${initialJsGzipKb} KB gzip / budget <= ${BUDGETS.maxEntryOrVendorGzipKb} KB`
);
if (initialJsGzipKb > BUDGETS.maxEntryOrVendorGzipKb) {
  hasFailure = true;
}

const cssStatus = totalCssGzipKb <= BUDGETS.maxTotalCssGzipKb ? 'PASS' : 'FAIL';
console.log(
  `[${cssStatus}] Total CSS: ${totalCssGzipKb} KB gzip / budget <= ${BUDGETS.maxTotalCssGzipKb} KB`
);
if (totalCssGzipKb > BUDGETS.maxTotalCssGzipKb) {
  hasFailure = true;
}

if (hasFailure) {
  console.error('Bundle size budget check FAILED.');
  process.exit(1);
}

console.log('All performance bundle budgets PASSED.');
