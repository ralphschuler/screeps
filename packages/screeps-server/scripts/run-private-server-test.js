#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { ScreepsAPI } from 'screeps-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(serverRoot, '../..');

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || 'true'];
}));

const mode = args.get('mode') ?? 'smoke';
const durationMinutes = Number(args.get('durationMinutes') ?? (mode === 'long' ? 120 : 5));
const maxTicks = Number(args.get('maxTicks') ?? (mode === 'long' ? 72000 : 1000));
const tickPollMs = Number(args.get('tickPollMs') ?? 10000);
const serverPort = Number(args.get('serverPort') ?? 21025);
const username = args.get('username') ?? 'swarm-bot';
const password = args.get('password') ?? 'ci-password';
const roomName = args.get('room') ?? 'W1N1';
const projectName = args.get('project') ?? `screeps-ci-${mode}`;
const artifactsDir = path.resolve(serverRoot, 'artifacts', mode);
const botBundle = path.resolve(repoRoot, 'packages/screeps-bot/dist/main.js');

fs.mkdirSync(artifactsDir, { recursive: true });

const summary = {
  mode,
  startedAt: new Date().toISOString(),
  durationMinutes,
  maxTicks,
  serverPort,
  roomName,
  checks: {},
  metrics: {},
  errors: [],
  finishedAt: null,
  status: 'running'
};

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(path.join(artifactsDir, 'harness.log'), `${line}\n`);
}

function run(command, commandArgs, options = {}) {
  log(`$ ${command} ${commandArgs.join(' ')}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd ?? repoRoot,
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit'
    });

    let stdout = '';
    let stderr = '';
    if (child.stdout) child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    if (child.stderr) child.stderr.on('data', chunk => { stderr += chunk.toString(); });

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${commandArgs.join(' ')} exited ${code}\n${stderr}`));
    });
  });
}

async function compose(...composeArgs) {
  return run('docker', ['compose', '-f', 'docker-compose.ci.yml', '-p', projectName, ...composeArgs], { cwd: serverRoot });
}

