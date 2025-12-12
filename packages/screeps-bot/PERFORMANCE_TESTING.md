# Performance Testing

This bot includes automated performance testing using [ScreepsPerformanceServer](https://github.com/screepers/ScreepsPerformanceServer), which enables testing the bot's behavior in a controlled, self-contained environment with milestone tracking and performance metrics.

**Note:** Performance testing is completely self-contained within this bot package. It does not require or affect the `packages/screeps-server` package, which is a separate production server setup.

## Overview

Performance tests run the bot in a simulated Screeps server environment and track:
- Milestones reached (RCL progression, creep counts, structure counts)
- CPU usage and performance metrics
- Time to reach specific game states
- Overall bot effectiveness

## Running Performance Tests Locally

### Prerequisites

- Node.js 18.x or 20.x (LTS versions recommended)
- Docker and Docker Compose installed and running
- Built bot code (`npm run build`)

### Quick Start

1. **Build the bot:**
   ```bash
   npm run build
   ```

2. **Run performance test:**
   ```bash
   npm run test:performance
   ```

   This will start a local Screeps server and run your bot for up to 50,000 ticks (default) or until all milestones are reached.

### Custom Test Parameters

You can customize the performance test with command-line arguments:

```bash
npm run test:performance -- \
  --maxTickCount=10000 \
  --maxTimeDuration=30 \
  --serverPort=21025 \
  --cliPort=21026 \
  --deleteLogs \
  --force
```

**Available Options:**

- `--maxTickCount`: Maximum number of game ticks to run (default: 50000)
- `--maxTimeDuration`: Maximum duration in minutes (default: 60)
- `--maxBots`: Maximum number of bot instances to spawn (default: 5)
- `--serverPort`: Server port (default: 21025)
- `--cliPort`: CLI port (default: 21026)
- `--deleteLogs`: Delete logs folder on startup
- `--force`: Force overwrite of config files
- `--debug`: Enable debug logging

## Log Capture

The performance tests use a custom log capture script (`scripts/performance-test-with-logs.js`) that:

1. Starts the screeps-performance-server in the background
2. Connects to the Screeps API via WebSocket
3. Captures ALL console output (not just errors)
4. Writes logs to the `logs/` directory:
   - `console.log`: All bot console output
   - `server.log`: Performance server output and debug information

This ensures that the performance test artifacts contain actual bot output, not just empty log files.

### Running with Log Capture Locally

```bash
npm run test:performance:logs -- \
  --maxTickCount=5000 \
  --maxTimeDuration=15 \
  --debug
```

The `--debug` flag will also output server logs to the console for real-time monitoring.

## GitHub Actions Integration

Performance tests automatically run on:
- Pull requests that modify bot source code
- Pushes to `main` and `develop` branches
- Manual workflow dispatch

### Viewing Results

After a workflow run:
1. Go to the Actions tab in GitHub
2. Select the "Performance Tests" workflow
3. Click on a specific run
4. Download artifacts:
   - `performance-test-logs`: Contains `console.log` (bot console output) and `server.log` (server debug output)
   - `performance-test-results`: Milestone results and performance metrics (JSON format)

The `console.log` file contains timestamped bot console output with HTML tags removed for readability.

## Configuration

Performance test configuration is defined in `config.yml`:

### Milestones

Milestones track specific achievements during the test:

```yaml
milestones:
  - name: "RCL 2"
    room: W1N1
    level: 2
  - name: "10 Creeps"
    room: W1N1
    creeps: 10
```

**Milestone Types:**
- `level`: Room Control Level (1-8)
- `creeps`: Number of creeps in the room
- `structures`: Number of structures in the room

### Rooms

Configure which rooms the bot will spawn in:

```yaml
rooms:
  W1N1:
    bot: bot
  W2N1:
    bot: bot

trackedRooms:
  - W1N1
  - W2N1
```

### Server Configuration

Adjust server behavior:

```yaml
serverConfig:
  tickRate: 100          # Milliseconds per tick
  socketUpdateRate: 100
  shardName: "shard0"
```

## Interpreting Results

### Milestone Completion

The test tracks when each milestone is reached. A successful test should:
- Reach RCL 2-3 within 5,000 ticks
- Maintain stable creep population
- Progress through RCLs without stalling

### CPU Usage

Monitor CPU usage through:
- Server stats (`serverStats` in config)
- Exported metrics (if configured)
- Log output

### Common Issues

**Test times out:**
- Reduce `maxTickCount` or increase `maxTimeDuration`
- Check for infinite loops or stuck creeps in logs

**Bot doesn't spawn creeps:**
- Verify the bot builds correctly (`npm run build`)
- Check bot logic for spawn conditions
- Review server logs for errors

**Milestones not reached:**
- May indicate bot logic issues
- Check resource management
- Verify room planning and building

## Advanced Usage

### Custom Bot Path

Test a specific bot build:

```bash
npm run test:performance -- --botFilePath=dist/custom
```

### Exporting Results

Configure result export in `config.yml`:

```yaml
# Example: Export to Discord
discordWebHookUrl: "https://discord.com/api/webhooks/..."
discordUsername: "Performance Test Bot"

# Example: Export to GitHub
githubOwner: "your-username"
githubRepo: "your-repo"
githubAuth: "github_token"
```

### Debug Mode

Enable verbose logging:

```bash
npm run test:performance -- --debug
```

## Integration with CI/CD

The performance test workflow (`performance-test.yml`) can be customized for your CI/CD pipeline:

```yaml
- name: Run performance test
  run: |
    npm run test:performance -- \
      --maxTickCount=5000 \
      --maxTimeDuration=15 \
      --deleteLogs
```

Adjust tick counts and duration based on your testing needs and CI/CD time constraints.

## Related Documentation

- [ScreepsPerformanceServer GitHub](https://github.com/screepers/ScreepsPerformanceServer)
- [Screeps API Documentation](https://docs.screeps.com/)
- [screepsmod-server-stats](https://github.com/The-International-Screeps-Bot/screepsmod-server-stats)
