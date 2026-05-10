---
name: screeps-api-reference
description: Use when fact-checking Screeps API, constants, TypeScript game types, game mechanics, or community strategy using local references.
---

# Screeps API Reference

Use this skill for Screeps gameplay/API/type/strategy fact-checking using local references.

## Source Order

1. Installed TypeScript types: `node_modules/@types/screeps/index.d.ts`.
2. Local bot/framework code and tests in `packages/`.
3. Repo docs: `ROADMAP.md`, `FRAMEWORK.md`, and package READMEs.
4. Official/current web docs only when local types/docs are insufficient.
5. Community wiki/articles for strategy patterns only; verify API facts against types or official docs.

## Workflow

1. Read `ROADMAP.md`, `AGENTS.md`, and nearby package docs.
2. Search local types before coding API calls:

```bash
rg "interface Creep|declare const FIND_|type BodyPartConstant" node_modules/@types/screeps/index.d.ts
```

3. Search existing implementation/tests:

```bash
rg "moveTo|RoomPosition|StructureTower" packages
```

4. If local references are insufficient, use web search for official Screeps docs and cite URLs in the final answer.
5. Implement only required code; remove dead paths instead of disabling them.
6. Validate with focused build/lint/test commands.

## Type Lookup Tips

Useful local type names:

- `Game`, `Memory`, `RawMemory`
- `Creep`, `PowerCreep`
- `Room`, `RoomPosition`, `RoomObject`
- `StructureSpawn`, `StructureTower`, `StructureController`, `StructureStorage`, `StructureTerminal`
- `Source`, `Mineral`, `Deposit`, `Resource`
- `PathFinder`, `CostMatrix`, `RoomVisual`
- constants such as `FIND_*`, `STRUCTURE_*`, `RESOURCE_*`, `ERR_*`, `OK`

## Live/Runtime Checks

Prefer the private-server test harness for runtime validation:

```bash
npm run test:server:smoke
```

For interactive local server work, use the `screeps-private-server` skill.

## Strategy Checks

Community patterns are useful for:

- spawn queues
- remote mining
- path caching
- tower targeting
- market heuristics
- room planning

But project rules override generic advice:

- ROADMAP.md is source of truth.
- Keep required code only.
- Preserve ally safety for `TooAngel` and `TedRoastBeef`.
- Use measured private-server results over assumptions.

## Output Contract

When making API/gameplay claims, include:

- local type/doc path or URL checked
- exact API/type names relied on
- validation command run or skipped reason
