# Releasing Hoist the Elephant

## 1. Freeze the release identity

Keep the same semantic version in `VERSION`, `package.json`, `.codex-plugin/plugin.json`, and `CHANGELOG.md`. Confirm that the public repository remains `jinhanbuilds/hoist-the-elephant` and the runtime Skill still declares `hoist-the-elephant` with implicit invocation disabled.

## 2. Synchronize and check the installed Skill

The repository copy under `skills/hoist-the-elephant/` is the maintenance source. Update the local installation without deleting unrelated files, then verify every repository-managed file:

```bash
npm run sync:installed
npm run check:installed
```

Both commands use the current user's `.codex/skills/hoist-the-elephant/` directory. The sync command copies only files present in the repository Skill and preserves extra files already in the installation directory.

## 3. Validate and build

```bash
npm run release:check
npm run build
```

The build creates `dist/hoist-the-elephant-v<version>/`, its ZIP archive, a file manifest, and the ZIP checksum.

## 4. Verify the artifacts

From inside the release directory:

```bash
shasum -a 256 -c MANIFEST.sha256
```

From `dist/`:

```bash
shasum -a 256 -c CHECKSUMS.sha256
unzip -t hoist-the-elephant-v<version>.zip
```

## 5. Publish and verify the real remote

After reviewing the public file allowlist, create or connect the repository and push `main`. From an empty temporary directory, run:

```bash
npx skills add jinhanbuilds/hoist-the-elephant --skill hoist-the-elephant -y
```

Compare the installed Skill with `skills/hoist-the-elephant/`. Tag `v<version>` only after the GitHub URL resolves and the real remote-install check passes.
