# Releasing Hoist the Elephant

## 1. Freeze the release identity

Keep the same semantic version in `VERSION`, `package.json`, `.codex-plugin/plugin.json`, and `CHANGELOG.md`. Confirm that the public repository remains `jinhanbuilds/hoist-the-elephant` and the runtime Skill still declares `hoist-the-elephant` with implicit invocation disabled.

## 2. Optionally check a maintainer installation

The repository copy under `skills/hoist-the-elephant/` is the maintenance source. A maintainer may compare or update a local installation when needed:

```bash
npm run check:installed
npm run sync:installed
```

These maintainer-only commands default to the shared `~/.agents/skills/hoist-the-elephant/` directory. To check a host-native installation instead, pass `-- --target <host-skills>/hoist-the-elephant` to either npm command. The sync command copies only files present in the repository Skill and preserves extra files already in the installation directory.

This local-install check is not a repository publication gate. Do not create or modify a global Skill installation merely to publish the GitHub source or release artifacts.

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
