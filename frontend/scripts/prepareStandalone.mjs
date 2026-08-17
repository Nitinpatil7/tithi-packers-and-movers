import fs from 'fs';
import path from 'path';

const appName = process.argv[2];

if (process.env.VERCEL === '1') {
  console.log(`Skipping standalone preparation for ${appName || 'app'} on Vercel.`);
  process.exit(0);
}

if (!appName) {
  console.error('Usage: node ../../scripts/prepareStandalone.mjs <app-name>');
  process.exit(1);
}

const appDir = process.cwd();
const nextDir = path.join(appDir, '.next');
const standaloneAppDir = path.join(nextDir, 'standalone', 'apps', appName);
const standaloneNextDir = path.join(standaloneAppDir, '.next');

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) return false;
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  return true;
}

if (!fs.existsSync(path.join(standaloneAppDir, 'server.js'))) {
  console.error(`Standalone server not found for ${appName}. Run npm run build first.`);
  process.exit(1);
}

const requiredCopies = [
  ['server', path.join(nextDir, 'server'), path.join(standaloneNextDir, 'server')],
  ['static', path.join(nextDir, 'static'), path.join(standaloneNextDir, 'static')],
  ['BUILD_ID', path.join(nextDir, 'BUILD_ID'), path.join(standaloneNextDir, 'BUILD_ID')],
  ['routes-manifest.json', path.join(nextDir, 'routes-manifest.json'), path.join(standaloneNextDir, 'routes-manifest.json')],
  ['prerender-manifest.json', path.join(nextDir, 'prerender-manifest.json'), path.join(standaloneNextDir, 'prerender-manifest.json')],
  ['required-server-files.json', path.join(nextDir, 'required-server-files.json'), path.join(standaloneNextDir, 'required-server-files.json')],
  ['public', path.join(appDir, 'public'), path.join(standaloneAppDir, 'public')],
];

const copied = requiredCopies
  .filter(([, from, to]) => copyIfExists(from, to))
  .map(([label]) => label);

const manifestPath = path.join(standaloneNextDir, 'server', 'middleware-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`Standalone middleware manifest still missing: ${manifestPath}`);
  process.exit(1);
}

console.log(`Prepared standalone ${appName}: ${copied.join(', ')}`);
