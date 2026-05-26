# Spawn Extraction Status

Status: **complete**.

Canonical spawn ownership now lives in `@ralphschuler/screeps-spawn` (`packages/screeps-spawn/src`). The bot imports spawn APIs from that package and configures bot-specific adapters with `configureSpawnIntegration()` in `packages/screeps-bot/src/SwarmBot.ts`.

## Current ownership

- Module owner: `@ralphschuler/screeps-spawn`
- Bot role: shell + runtime adapter wiring
- Deleted duplicate: `packages/screeps-bot/src/spawning/`

## Validation

- `npm run build -w @ralphschuler/screeps-spawn`
- `npm run test:unit -w screeps-typescript-starter`
- `npm run build:bot`
