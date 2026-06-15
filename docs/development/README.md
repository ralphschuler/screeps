# Development guide

## Baseline

Use Node.js 24 and npm workspaces:

```bash
nvm use
npm ci
npm run check-versions
npm run sync:deps:check
```

## Workflow

See the active [refactor plan](refactor-plan.md) for prioritized framework-first cleanup work.

1. Read `ROADMAP.md`, `AGENTS.md`, and the relevant package README.
2. Add or update a behavior-focused test near the package.
3. Implement the smallest framework-first change.
4. Run targeted package validation.
5. Run broader gates before deploy/PR.

## Framework-first placement

- Shared behavior goes in framework packages.
- `packages/screeps-bot` is runtime wiring/config/adaptation only.
- Package APIs should be small and exported from `src/index.ts`.
- Do not add bot-local copies of role/economy/spawn/defense/pathfinding utilities.

## Targeted commands

```bash
npm run build -w @ralphschuler/screeps-roles
npm test -w @ralphschuler/screeps-roles
npm run lint -w screeps-typescript-starter -- --max-warnings=0
npm run build -w screeps-typescript-starter
```

## Full gate

```bash
npm run build
npm run typecheck
npm run lint:all
npm run test:all
npm run test:server:smoke
npm run build:docs
```

## Generated files

Do not hand-edit generated outputs:

- `wiki/` documentation build output,
- coverage directories,
- private-server artifacts unless updating intentional checked-in fixtures/reports,
- TypeScript/Rollup `dist/` except intentionally tracked Screeps bundle/mod outputs.

## Safety

- Never commit credentials or Memory dumps.
- Preserve ally filtering for `TooAngel` and `TedRoastBeef`.
- Use private-server smoke for runtime behavior changes.
