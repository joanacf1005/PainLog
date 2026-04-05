const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'dist', 'painlog-frontend', 'browser');
const src = path.join(dir, 'index.csr.html');
const dst = path.join(dir, 'index.html');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dst);
  console.log('Renamed index.csr.html to index.html');
} else {
  console.error('index.csr.html not found');
  process.exit(1);
}