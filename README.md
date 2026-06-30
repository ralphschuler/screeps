# Screeps Ant Swarm

TypeScript Screeps bot and reusable framework packages for a swarm-style, multi-room empire. The repository is an npm-workspaces monorepo: framework packages own reusable behavior, while `packages/screeps-bot` composes and deploys the runtime bundle.

## Quick start

```bash
nvm use
npm ci
npm run verify
```

Node.js 24 is the supported local, CI, and deploy baseline.

## Repository layout

```text
packages/screeps-bot/                  Runtime composition, config, Rollup bundle, deploy adapter
packages/@ralphschuler/screeps-core/   Core primitives, logging, events, alliance safety
packages/@ralphschuler/screeps-*       Framework packages: cache, kernel, memory, roles, etc.
packages/screeps-{spawn,economy,...}/  Additional framework packages
packages/screeps-server/               Dockerized private-server validation harness
packages/screepsmod-testing/           In-game private-server assertions/mod
docs/                                  Architecture, testing, deployment, operations, strategy docs
ROADMAP.md                             Swarm strategy and architecture source of truth
```

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run check-versions` | Verify Node/npm baseline. |
| `npm run sync:deps:check` | Check shared framework dependency sync. |
| `npm run build` | Build framework packages and bot bundle. |
| `npm run typecheck` | Typecheck workspaces with configured scripts. |
| `npm run lint:all` | Lint bot and core framework packages. |
| `npm test` / `npm run test:unit` | Run main bot tests. |
| `npm run test:all` | Run every workspace test script. |
| `npm run test:server:smoke` | Run Dockerized private-server smoke validation. |
| `npm run build:docs` | Build wiki documentation output. |
| `npm run verify` | Main local quality gate. |
| `npm run push` / `npm run deploy` | Build and upload to Screeps when credentials are configured. |

## Architecture rule: framework first

Shared behavior belongs in framework packages, not in the runtime bot package.

- Roles/state machines → `@ralphschuler/screeps-roles`
- Spawn planning/queues → `@ralphschuler/screeps-spawn`
- Economy/market/terminal/link logic → `@ralphschuler/screeps-economy`
- Defense/towers/safe mode/threat scoring → `@ralphschuler/screeps-defense`
- Memory schema/migrations → `@ralphschuler/screeps-memory`
- Cache/TTL utilities → `@ralphschuler/screeps-cache`
- Pathfinding/route helpers → `@ralphschuler/screeps-pathfinding`
- Room blueprint/stamp planning → `@ralphschuler/screeps-layouts`
- Runtime wiring/config/deploy only → `packages/screeps-bot`

Permanent ally safety is mandatory: never target or attack `TooAngel` or `TedRoastBeef`.

## Deploy

Configure Screeps credentials through environment variables or the package `.env` flow, then run:

```bash
npm run push
```

`npm run build` is safe build-only mode. `npm run push` sets `DEPLOY=true` and uploads the bundle to the configured Screeps branch.

## Documentation

Start with:

- [Docs index](docs/README.md)
- [Architecture overview](docs/architecture/README.md)
- [Stamp blueprint planner](docs/architecture/stamp-blueprint-planner.md)
- [Testing guide](docs/testing/README.md)
- [Deployment guide](docs/deployment/README.md)
- [Operations guide](docs/operations/README.md)
- [Game strategy](docs/game-strategy/README.md)
- [Package index](docs/packages/README.md)
- [ADRs](docs/adr/README.md)
- [Roadmap](ROADMAP.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes small, tested, and framework-first. Do not commit credentials, Screeps tokens, private server secrets, Memory dumps, or generated sensitive artifacts.
