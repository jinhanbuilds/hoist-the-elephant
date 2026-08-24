#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function walk(root) {
  const files = [];
  for (const name of readdirSync(root).sort()) {
    if (['.git', 'dist', 'node_modules'].includes(name)) continue;
    const path = join(root, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function requireFile(path, label = relative(repositoryRoot, path)) {
  if (!existsSync(path)) errors.push(`missing ${label}`);
}

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
]) requireFile(join(repositoryRoot, name));
requireFile(join(repositoryRoot, '.codex-plugin', 'plugin.json'));
requireFile(join(repositoryRoot, 'docs', 'product-story.zh-CN.md'));

const versionPath = join(repositoryRoot, 'VERSION');
const packagePath = join(repositoryRoot, 'package.json');
const pluginPath = join(repositoryRoot, '.codex-plugin', 'plugin.json');
if (!existsSync(versionPath) || !existsSync(packagePath) || !existsSync(pluginPath)) {
  errors.push('cannot continue metadata validation because release metadata is incomplete');
} else {
  const version = readFileSync(versionPath, 'utf8').trim();
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const plugin = JSON.parse(readFileSync(pluginPath, 'utf8'));
  const skillName = packageJson.name;
  const skillRoot = join(repositoryRoot, 'skills', skillName);
  const skillPath = join(skillRoot, 'SKILL.md');
  const metadataPath = join(skillRoot, 'agents', 'openai.yaml');

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skillName)) errors.push('package name must be kebab-case');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) errors.push('VERSION must be semver');
  if (packageJson.version !== version) errors.push('package.json version differs from VERSION');
  if (plugin.version !== version) errors.push('plugin.json version differs from VERSION');
  if (plugin.name !== skillName) errors.push('plugin name differs from package/Skill name');
  if (plugin.skills !== './skills/') errors.push('plugin skills path must be ./skills/');

  requireFile(skillPath);
  requireFile(metadataPath);
  if (existsSync(skillPath)) {
    const skill = readFileSync(skillPath, 'utf8');
    const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatter) errors.push(`${skillName}/SKILL.md is missing YAML frontmatter`);
    else {
      const declaredName = frontmatter[1].match(/^name:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]?.trim();
      if (declaredName !== skillName) errors.push(`${skillName}/SKILL.md declares name ${declaredName || '(missing)'}`);
      if (!/^description:\s*.+/m.test(frontmatter[1])) errors.push(`${skillName}/SKILL.md is missing description`);
    }
  }
  if (existsSync(metadataPath)) {
    const metadata = readFileSync(metadataPath, 'utf8');
    if (!metadata.includes(`$${skillName}`)) errors.push(`${skillName}/agents/openai.yaml default prompt must mention $${skillName}`);
  }
  if (existsSync(join(skillRoot, 'README.md'))) errors.push(`${skillName} contains an auxiliary README.md inside the runtime Skill folder`);

  const expectedInstall = `npx skills add jinhanbuilds/${skillName} --skill ${skillName} -y`;
  const expectedSharedPath = `~/.agents/skills/${skillName}/`;
  for (const readmeName of ['README.md', 'README.zh-CN.md']) {
    const readmePath = join(repositoryRoot, readmeName);
    if (!existsSync(readmePath)) continue;
    const readme = readFileSync(readmePath, 'utf8');
    if (!readme.includes(expectedInstall)) errors.push(`${readmeName} is missing the exact remote install command`);
    if (!readme.includes('https://agentskills.io/specification')) errors.push(`${readmeName} is missing the Agent Skills specification link`);
    if (!readme.includes(expectedSharedPath)) errors.push(`${readmeName} is missing the shared skills path`);
  }
}

const textExtensions = new Set(['.md', '.json', '.yaml', '.yml', '.mjs', '.js', '.html', '.css', '.txt']);
const forbidden = [
  /(?:^|[\s"'\x60=(])\/Users\/[^/\s"'\x60]+(?:\/|$)/m,
  /(?:^|[\s"'\x60=(])\/home\/[^/\s"'\x60]+(?:\/|$)/m,
  /(?:^|[\s"'\x60=(])[A-Za-z]:\\Users\\[^\\\r\n"'\x60]+(?:\\|$)/m,
  /file:\/\/\/(?:Users|home)\//,
  /file:\/\/\/[A-Za-z]:\/Users\//,
  /(?:^|[\s"'\x60=(])LocalProjects\/[^\s"'\x60]+/m,
  /(?:^|[\s"'\x60=(])(?:\.\.\/)*private\/[^\s"'\x60]+/m,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
];
for (const path of walk(repositoryRoot)) {
  const rel = relative(repositoryRoot, path);
  if (rel.endsWith('.DS_Store')) errors.push(`unwanted file ${rel}`);
  if (!textExtensions.has(extname(path).toLowerCase())) continue;
  const content = readFileSync(path, 'utf8');
  if (forbidden.some((pattern) => pattern.test(content))) errors.push(`public-safety scan failed for ${rel}`);
}

if (errors.length) {
  process.stderr.write(`Package validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}\n`);
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
process.stdout.write(`${JSON.stringify({ ok: true, version: packageJson.version, skill: packageJson.name }, null, 2)}\n`);
