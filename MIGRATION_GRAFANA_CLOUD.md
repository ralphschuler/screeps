# Migration to Grafana Cloud - Testing Guide

This document describes how to test the migration from local InfluxDB/Grafana to Grafana Cloud using the Graphite HTTP API.

## What Changed

### Removed Components
- ✅ Local Grafana service and container
- ✅ Local InfluxDB service and container  
- ✅ Grafana provisioning files (dashboards, datasources)
- ✅ Docker volumes for grafana-data and influxdb-data
- ✅ InfluxDB client library dependency

### New Components
- ✅ Grafana Cloud Graphite HTTP API integration
- ✅ Bearer token authentication
- ✅ Graphite plaintext protocol implementation
- ✅ Tag-based metrics with Graphite syntax

### Configuration Changes
- ✅ Renamed package: `screeps-influx-exporter` → `screeps-graphite-exporter`
- ✅ New environment variables:
  - `GRAFANA_CLOUD_GRAPHITE_URL` (replaces `INFLUXDB_URL`)
  - `GRAFANA_CLOUD_API_KEY` (replaces `INFLUXDB_TOKEN`)
  - `GRAFANA_CLOUD_GRAPHITE_PREFIX` (replaces `INFLUXDB_MEASUREMENT`)
- ✅ Removed environment variables:
  - `INFLUXDB_URL`
  - `INFLUXDB_TOKEN`
  - `INFLUXDB_ORG`
  - `INFLUXDB_BUCKET`
  - `GRAFANA_ADMIN_USER`
  - `GRAFANA_ADMIN_PASSWORD`

## Prerequisites for Testing

### 1. Grafana Cloud Account
You need a Grafana Cloud account with:
- An active Graphite data source
- An API key with write permissions

### 2. Obtain Your Grafana Cloud Credentials

#### Get the Graphite URL:
1. Log into your Grafana Cloud instance
2. Go to **Connections** → **Data sources**
3. Find your Graphite data source
4. The URL will be something like:
   ```
   https://graphite-prod-01-eu-west-0.grafana.net/graphite/metrics
   ```

