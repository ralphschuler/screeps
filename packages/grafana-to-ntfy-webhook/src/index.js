import express from 'express';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const ntfyBaseUrl = ensureTrailingSlash(process.env.NTFY_BASE_URL ?? 'https://ntfy.sh');
const ntfyTopic = process.env.NTFY_TOPIC;
const ntfyToken = process.env.NTFY_TOKEN;
const ntfyUser = process.env.NTFY_USER;
const ntfyPassword = process.env.NTFY_PASSWORD;
const defaultTags = parseTags(process.env.NTFY_TAGS);
const webhookSecret = process.env.GRAFANA_WEBHOOK_SECRET ?? process.env.WEBHOOK_SECRET;

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/webhook', async (req, res) => {
  if (webhookSecret && !validateWebhookSecret(req, webhookSecret)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!ntfyTopic) {
    res.status(500).json({ error: 'NTFY_TOPIC is not configured' });
    return;
  }

  const payload = req.body ?? {};
  const notification = formatNotification(payload);

  try {
    const response = await sendNotification(notification);
    if (!response.ok) {
      const body = await response.text();
      console.error('ntfy responded with non-OK status', response.status, body);
      res.status(502).json({ error: 'Failed to deliver notification to ntfy' });
      return;
    }

    res.json({ status: 'delivered' });
  } catch (error) {
    console.error('Failed to forward Grafana webhook', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unexpected error', err);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`Grafana to ntfy webhook bridge listening on port ${port}`);
});

function formatNotification(payload) {
  const state = (payload.state ?? payload.status ?? 'unknown').toString();
  const title = payload.title ?? `Grafana alert: ${payload.ruleName ?? 'unknown rule'}`;
  const description = payload.message ?? 'No Grafana message provided.';

  const lines = [];
  lines.push(`State: ${state}`);

  if (payload.ruleUrl) {
    lines.push(`Rule: ${payload.ruleUrl}`);
  }

  if (payload.dashboardId && payload.panelId) {
    lines.push(`Dashboard ${payload.dashboardId}, Panel ${payload.panelId}`);
  }

  if (Array.isArray(payload.evalMatches) && payload.evalMatches.length > 0) {
    lines.push('Matches:');
    payload.evalMatches.forEach((match) => {
      const matchMetric = match.metric ?? 'metric';
      const matchValue = match.value ?? 'n/a';
      const matchTags = formatTags(match.tags);
      lines.push(`- ${matchMetric}: ${matchValue}${matchTags}`);
    });
  }

  const messageBody = [description, '', ...lines].filter(Boolean).join('\n');
  const tags = defaultTags ?? formatTagsArray(payload.tags);

  return {
    title,
    message: messageBody,
    priority: priorityFromState(state),
    tags,
  };
}

function priorityFromState(state) {
  const normalized = state.toString().toLowerCase();
  if (normalized === 'alerting' || normalized === 'critical') {
    return 5;
  }
  if (normalized === 'no_data' || normalized === 'pending') {
    return 3;
  }
  if (normalized === 'ok') {
    return 2;
  }
  return 3;
}

function parseTags(tagsValue) {
  if (!tagsValue) {
    return undefined;
  }
  const parsed = tagsValue
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : undefined;
}

function formatTags(tags) {
  if (!tags || typeof tags !== 'object') {
    return '';
  }

  const tagPairs = Object.entries(tags)
    .filter(([key, value]) => Boolean(key) && value !== undefined)
    .map(([key, value]) => `${key}: ${value}`);

  if (tagPairs.length === 0) {
    return '';
  }

  return ` (${tagPairs.join(', ')})`;
}

function formatTagsArray(tags) {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (tags && typeof tags === 'object') {
    return Object.values(tags).map((tag) => tag.toString());
  }
  if (typeof tags === 'string') {
    return parseTags(tags);
  }
  return undefined;
}

function validateWebhookSecret(req, expectedSecret) {
  const providedSecret = extractProvidedSecret(req);
  return Boolean(providedSecret && providedSecret === expectedSecret);
}

function extractProvidedSecret(req) {
  const authHeader = req.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice('bearer '.length).trim();
  }

  const tokenHeader = req.get('x-grafana-token');
  if (tokenHeader) {
    return tokenHeader.trim();
  }

  return undefined;
}

async function sendNotification(notification) {
  const endpoint = `${ntfyBaseUrl}${encodeURIComponent(ntfyTopic)}`;
  const headers = new Headers({ 'Content-Type': 'application/json' });

  if (ntfyToken) {
    headers.append('Authorization', `Bearer ${ntfyToken}`);
  } else if (ntfyUser && ntfyPassword) {
    const encoded = Buffer.from(`${ntfyUser}:${ntfyPassword}`).toString('base64');
    headers.append('Authorization', `Basic ${encoded}`);
  }

  const payload = stripUndefined({
    title: notification.title,
    message: notification.message,
    priority: notification.priority,
    tags: notification.tags,
  });

  return fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

function stripUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null)
  );
}

function ensureTrailingSlash(url) {
  return url.endsWith('/') ? url : `${url}/`;
}
