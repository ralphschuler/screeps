# Screeps Server Testing Guide

## Overview

Server tests use a real Dockerized Screeps private server. Mock server runners are not supported.

## Smoke Test

```bash
npm run test:server:smoke
```

The smoke test builds the bot and `screepsmod-testing`, starts the Docker server, uploads the bot, waits for in-game assertions, emits artifacts, and tears down volumes.

## Long Run

```bash
npm run test:server:long
```

The long run targets 2 hours wall time at the configured accelerated tick duration.

## Test Mod

`packages/screepsmod-testing` is required. It runs assertions inside the server runtime and writes results for the harness to inspect.

Required checks include bot spawn, room survival, creep population, CPU bucket health, and `Memory.creepTaskBoard` state.

## Artifacts

Artifacts are written to `packages/screeps-server/artifacts/<mode>/`.

## Cleanup

The harness always runs Docker cleanup with volume removal. Manual cleanup:

```bash
npm run server:ci:down
```
