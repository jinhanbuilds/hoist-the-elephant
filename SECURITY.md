# Security

Hoist the Elephant is an instruction-only Agent Skill. It bundles no executable product code, network client, telemetry, authentication flow, storage layer, or credentials.

## Important boundaries

- The Skill asks the Agent to reread relevant conversation context, which may contain sensitive information already visible to the current host.
- It does not authorize reading unrelated sources, editing files, deleting prior work, or creating persistent memory.
- The recovered mainline is presented for user confirmation; it is not silently promoted into project state or external systems.
- Do not copy private conversation content into public issues when reporting a behavioral failure. Use a minimized, redacted reproduction.

## Reporting a vulnerability

Prefer GitHub private vulnerability reporting. If it is unavailable, open a public issue without sensitive details and request a private reporting channel.
