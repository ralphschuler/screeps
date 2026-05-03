---
name: screeps-world
description: Use when working with Screeps gameplay, live world state, bot strategy, Screeps API documentation, TypeScript types, community wiki patterns, or this repo's Screeps MCP servers. This skill is for fact-checking game mechanics, inspecting rooms, memory, market data, console output, and making safe bot development decisions.
---

# Screeps World

Use this skill for Screeps bot work that touches game mechanics, live game state, API calls, strategy, room operations, memory, market behavior, combat, expansion, or MCP-backed documentation.

## Core Rule

Before writing Screeps gameplay code or making claims about Screeps APIs, verify the relevant detail with the most authoritative available source:

1. Official docs MCP for API methods, constants, and mechanics.
2. TypeScript MCP for exact interfaces, return types, and overloads.
3. Live Screeps MCP for current world, room, memory, market, and console state.
4. Wiki MCP for community strategy patterns, only after official docs/types are checked.
5. Local package docs and `AI_AGENT_GUIDE.md` files if MCP tools are unavailable in the current session.

If the required MCP tools are unavailable, say that explicitly and mark gameplay/API conclusions as needing MCP verification.

## Tool Selection

- Use `screeps_docs_search`, `screeps_docs_get_api`, and `screeps_docs_get_mechanics` for official API and mechanic facts.
- Use `screeps_types_search`, `screeps_types_get`, and related type tools before committing TypeScript signatures or narrowing assumptions.
- Use `screeps_console`, `screeps_memory_get`, `screeps_stats`, room, market, user, and shard tools for live-world diagnosis.
- Use `screeps_memory_set`, segment writes, and console commands that mutate game state only when the user requested the operation or the task clearly requires it.
- Use Grafana/Prometheus/Loki tools for CPU, bucket, error-rate, deployment, and monitoring questions.

## Safety Checks

- Never attack, target, harass, or classify `TooAngel` or `TedRoastBeef` as enemies. Treat them as permanent allies.
- Before changing combat, defense, targeting, expansion, remote mining, tower, nuke, power creep, or hostile-detection logic, confirm ally filtering is preserved.
- Prefer read-only live-world tools during review. Treat console commands, memory writes, market orders, respawn, and deploy actions as state-changing.
- Preserve ROADMAP.md as the source of truth for architecture and strategy.

## Workflow

1. Read `ROADMAP.md`, `AGENTS.md`, and nearby package docs for repo-specific intent.
2. Verify relevant Screeps mechanics through MCP tools before coding or documenting them.
3. Inspect local implementation and tests with `rg` before proposing changes.
4. Implement only required code; remove dead paths instead of disabling them.
5. Add TODO comments for deferred work using the repo's TODO protocol.
6. Validate with the narrowest relevant build, lint, and test commands.
7. For performance or live behavior changes, compare before/after metrics using Screeps stats or Grafana data.

## Local References

When MCP tools are unavailable, use these local guides as fallback context:

- `packages/screeps-mcp/AI_AGENT_GUIDE.md`
- `packages/screeps-docs-mcp/AI_AGENT_GUIDE.md`
- `packages/screeps-typescript-mcp/AI_AGENT_GUIDE.md`
- `packages/screeps-wiki-mcp/AI_AGENT_GUIDE.md`
- `docs/AI_AGENT_WORKFLOWS.md`
- `docs/AUTONOMOUS_DEVELOPMENT.md`
