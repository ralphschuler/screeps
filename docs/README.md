# Project documentation

This directory is the entry point for maintained documentation. Legacy reports and historical summaries may still exist in the repository; prefer the pages below for current setup and architecture.

## Current documentation map

- [Architecture](architecture/README.md) — framework-first architecture, package responsibilities, lifecycle, memory/cache, CPU strategy.
- [Development](development/README.md) — local workflow, framework-first placement, validation gates.
- [Testing](testing/README.md) — unit, integration, private-server, quality gates, and mocking conventions.
- [Deployment](deployment/README.md) — local deploy, GitHub Actions deploy, secrets, dry runs, rollback.
- [Operations](operations/README.md) — monitoring, stats, CPU/bucket expectations, runtime triage.
- [Game strategy](game-strategy/README.md) — economy-first doctrine, remotes, defense, expansion, combat, labs, market, intershard.
- [Packages](packages/README.md) — package purpose, dependency boundaries, and test commands.
- [ADRs](adr/README.md) — architecture decision records only.
- [Framework guide](framework/README.md) — framework package usage and contribution notes.

## Source of truth

- `ROADMAP.md` governs gameplay strategy and swarm architecture.
- `AGENTS.md` governs agent/development workflow and safety rules.
- `package.json` scripts are authoritative for local commands.
- Package `README.md` files document package-specific public APIs.

## Documentation build

```bash
npm run build:docs
```

The build aggregates docs into `wiki/` for GitHub wiki publishing. `wiki/` is generated output and should not be hand-edited.

## Writing rules

- Add clear titles to every Markdown file.
- Prefer relative links.
- Keep setup instructions aligned with Node.js 24 and npm workspaces.
- Put new architecture decisions in `docs/adr/` only when they record a real decision and trade-off.
- Keep package-specific details in package README/docs; link from `docs/packages/README.md`.