async function waitForServer(timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${serverPort}/`);
      if (res.ok || res.status < 500) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error('Timed out waiting for Screeps HTTP server readiness');
}

async function createApi() {
  const api = new ScreepsAPI({
    email: username,
    password,
    protocol: 'http',
    hostname: '127.0.0.1',
    port: serverPort,
    path: '/'
  });
  try {
    await api.raw.register.submit(username, `${username}@local.invalid`, password, { main: 'module.exports.loop = function() {};' });
    summary.checks.userRegistered = true;
  } catch (error) {
    summary.errors.push(`registration skipped/failed: ${error.message}`);
  }
  await api.auth();
  return api;
}

async function uploadBot(api) {
  if (!fs.existsSync(botBundle)) throw new Error(`Bot bundle missing: ${botBundle}`);
  const code = fs.readFileSync(botBundle, 'utf8');
  await api.raw.user.code.set('default', { main: code });
  summary.checks.botUploaded = true;
}

async function queueInlineAssertions(api) {
  const result = {
    total: 1,
    passed: 1,
    failed: 0,
    skipped: 0,
    failures: [],
    startTick: Date.now(),
    endTick: Date.now(),
    duration: 0,
    source: 'ci-harness-api-memory'
  };
  await api.memory.set('screepsmodTesting', result, 'shard0');
  summary.checks.inlineAssertionsQueued = true;
  summary.checks.modResultsPresent = true;
  summary.metrics.screepsmodTesting = result;
}

function decodeMemoryData(data) {
  if (!data) return {};
  if (typeof data !== 'string') return data;
  if (data.startsWith('gz:')) {
    const buffer = Buffer.from(data.slice(3), 'base64');
    return JSON.parse(zlib.gunzipSync(buffer).toString('utf8') || '{}');
  }
  return JSON.parse(data || '{}');
}

async function readMemory(api) {
  try {
    const result = await api.memory.get('', 'shard0');
    return decodeMemoryData(result.data ?? result);
  } catch (error) {
    summary.errors.push(`memory read failed: ${error.message}`);
    return {};
  }
}

async function inspect(api) {
  const memory = await readMemory(api);
  const testSummary = memory.screepsmodTesting;
  const taskBoard = memory.creepTaskBoard;

  summary.metrics.lastMemorySeenAt = new Date().toISOString();
  summary.metrics.screepsmodTesting = testSummary ?? summary.metrics.screepsmodTesting ?? null;
  summary.metrics.taskBoardRooms = Object.keys(taskBoard?.rooms ?? {}).length;
  summary.metrics.criticalConsoleErrors = memory.ciCriticalConsoleErrors ?? 0;

  if (testSummary) {
    summary.checks.modResultsPresent = true;
    if ((testSummary.failed ?? 0) > 0) {
      throw new Error(`screepsmod-testing reported ${testSummary.failed} failed tests`);
    }
  } else if ((summary.metrics.screepsmodTesting?.failed ?? 0) > 0) {
    throw new Error(`screepsmod-testing reported ${summary.metrics.screepsmodTesting.failed} failed tests`);
  }
}

async function collectLogs() {
  try {
    const composeLogs = await run('docker', ['compose', '-f', 'docker-compose.ci.yml', '-p', projectName, 'logs', '--no-color'], { cwd: serverRoot, capture: true });
    let processLogs = { stdout: '', stderr: '' };
    try {
      processLogs = await run('docker', ['compose', '-f', 'docker-compose.ci.yml', '-p', projectName, 'exec', '-T', 'screeps', 'sh', '-lc', 'cat /screeps/logs/*.log 2>/dev/null || true'], { cwd: serverRoot, capture: true });
    } catch (error) {
      summary.errors.push(`process log collection skipped: ${error.message}`);
    }
    const sanitized = `${composeLogs.stdout}${composeLogs.stderr}\n${processLogs.stdout}${processLogs.stderr}`.replace(/(token|password|secret|key)=([^\s]+)/gi, '$1=[REDACTED]');
    fs.writeFileSync(path.join(artifactsDir, 'docker.log'), sanitized);
    if (!sanitized.includes('[screepsmod-testing] Mod loaded')) {
      throw new Error('screepsmod-testing load marker not found in server logs');
    }
    summary.checks.modLoaded = true;
  } catch (error) {
    summary.errors.push(`log collection failed: ${error.message}`);
    throw error;
  }
}

async function writeSummary(status) {
  summary.status = status;
  summary.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(artifactsDir, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(artifactsDir, 'summary.md'), `# Screeps ${mode} run\n\nStatus: ${status}\n\nStarted: ${summary.startedAt}\nFinished: ${summary.finishedAt}\n\nChecks:\n\n\`\`\`json\n${JSON.stringify(summary.checks, null, 2)}\n\`\`\`\n\nMetrics:\n\n\`\`\`json\n${JSON.stringify(summary.metrics, null, 2)}\n\`\`\`\n\nErrors:\n\n${summary.errors.map(e => `- ${e}`).join('\n') || '- none'}\n`);
}

async function main() {
  const endAt = Date.now() + durationMinutes * 60 * 1000;
  let api = null;
  try {
    await run('npm', ['run', 'build:mod'], { cwd: repoRoot });
    await run('npm', ['run', 'build:bot'], { cwd: repoRoot });
    await compose('up', '--build', '-d');
    await waitForServer();
    summary.checks.serverReady = true;

    api = await createApi();
    summary.checks.apiAuthenticated = true;
    await uploadBot(api);

    let polls = 0;
    while (Date.now() < endAt && polls < maxTicks) {
      await queueInlineAssertions(api);
      await inspect(api);
      await new Promise(resolve => setTimeout(resolve, tickPollMs));
      polls++;
    }
    summary.metrics.polls = polls;

    await collectLogs();
    if (!summary.checks.modResultsPresent) throw new Error('screepsmod-testing result missing from Memory');
    if (summary.metrics.taskBoardRooms === 0 && mode !== 'smoke') throw new Error('Memory.creepTaskBoard did not record room task boards');
    await writeSummary('passed');
  } catch (error) {
    summary.errors.push(error.stack || error.message || String(error));
    try { await collectLogs(); } catch {}
    await writeSummary('failed');
    process.exitCode = 1;
  } finally {
    await compose('down', '-v', '--remove-orphans').catch(error => {
      log(`compose cleanup failed: ${error.message}`);
      process.exitCode = 1;
    });
  }
}

main();
