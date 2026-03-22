const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.resolve(rootDir, '..', 'order-frontend', 'dist');
const targetDir = path.resolve(rootDir, 'web');

function assertDirectoryExists(dirPath, label) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`${label} not found: ${dirPath}`);
  }
}

function ensureCleanDirectory(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectoryContents(fromDir, toDir) {
  const entries = fs.readdirSync(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(toPath, { recursive: true });
      copyDirectoryContents(fromPath, toPath);
      continue;
    }

    fs.copyFileSync(fromPath, toPath);
  }
}

function main() {
  assertDirectoryExists(sourceDir, 'Web dist directory');
  ensureCleanDirectory(targetDir);
  copyDirectoryContents(sourceDir, targetDir);
  console.log(`Synced web assets: ${sourceDir} -> ${targetDir}`);
}

main();
