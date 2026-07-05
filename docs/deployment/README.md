# Deployment guide

The deploy path is `npm run push` / `npm run deploy`. Build-only validation is `npm run build`.

## Local deploy

1. Use Node.js 24:

   ```bash
   nvm use
   npm ci
   ```

2. Configure Screeps credentials. Preferred inputs are environment variables consumed by the bot Rollup deploy config:

   ```bash
   export SCREEPS_TOKEN=...
   export SCREEPS_BRANCH=main
   export SCREEPS_HOSTNAME=screeps.com
   ```

   Username/password variables are supported by the deploy tooling when token auth is not used. Do not commit credentials or `.env` files.

3. Validate before upload:

   ```bash
   npm run deploy:preflight
   npm run test:unit
   npm run lint:all
   ```

   `npm run deploy:preflight` runs dependency sync validation, alliance-safety checks, and a full repository build so framework package outputs exist before upload.

4. Upload:

   ```bash
   npm run push
   # same as: npm run deploy
   ```

`npm run build` prints deploy configuration but does not upload. `npm run push` sets `DEPLOY=true` and uploads through the Screeps API.

## GitHub Actions deploy

Workflow: `.github/workflows/deploy.yml`.

Deploy can run from `workflow_dispatch` or after the release workflow succeeds. It uses GitHub environments for server-specific variables/secrets. Every deploy job runs `npm run deploy:preflight` before the secret-scoped Screeps upload step.

Required environment variables/secrets:

- `SCREEPS_USER` (variable, when using password auth)
- `SCREEPS_PASS` (secret, when using password auth)
- `SCREEPS_TOKEN` (secret, preferred)
- `SCREEPS_PROTOCOL`
- `SCREEPS_HOSTNAME` (optional in GitHub Actions; the workflow falls back to its target hostname)
- `SCREEPS_PORT`
- `SCREEPS_PATH`
- `SCREEPS_BRANCH`

Configured environments include official and private servers such as `screeps.com`, `season.screeps.com`, `ptr.screeps.com`, and private-server targets. The deploy workflow provides a non-empty default hostname for each matrix target (`sim.screeps.com` uses `screeps.com` as the API host); environment variables can still override that hostname when needed. Only the production `screeps.com` matrix target is required to pass; optional simulation/community targets are allowed to fail without marking a successful production upload failed.

## Branch/environment mapping

The deploy target is controlled by `SCREEPS_BRANCH` and server variables. Keep production uploads explicit:

- local build: no upload,
- local push: current configured branch,
- GitHub deploy: selected environment variables/secrets.

## Dry-run behavior

```bash
npm run build
```

Build-only mode creates `packages/screeps-bot/dist/main.js`, checks bundle size, and prints deploy config with upload disabled.

## Rollback

1. Identify last known good commit or bundle.
2. Revert or check out the good code.
3. Run validation:

   ```bash
   npm run build
   npm run test:unit
   npm run test:server:smoke
   ```

4. Deploy with `npm run push`.
5. Monitor console/errors/stats for at least one creep lifecycle or the incident-specific window.

## Safety

- Do not deploy if build/typecheck/lint/unit tests fail unless reverting a production outage and the risk is documented.
- Do not deploy during active combat unless the change is a targeted combat/safety fix.
- Do not claim deploy success unless Screeps API upload completed successfully.
- Never deploy code that can target `TooAngel` or `TedRoastBeef`.
