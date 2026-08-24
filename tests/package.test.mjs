import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
const skillName = packageJson.name;

test('package validation passes', () => {
  const result = spawnSync(process.execPath, [join(repositoryRoot, 'scripts', 'validate-package.mjs')], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('release build contains the complete Skill, product story, and manifest', () => {
  const output = mkdtempSync(join(tmpdir(), `${skillName}-release-`));
  try {
    const result = spawnSync(process.execPath, [join(repositoryRoot, 'scripts', 'build-release.mjs'), '--output', output, '--no-zip'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const receipt = JSON.parse(result.stdout);
    assert.equal(existsSync(join(receipt.package_root, 'skills', skillName, 'SKILL.md')), true);
    assert.equal(existsSync(join(receipt.package_root, 'docs', 'product-story.zh-CN.md')), true);
    const manifest = readFileSync(join(receipt.package_root, 'MANIFEST.sha256'), 'utf8');
    assert.match(manifest, new RegExp(`skills/${skillName}/SKILL\\.md`));
    assert.match(manifest, /docs\/product-story\.zh-CN\.md/);
    assert.match(manifest, /\.codex-plugin\/plugin\.json/);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});

test('installed-Skill sync repairs managed drift without deleting extra files', () => {
  const installation = mkdtempSync(join(tmpdir(), `${skillName}-installed-`));
  try {
    mkdirSync(join(installation, 'agents'), { recursive: true });
    writeFileSync(join(installation, 'SKILL.md'), 'stale\n', 'utf8');
    writeFileSync(join(installation, 'README.md'), 'preserve me\n', 'utf8');

    const before = spawnSync(process.execPath, [
      join(repositoryRoot, 'scripts', 'sync-installed-skill.mjs'),
      'check',
      '--target',
      installation,
    ], { cwd: repositoryRoot, encoding: 'utf8' });
    assert.notEqual(before.status, 0);

    const sync = spawnSync(process.execPath, [
      join(repositoryRoot, 'scripts', 'sync-installed-skill.mjs'),
      'sync',
      '--target',
      installation,
    ], { cwd: repositoryRoot, encoding: 'utf8' });
    assert.equal(sync.status, 0, sync.stderr || sync.stdout);
    const receipt = JSON.parse(sync.stdout);
    assert.deepEqual(receipt.drift, []);
    assert.deepEqual(receipt.preserved_extra_files, ['README.md']);

    assert.equal(
      readFileSync(join(installation, 'SKILL.md'), 'utf8'),
      readFileSync(join(repositoryRoot, 'skills', skillName, 'SKILL.md'), 'utf8'),
    );
    assert.equal(readFileSync(join(installation, 'README.md'), 'utf8'), 'preserve me\n');
  } finally {
    rmSync(installation, { recursive: true, force: true });
  }
});
