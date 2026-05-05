import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

process.env.NODE_ENV = 'test';
process.env.GRAFANA_WEBHOOK_SECRET = 'expected-secret';
process.env.NTFY_TOPIC = 'alerts';

const { timingSafeStringEqual, validateWebhookSecret } = await import('../src/index.js');

test('startup fails when webhook secret is missing', () => {
  const result = spawnSync(process.execPath, ['src/index.js'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, NODE_ENV: 'test', GRAFANA_WEBHOOK_SECRET: '', WEBHOOK_SECRET: '' },
    encoding: 'utf8'
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /GRAFANA_WEBHOOK_SECRET or WEBHOOK_SECRET is required/);
});

test('secret comparison is timing-safe and rejects unequal values', () => {
  assert.equal(timingSafeStringEqual('expected-secret', 'expected-secret'), true);
  assert.equal(timingSafeStringEqual('wrong-secret', 'expected-secret'), false);
  assert.equal(timingSafeStringEqual('short', 'expected-secret'), false);
  assert.equal(timingSafeStringEqual(undefined, 'expected-secret'), false);
});

test('webhook secret accepts bearer or x-grafana-token only when valid', () => {
  const bearerReq = { get: (name) => name === 'authorization' ? 'Bearer expected-secret' : undefined };
  const headerReq = { get: (name) => name === 'x-grafana-token' ? 'expected-secret' : undefined };
  const badReq = { get: () => 'wrong-secret' };

  assert.equal(validateWebhookSecret(bearerReq, 'expected-secret'), true);
  assert.equal(validateWebhookSecret(headerReq, 'expected-secret'), true);
  assert.equal(validateWebhookSecret(badReq, 'expected-secret'), false);
});
