# Screeps Utilities

This directory contains utility scripts for managing your Screeps bot.

## Auto-Respawner

The auto-respawner automatically detects when your account has lost all spawns and respawns you in the best available location.

### How It Works

1. **Status Check**: Queries the Screeps API to check your world status
2. **Respawn Detection**: If status is `empty` or `lost`, initiates respawn
3. **Shard Selection**: Evaluates all available shards by:
   - Number of rooms available
   - Number of users (competition)
   - Shard age (tick count)
   - Calculates a score: `rooms / users / (tick / 1000)`
4. **Spawn Placement**: Tries to place a spawn in the best location:
   - Starts with highest-scored shards
   - Searches within 3x3 room radius of starting rooms
   - Places spawn at coordinates (25, 25) in the first available room

### Usage

#### Manual Execution

```bash
# Using token authentication (recommended)
export SCREEPS_TOKEN="your-screeps-api-token"
npm run respawn

# Or using username/password
export SCREEPS_USER="your-username"
export SCREEPS_PASS="your-password"
npm run respawn
```

#### Automated via GitHub Actions

The respawner runs automatically:
- **After each deployment** (via Deploy workflow)
- **Every 6 hours** (scheduled)
- **On-demand** (manual workflow dispatch)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SCREEPS_TOKEN` | Yes* | Your Screeps API token (serves as both auth and username) |
| `SCREEPS_USER` | Yes* | Your username (if not using token) |
| `SCREEPS_PASS` | No | Your password (if not using token) |
| `SCREEPS_HOSTNAME` | No | Server hostname (default: `screeps.com`) |

*Either `SCREEPS_TOKEN` or `SCREEPS_USER` must be provided.

### Getting a Token

1. Log in to [Screeps](https://screeps.com/)
2. Go to Account Settings
3. Navigate to "API Tokens"
4. Create a new token with appropriate permissions

### GitHub Actions Configuration

The respawner runs on all configured environments:
- `sim.screeps.com` - Simulation mode
- `season.screeps.com` - Seasonal server
- `ptr.screeps.com` - Public Test Realm
- `screeps.com` - Main official server
- `screeps.nyphon.de` - Private server
- `screeps.newbieland.net` - Private server

Each environment should have the following configured in **Settings** → **Environments**:
- Secret: `SCREEPS_TOKEN` (your API token for that server)
- Variable: `SCREEPS_HOSTNAME` (the hostname for that server)
- Optional: `SCREEPS_USER` and `SCREEPS_PASS` (if not using token auth)

### Workflow Files

- `.github/workflows/respawn.yml` - Auto-respawn workflow
- `.github/workflows/deploy.yml` - Deploy workflow (triggers respawn)

### Inspired By

This implementation is based on [TooAngel/screeps respawner](https://github.com/TooAngel/screeps/blob/master/utils/respawner.js), adapted for GitHub Actions and this repository's structure.

## Test Server

For information about the local test server setup, see [packages/screeps-server/README.md](../packages/screeps-server/README.md).
