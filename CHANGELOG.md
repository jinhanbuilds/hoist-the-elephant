# Changelog

## 0.1.0 - Release candidate

- Package Hoist the Elephant as an independent explicit-only Agent Skill.
- Preserve the original Chinese product story outside the runtime Skill folder.
- Add English and Chinese product introductions, MIT licensing, Plugin metadata, CI, release manifests, and checksums.
- Keep the runtime behavior non-persistent and confirmation-gated.
- Preserve unknowns when visible conversation history is insufficient or conflicting, without turning re-anchoring into a fixed output template.
- Add repository-to-installed-Skill drift checking and non-destructive synchronization commands.
- Document the host-neutral Agent Skills boundary and relevant-history capability requirement.
- Default maintainer installation sync to the shared `~/.agents/skills/` convention while retaining explicit host-native targets.
- Replace author-workstation safety markers with generic public-package path checks.
- Keep repository release checks independent from any maintainer-local Skill installation.
