#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const noZip = args.includes('--no-zip');
const outputIndex = args.indexOf('--output');
if (outputIndex >= 0 && (!args[outputIndex + 1] || args[outputIndex + 1].startsWith('--'))) {
  throw new Error('--output requires a directory');
}
const outputBase = resolve(outputIndex >= 0 ? args[outputIndex + 1] : join(repositoryRoot, 'dist'));
const unknown = args.filter((value, index) => value !== '--no-zip' && value !== '--output' && index !== outputIndex + 1);
if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(' ')}`);

const validation = spawnSync(process.execPath, [join(repositoryRoot, 'scripts', 'validate-package.mjs')], { encoding: 'utf8' });
if (validation.status !== 0) throw new Error(validation.stderr || validation.stdout || 'package validation failed');

const packageJson = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
const version = readFileSync(join(repositoryRoot, 'VERSION'), 'utf8').trim();
const packageName = `${packageJson.name}-v${version}`;
const packageRoot = join(outputBase, packageName);

function walk(root) {
  const files = [];
  for (const name of readdirSync(root).sort()) {
    if (name === '.DS_Store') continue;
    const path = join(root, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

rmSync(packageRoot, { recursive: true, force: true });
mkdirSync(packageRoot, { recursive: true });
for (const name of [
  'README.md',
  'README.zh-CN.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'RELEASING.md',
  'SECURITY.md',
  'VERSION',
  'package.json',
]) cpSync(join(repositoryRoot, name), join(packageRoot, name));
for (const name of ['.codex-plugin', 'skills', 'docs', 'scripts', 'tests']) {
  cpSync(join(repositoryRoot, name), join(packageRoot, name), {
    recursive: true,
    filter: (source) => basename(source) !== '.DS_Store',
  });
}

const manifest = walk(packageRoot)
  .map((path) => `${sha256(path)}  ${relative(packageRoot, path)}`)
  .join('\n');
writeFileSync(join(packageRoot, 'MANIFEST.sha256'), `${manifest}\n`, 'utf8');

let zipPath = null;
if (!noZip) {
  zipPath = join(outputBase, `${packageName}.zip`);
  rmSync(zipPath, { force: true });
  const zip = spawnSync('zip', ['-qr', zipPath, packageName], { cwd: outputBase, encoding: 'utf8' });
  if (zip.status !== 0) throw new Error(zip.stderr || zip.stdout || 'zip creation failed');
  writeFileSync(join(outputBase, 'CHECKSUMS.sha256'), `${sha256(zipPath)}  ${basename(zipPath)}\n`, 'utf8');
}

process.stdout.write(`${JSON.stringify({ ok: true, version, skill: packageJson.name, package_root: packageRoot, zip: zipPath, files: walk(packageRoot).length }, null, 2)}\n`);
