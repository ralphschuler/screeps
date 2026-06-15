# Server Test Directory

The legacy mock-server helper has been removed. Server validation now happens through the real Docker private-server harness and strict `screepsmod-testing` runtime assertions.

Use:

```bash
npm run test:server:smoke
npm run test:server:long
```

Package-only tests may remain under `test/packages/` when they do not require a game server. Runtime-suitable behavior should get a private-server assertion equivalent rather than replacing existing Node/unit coverage.
