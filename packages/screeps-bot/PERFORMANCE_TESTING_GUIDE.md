# Performance Testing Guide

Performance tests now run against the real Dockerized Screeps private server.

Use:

```bash
npm run test:server:smoke
npm run test:server:long
```

CI uses a short smoke test for PRs and a manual/nightly two-hour long run. `screepsmod-testing` provides in-game assertions and result artifacts.
