# Bot Integration Testing

Bot integration testing uses the real Dockerized Screeps private-server harness from `packages/screeps-server`.

Run locally:

```bash
npm run build
npm run build:mod
npm run test:server:smoke
```

The testing mod `packages/screepsmod-testing` is loaded by the server and performs in-game state assertions. Add assertions in `packages/screepsmod-testing/src/suites/`.
