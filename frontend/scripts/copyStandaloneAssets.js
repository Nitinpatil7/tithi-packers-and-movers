const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');

const copyIfExists = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
};

if (!fs.existsSync(standaloneDir)) {
  throw new Error('Standalone output was not found. Run this script after next build.');
}

copyIfExists(path.join(root, 'public'), path.join(standaloneDir, 'public'));
copyIfExists(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));
