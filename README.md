# Hoist the Elephant

[简体中文](README.zh-CN.md)

An explicit-only Agent Skill for re-anchoring a long conversation that has drifted through repeated local corrections.

> **When the elephant starts wobbling, stop pushing it. Hoist it.**

In a long conversation, each correction can be reasonable on its own while the overall direction moves farther from the real goal. The Agent responds to the latest feedback, overcorrects, gets corrected again, and gradually lets a local problem replace the higher-level mission.

Hoist the Elephant interrupts that momentum. It rereads the relevant conversation, restores the user-owned mission and accumulated understanding, separates governing principles from adjustable implementation choices, then pauses for confirmation before the original task continues.

[Read the full product story in Chinese](docs/product-story.zh-CN.md).

## When to use it

Invoke it when:

- every recent correction sounds right, but the result feels increasingly wrong;
- the Agent oscillates between two extremes;
- one bad example is turning into a growing set of permanent rules;
- accepted and rejected ideas have accumulated until the mainline is unclear;
- execution remains competent, but you suspect it is competently heading in the wrong direction.

## One-line install

```bash
npx skills add jinhanbuilds/hoist-the-elephant --skill hoist-the-elephant -y
```

This package follows the [Agent Skills specification](https://agentskills.io/specification). The command above uses the cross-host `skills` CLI; add `--agent <host>` when you need to select a supported host explicitly. For a manual install, copy `skills/hoist-the-elephant/` into a directory your host scans, such as `~/.agents/skills/hoist-the-elephant/` where the shared convention is supported.

The core `SKILL.md` is host-neutral. `skills/hoist-the-elephant/agents/openai.yaml` and `.codex-plugin/plugin.json` are optional OpenAI/ChatGPT/Codex metadata; compatible non-OpenAI hosts may ignore them. Re-anchoring requires access to the relevant conversation history; when that history is unavailable or conflicting, the Skill reports the gap instead of reconstructing it.

Reopen the Agent host after installation, then invoke it explicitly:

```text
$hoist-the-elephant
```

The Skill intentionally disables implicit invocation. Re-anchoring changes the basis of the active conversation, so the user should decide when to call it.

## What happens next

The Agent should:

1. Stop extending the current solution.
2. Reread the relevant conversation rather than trusting a short recap.
3. Recover the real mission, accumulated understanding, hard constraints, preferences, and rejected directions; if the visible history is insufficient or conflicting, state the gap and ask the user to correct it rather than pretending the mainline is complete.
4. Explain how local correction drift occurred only when doing so would help prevent another drift.
5. Restate the governing mainline with enough signal to guide the next response.
6. Pause and ask the user to confirm or correct the recovered anchor.

It does not automatically resume implementation after the reset.

## Boundaries

- It is not a generic summary or a request to return to the earliest message.
- It does not assume the oldest or newest instruction is automatically correct.
- It does not create a persistent memory, mission file, task database, or new project plan.
- It does not erase earlier work or modify source files.
- It does not silently choose a new direction; the user confirms the recovered mainline.

## Package contents

- `skills/hoist-the-elephant/` — the complete runtime Skill.
- `docs/product-story.zh-CN.md` — the original independent product story and mechanism.
- `.codex-plugin/plugin.json` — optional OpenAI/ChatGPT/Codex Plugin metadata.
- `scripts/` and `tests/` — package validation, reproducible release building, and maintainer-only local installation sync.

## Status and validation

Latest release: **[v0.1.0](https://github.com/jinhanbuilds/hoist-the-elephant/releases/tag/v0.1.0)**.

```bash
npm run validate
npm test
npm run build
```

Package checks establish structural integrity. Real value should be evaluated on long conversations where local corrections have actually created drift, using the user's confirmation of the recovered mainline as the central acceptance signal.

## License

[MIT](LICENSE) © 2026 Jinhan
