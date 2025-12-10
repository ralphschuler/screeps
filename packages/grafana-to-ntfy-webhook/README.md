# Grafana to ntfy webhook bridge

This package provides a lightweight HTTP service that converts Grafana alert webhooks into [ntfy](https://ntfy.sh/) notifications. Deploy the included Docker image to receive Grafana alerts and forward them to a chosen ntfy topic.

## Configuration

| Environment variable | Required | Description |
| --- | --- | --- |
| `NTFY_TOPIC` | Yes | Target ntfy topic name. |
| `NTFY_BASE_URL` | No | Base URL of your ntfy server (default: `https://ntfy.sh`). |
| `NTFY_TOKEN` | No | Bearer token for ntfy authentication. |
| `NTFY_USER` / `NTFY_PASSWORD` | No | Basic auth credentials for ntfy. Ignored when `NTFY_TOKEN` is set. |
| `GRAFANA_WEBHOOK_SECRET` | No | Shared secret that must match the bearer token or `X-Grafana-Token` header sent by Grafana. |
| `NTFY_TAGS` | No | Comma-separated tags to include with every notification. |
| `PORT` | No | HTTP port to listen on (default: `3000`). |

When `GRAFANA_WEBHOOK_SECRET` is set, the `/webhook` endpoint rejects requests that do not send the shared secret via `Authorization: Bearer <secret>` or the `X-Grafana-Token` header (add a custom header in Grafana's webhook settings).

The service exposes two routes:
- `POST /webhook` receives Grafana webhook payloads and forwards them to ntfy.
- `GET /health` returns a simple health response.

Priority is mapped from Grafana alert states: `alerting`/`critical` → 5, `no_data`/`pending` → 3, `ok` → 2, everything else → 3.

## Run locally

```bash
cd packages/grafana-to-ntfy-webhook
npm install
NTFY_TOPIC="alerts" npm start
```

Send a test webhook (include the bearer token if `GRAFANA_WEBHOOK_SECRET` is set):

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-shared-secret>" \
  -d '{
    "title": "CPU usage high",
    "state": "alerting",
    "message": "CPU usage exceeded threshold",
    "ruleUrl": "https://grafana.example.com/d/abc123",
    "evalMatches": [{"metric": "cpu", "value": 95, "tags": {"host": "server1"}}]
  }'
```

## Build and run with Docker

```bash
cd packages/grafana-to-ntfy-webhook
docker build -t grafana-to-ntfy-webhook .
docker run -p 3000:3000 \
  -e NTFY_TOPIC=alerts \
  -e NTFY_BASE_URL=https://ntfy.sh \
  grafana-to-ntfy-webhook
```

Point Grafana's webhook notification channel to `http://<host>:3000/webhook` to start relaying alerts to ntfy.
