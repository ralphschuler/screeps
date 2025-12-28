# Grafana Performance Alerts

This directory contains Grafana alert rule configurations for monitoring bot performance and detecting violations of CPU budgets defined in ROADMAP.md.

## Alert Rules

### CPU Budget Violations

Based on ROADMAP.md Section 2 targets:
- **Eco Room Alert**: Triggers when average CPU usage exceeds 0.1 per tick
- **War Room Alert**: Triggers when average CPU usage exceeds 0.25 per tick
- **CPU Bucket Critical**: Triggers when CPU bucket drops below 2000

### Alert Configuration Files

- `cpu-budget-alerts.json`: Alert rules for CPU budget monitoring
- `setup-alerts.js`: Script to create/update alerts using grafana-mcp

## Setting Up Alerts

### Prerequisites

1. Grafana Cloud instance (already configured at https://ralphschuler.grafana.net)
2. Grafana API key with alerting permissions
3. `grafana-mcp` server running

### Manual Setup via Grafana UI

1. Navigate to Alerting → Alert rules in Grafana
2. Import the alert rules from `cpu-budget-alerts.json`
3. Configure notification channels (Slack, email, GitHub, etc.)
4. Set up contact points for each severity level

### Automated Setup via MCP

```bash
# Set Grafana API key
export GRAFANA_API_KEY="your-api-key-here"

# Run setup script
node grafana-alerts/setup-alerts.js
```

## Alert Severity Levels

- **Critical**: CPU bucket < 2000 (bot may stop functioning)
- **Warning**: CPU budget violation (eco or war room exceeds target)
- **Info**: Performance trending toward limits

## Notification Channels

Recommended notification setup:
- **Critical**: PagerDuty, SMS, Slack #alerts
- **Warning**: GitHub issue creation, Slack #performance
- **Info**: Email digest, weekly summary

## Alert Queries

### Eco Room CPU Usage
```promql
avg(stats_room_cpu{room_type="eco"}) > 0.1
```

### War Room CPU Usage
```promql
avg(stats_room_cpu{room_type="war"}) > 0.25
```

### CPU Bucket Critical
```promql
stats_cpu_bucket < 2000
```

## Tuning Alerts

If experiencing alert fatigue:
1. Adjust thresholds in alert rule definitions
2. Add evaluation delays to filter transient spikes
3. Use rate-of-change alerts instead of absolute thresholds
4. Group alerts by cluster/shard to reduce noise

## Integration with CI/CD

Performance tests in CI/CD also check these thresholds:
- See `.github/workflows/performance-test.yml`
- See `packages/screeps-bot/scripts/analyze-performance.js`

## Historical Alert Data

Alert history is stored in Grafana and can be queried via:
- Grafana UI: Alerting → Alert history
- API: `/api/v1/rules/history`
- MCP: `list_incidents` tool via grafana-mcp
