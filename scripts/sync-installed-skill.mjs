#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
const skillName = packageJson.name;
const sourceRoot = join(repositoryRoot, 'skills', skillName);
const args = process.argv.slice(2);
const mode = args[0] || 'check';
const targetIndex = args.indexOf('--target');

if (!['check', 'sync'].includes(mode)) throw new Error('Usage: sync-installed-skill.mjs <check|sync> [--target <directory>]');
if (targetIndex >= 0 && (!args[targetIndex + 1] || args[targetIndex + 1].startsWith('--'))) {
  throw new Error('--target requires a directory');
}
const allowedArgs = new Set([mode, '--target', targetIndex >= 0 ? args[targetIndex + 1] : '']);
const unknownArgs = args.filter((arg) => !allowedArgs.has(arg));
if (unknownArgs.length) throw new Error(`Unknown arguments: ${unknownArgs.join(' ')}`);

const targetRoot = resolve(targetIndex >= 0
  ? args[targetIndex + 1]
  : join(homedir(), '.agents', 'skills', skillName));

if (basename(targetRoot) !== skillName || basename(dirname(targetRoot)) !== 'skills') {
  throw new Error(`Refusing unsafe target. Expected a path ending in skills/${skillName}.`);
}
if (targetRoot === sourceRoot || targetRoot === resolve(homedir()) || targetRoot === resolve('/')) {
  throw new Error('Refusing unsafe or source-equal target.');
}

function walk(root) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const name of readdirSync(root).sort()) {
    if (name === '.DS_Store') continue;
    const path = join(root, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

const managedFiles = walk(sourceRoot).map((path) => relative(sourceRoot, path));

if (mode === 'sync') {
  for (const file of managedFiles) {
    const destination = join(targetRoot, file);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(join(sourceRoot, file), destination);
  }
}

const drift = [];
for (const file of managedFiles) {
  const source = join(sourceRoot, file);
  const installed = join(targetRoot, file);
  if (!existsSync(installed)) drift.push({ file, state: 'missing' });
  else if (!readFileSync(source).equals(readFileSync(installed))) drift.push({ file, state: 'different' });
}

const managedSet = new Set(managedFiles);
const preservedExtras = walk(targetRoot)
  .map((path) => relative(targetRoot, path))
  .filter((file) => !managedSet.has(file));

const receipt = {
  ok: drift.length === 0,
  mode,
  source: sourceRoot,
  target: targetRoot,
  managed_files: managedFiles,
  drift,
  preserved_extra_files: preservedExtras,
};

process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
if (drift.length) process.exit(1);
