# GitHub Environment Setup for Screeps Deployment

This document explains how to configure GitHub Environments for deploying the Screeps bot to different servers.

## Overview

The deploy workflow (`deploy.yml`) uses GitHub Environments to manage server-specific credentials and configuration. Each Screeps server (screeps.com, sim.screeps.com, etc.) needs its own environment configuration.

## Required Environments

The deploy workflow targets these environments:

- `sim.screeps.com` - Simulation server
- `season.screeps.com` - Seasonal server
- `ptr.screeps.com` - Public Test Realm
- `screeps.com` - Main production server
- `screeps.nyphon.de` - Private server
- `screeps.newbieland.net` - Private server

## Setting Up an Environment

For each server you want to deploy to:

1. Go to your repository's **Settings** → **Environments**
2. Click **New environment**
3. Enter the environment name (e.g., `screeps.com`)
4. Click **Configure environment**

## Required Secrets

Each environment needs **ONE** of these authentication methods:

### Option 1: Token Authentication (Recommended)

- `SCREEPS_TOKEN` - Your Screeps API token
  - Get this from your Screeps account settings
  - Example: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Option 2: Username/Password Authentication

- `SCREEPS_PASS` - Your Screeps password

## Required Variables

Each environment needs these configuration variables:

- `SCREEPS_USER` - Your Screeps username (e.g., `YourUsername`)
- `SCREEPS_HOSTNAME` - The server hostname
  - For screeps.com: `screeps.com`
  - For sim.screeps.com: `screeps.com` (same as main)
  - For private servers: the actual hostname
- `SCREEPS_BRANCH` - The branch name to deploy to (e.g., `main`, `default`)

## Optional Variables

- `SCREEPS_PROTOCOL` - Protocol to use (default: `https`)
- `SCREEPS_PORT` - Port number (default: `443`)
- `SCREEPS_PATH` - API path (default: `/`)

## Example Configuration

### For screeps.com environment:

**Secrets:**
```
SCREEPS_TOKEN = your-api-token-here
```

**Variables:**
```
SCREEPS_USER = YourUsername
SCREEPS_HOSTNAME = screeps.com
SCREEPS_BRANCH = main
```

### For sim.screeps.com environment:

**Secrets:**
```
SCREEPS_TOKEN = your-api-token-here
```

**Variables:**
```
SCREEPS_USER = YourUsername
SCREEPS_HOSTNAME = screeps.com
SCREEPS_BRANCH = sim
```

### For private server environment:

**Secrets:**
```
SCREEPS_TOKEN = your-server-token
# OR if the server doesn't support tokens:
SCREEPS_PASS = your-password
```

**Variables:**
```
SCREEPS_USER = YourUsername
SCREEPS_HOSTNAME = screeps.yourprivateserver.com
SCREEPS_BRANCH = default
SCREEPS_PROTOCOL = https
SCREEPS_PORT = 443
```

## Troubleshooting

### "Credentials not configured" warning

If you see this warning during deployment:

```
⚠️  WARNING: Credentials not configured!
The code will be built but NOT uploaded to Screeps (dryRun mode).
```

This means:
1. The environment variables are not set in the GitHub Environment, OR
2. The environment name doesn't match the matrix entry in the workflow, OR
3. The secret/variable names are misspelled

**Solution:**
1. Go to Settings → Environments → [environment-name]
2. Verify all required secrets and variables are set
3. Check that the environment name exactly matches the matrix entry
4. Ensure you have `SCREEPS_TOKEN` OR both `SCREEPS_USER` + `SCREEPS_PASS`

### Deploy runs but code is empty on Screeps

This indicates the rollup-plugin-screeps is running in `dryRun` mode (simulating upload without actually uploading).

**Causes:**
- Missing or incorrect credentials
- The `DEST=screeps` environment variable is not set (should be automatic in the push command)

**Solution:**
- Check the deploy logs for the configuration output
- Verify the credentials in the environment configuration
- Ensure the workflow calls `npm run push` (which sets `DEST=screeps`)

### How to test locally

You can test the deployment configuration locally:

```bash
cd packages/screeps-bot

# Set your credentials
export SCREEPS_TOKEN="your-token-here"
# OR
export SCREEPS_USER="your-username"
export SCREEPS_PASS="your-password"

# Set other configuration
export SCREEPS_HOSTNAME="screeps.com"
export SCREEPS_BRANCH="main"

# Run the push command
npm run push
```

You should see:
```
=== Screeps Deploy Configuration ===
hasValidCredentials: [your-token]
Credentials type: token
dryRun will be: false
====================================
```

If `dryRun will be: true`, check that your credentials are set correctly.

## Security Notes

- Never commit tokens or passwords to the repository
- Use GitHub Secrets for sensitive values (tokens, passwords)
- Use GitHub Variables for non-sensitive configuration (hostnames, branches)
- Environment-specific secrets are only accessible to that environment
- Consider using deployment protection rules for production environments