#### Create an API Key:
1. In Grafana Cloud, go to **Security** → **API keys**
2. Click **Add API key**
3. Name: `screeps-metrics-writer`
4. Role: **MetricsPublisher** (or Editor if MetricsPublisher isn't available)
5. Save the generated API key securely

## Testing Procedure

### Step 1: Update Environment Variables

Edit `packages/screeps-server/.env`:

```bash
# Remove old InfluxDB/Grafana variables
# INFLUXDB_URL=...
# INFLUXDB_TOKEN=...
# GRAFANA_ADMIN_USER=...
# GRAFANA_ADMIN_PASSWORD=...

# Add new Grafana Cloud variables
GRAFANA_CLOUD_GRAPHITE_URL=https://graphite-prod-01-eu-west-0.grafana.net/graphite/metrics
GRAFANA_CLOUD_API_KEY=glc_your_api_key_here
GRAFANA_CLOUD_GRAPHITE_PREFIX=screeps
```

### Step 2: Rebuild the Exporter

```bash
cd packages/screeps-graphite-exporter
npm install
npm run build
```

Expected output: Build should complete without errors.

### Step 3: Start the Services

```bash
cd packages/screeps-server
docker-compose up -d
```

Expected services running:
- ✅ screeps (Screeps server)
- ✅ mongo (Database)
- ✅ redis (Cache)
- ✅ screeps-exporter (Metrics exporter)
- ❌ influxdb (Removed)
- ❌ grafana (Removed)

### Step 4: Verify Exporter Logs

```bash
docker-compose logs -f screeps-exporter
```

Look for:
- ✅ `Starting Screeps Graphite exporter in memory mode`
- ✅ `Grafana Cloud Graphite target: https://...`
- ✅ `Sent X metrics to Grafana Cloud Graphite`
- ❌ Any HTTP error messages (401, 403, 500)

### Step 5: Verify Data in Grafana Cloud

1. Log into your Grafana Cloud instance
2. Go to **Explore**
3. Select your Graphite data source
4. Query for metrics:
   - `screeps.stats.cpu.used`
   - `screeps.stats.empire.creeps`
   - `screeps.stats.room.*.rcl`

You should see data appearing within 15-30 seconds of the bot running.

### Step 6: Create a Dashboard

Create a new dashboard with panels:

#### CPU Usage Panel
- Query: `screeps.stats.cpu.used`
- Visualization: Time series
- Unit: none

#### Room Energy Panel
- Query: `screeps.stats.room.*.energy.storage`
- Visualization: Time series
- Unit: energy

#### Subsystem CPU Panel
- Query: `screeps.stats.profiler.subsystem.*.avg_cpu`
- Visualization: Time series (stacked)
- Unit: none

## Troubleshooting

### No Data Appearing in Grafana Cloud

**Check 1: Exporter Logs**
```bash
docker-compose logs screeps-exporter
```
Look for error messages about authentication or connectivity.

**Check 2: Bot Stats**
Verify the bot is writing to `Memory.stats`:
```javascript
// In Screeps console
JSON.stringify(Memory.stats).substring(0, 200)
```

**Check 3: API Key Permissions**
- Verify the API key has write permissions
- Check the key hasn't expired
- Ensure the Graphite endpoint URL is correct

### Authentication Errors (401/403)

- Double-check `GRAFANA_CLOUD_API_KEY` is correct
- Ensure no extra whitespace in the key
- Verify the key has MetricsPublisher role

### Connection Errors

- Verify `GRAFANA_CLOUD_GRAPHITE_URL` is correct
- Check network connectivity from Docker container
- Ensure firewall isn't blocking outbound HTTPS

### Metrics Format Issues

If metrics appear but look wrong:
- Check `GRAFANA_CLOUD_GRAPHITE_PREFIX` setting
- Verify metric names in Grafana match expected format
- Review exporter logs for parsing errors

## Metric Format Reference

### Graphite Plaintext Format
```
metric_name;tag1=value1;tag2=value2 value timestamp
```

### Example Metrics Sent
```
screeps.stats.cpu.used;source=exporter;stat=cpu.used;range=tick;category=cpu 15.5 1702123456
screeps.stats.room.W1N1.rcl;source=exporter;stat=room.W1N1.rcl;range=tick;category=stats_room;sub_category=W1N1 8 1702123456
```

### Tag Structure
All metrics include these tags:
- `source`: Always "exporter"
- `stat`: Full stat name (e.g., "cpu.used")
- `range`: Time range or context
- `category`: Top-level category (e.g., "cpu", "stats_room")
- `sub_category`: Optional subcategory (e.g., room name, subsystem name)

## Rollback Procedure

If you need to rollback to the old InfluxDB/Grafana setup:

```bash
# 1. Checkout the previous commit
git checkout <previous-commit-hash>

# 2. Restore services
cd packages/screeps-server
docker-compose up -d

# 3. Restore environment variables to use InfluxDB settings
```

## Success Criteria

The migration is successful when:
- ✅ Exporter connects to Grafana Cloud without errors
- ✅ Metrics appear in Grafana Cloud within 30 seconds
- ✅ All expected metric categories are present (cpu, rooms, empire, etc.)
- ✅ Historical data starts accumulating
- ✅ No local Grafana/InfluxDB services are running
- ✅ Disk space saved by removing local time-series database

## Additional Notes

### Cost Considerations
- Grafana Cloud has usage-based pricing
- Monitor your metrics ingestion rate
- Consider adjusting `EXPORTER_POLL_INTERVAL_MS` if needed (default: 15000ms)

### Performance
- Graphite HTTP API is designed for high throughput
- No significant CPU overhead compared to InfluxDB
- Network latency may be slightly higher (cloud vs local)

### Data Retention
- Check your Grafana Cloud plan's data retention policy
- Default is typically 13 months for Graphite
- Configure alerts for important metrics

## Support

For issues specific to:
- **This migration**: Open an issue in the ralphschuler/screeps repository
- **Grafana Cloud**: Check Grafana Cloud documentation or support
- **Screeps Bot**: Refer to bot documentation and ROADMAP.md
