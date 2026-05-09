---
name: screeps-world
description: Use when working with Screeps gameplay, bot strategy, local/private-server validation, Screeps API docs/types, community patterns, or safe bot development decisions in this repo.
---

# Screeps World

Use this skill for Screeps bot work that touches game mechanics, API calls, strategy, room ops, memory, market behavior, combat, expansion, or runtime validation.

## Core Rule

Before writing Screeps gameplay code or making API/mechanics claims, verify the detail with the most authoritative available local/reference source:

1. Local TypeScript definitions: `node_modules/@types/screeps/index.d.ts`.
2. Official Screeps docs via web search when local types are insufficient.
3. Local bot/framework/package docs and tests.
4. Community wiki/articles for strategy patterns only, after API facts are checked.
5. Local private-server smoke/long simulations for runtime behavior.

## Related Skills

- Use `screeps-api-reference` for API/type/mechanics fact-checking.
- Use `screeps-private-server` for local server startup, smoke tests, long simulations, auth/bind, artifacts, and screepsmod-testing assertions.

## Safety Checks

- Never attack, target, harass, or classify `TooAngel` or `TedRoastBeef` as enemies. Treat them as permanent allies.
- Before changing combat, defense, targeting, expansion, remote mining, tower, nuke, power creep, or hostile-detection logic, confirm ally filtering is preserved.
- Prefer read-only inspection during review. Treat console commands, memory writes, market orders, respawn, and deploy actions as state-changing.
- Preserve ROADMAP.md as the source of truth for architecture and strategy.

## Workflow

1. Read `ROADMAP.md`, `AGENTS.md`, and nearby package docs for repo-specific intent.
2. Verify relevant Screeps API/types through local types or official docs before coding/documenting.
3. Inspect local implementation and tests with `rg` before proposing changes.
4. Implement only required code; remove dead paths instead of disabling them.
5. Add TODO comments for deferred work using the repo's TODO protocol.
6. Validate with the narrowest relevant build, lint, and test commands.
7. For runtime/performance changes, use private-server smoke/long tests and inspect artifacts under `packages/screeps-server/artifacts/`.

## Local References

- `node_modules/@types/screeps/index.d.ts`
- `packages/screeps-server/README.md`
- `packages/screeps-server/INTEGRATION_TEST_GUIDE.md`
- `packages/screeps-server/TESTING_GUIDE.md`
- `packages/screeps-server/PERFORMANCE_TESTING_GUIDE.md`
- `packages/screepsmod-testing/`
- `docs/AI_AGENT_WORKFLOWS.md`
- `docs/AUTONOMOUS_DEVELOPMENT.md`
