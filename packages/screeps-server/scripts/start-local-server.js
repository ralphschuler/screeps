#!/usr/bin/env node

import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(serverRoot, '../..');
const DEFAULT_LOCAL_PASSWORD = 'ci-password';

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || 'true'];
}));

const projectName = args.get('project') ?? 'screeps-local';
const serverHost = args.get('serverHost') ?? process.env.SCREEPS_SERVER_HOST ?? process.env.SCREEPS_LAUNCHER_HOST ?? '127.0.0.1';
const apiHost = serverHost === '0.0.0.0' ? '127.0.0.1' : serverHost;
const serverPort = Number(args.get('serverPort') ?? process.env.SCREEPS_SERVER_PORT ?? 21025);
const cliPort = Number(args.get('cliPort') ?? process.env.SCREEPS_CLI_PORT ?? 21026);
const serverPassword = args.get('serverPassword') ?? process.env.SCREEPS_SERVER_PASSWORD ?? DEFAULT_LOCAL_PASSWORD;
const shardName = args.get('shardName') ?? process.env.SHARD_NAME ?? 'shard0';
const password = args.get('password') ?? DEFAULT_LOCAL_PASSWORD;

export function isLoopbackHost(host) {
  const normalizedHost = String(host ?? '').trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (normalizedHost === 'localhost') return true;
  if (normalizedHost === '::1') return true;

  if (net.isIP(normalizedHost) === 4) {
    return normalizedHost.startsWith('127.');
  }

  return false;
}

export function validateLocalServerCredentials({ host, serverPassword: configuredServerPassword, password: configuredPassword }) {
  if (isLoopbackHost(host)) return;

  const defaultCredentialNames = [];
  if (configuredServerPassword === DEFAULT_LOCAL_PASSWORD) defaultCredentialNames.push('serverPassword');
  if (configuredPassword === DEFAULT_LOCAL_PASSWORD) defaultCredentialNames.push('password');
  if (defaultCredentialNames.length === 0) return;

  throw new Error([
    'Refusing to bind the local Screeps server to a shared-network interface with default credentials.',
    `Host: ${host}`,
    `Default credentials still in use: ${defaultCredentialNames.join(', ')}`,
    'Loopback development remains allowed with defaults: npm run server:local:up',
    'Safe LAN opt-in requires explicit non-default passwords:',
    '  npm run server:local:up -- --serverHost=0.0.0.0 --serverPassword=<strong-server-password> --password=<strong-bot-password>',
    'Shared-network risk: anyone who can reach this host/port may access the local Screeps server.'
  ].join('\n'));
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
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
  return run('docker', ['compose', '-f', 'docker-compose.ci.yml', '-p', projectName, ...composeArgs], {
    cwd: serverRoot,
    env: { SCREEPS_LAUNCHER_HOST: serverHost, SHARD_NAME: shardName }
  });
}

async function waitForServer(timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://${apiHost}:${serverPort}/`);
      if (res.ok || res.status < 500) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error('Timed out waiting for Screeps HTTP server readiness');
}

function cliEval(command, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: apiHost, port: cliPort });
    let output = '';
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Timed out waiting for CLI command result. Output:\n${output}`));
    }, timeoutMs);

    socket.on('data', chunk => {
      output += chunk.toString();
      if (output.includes('__PI_CLI_DONE_')) {
        clearTimeout(timeout);
        socket.end();
        resolve(output);
      }
    });
    socket.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });
    socket.on('connect', () => {
      socket.write(`${command}\n`);
    });
  });
}

async function ensureTerrainData() {
  const command = `Promise.resolve().then(async () => { await storage.env.set('shardName', ${JSON.stringify(shardName)}); await storage.env.set(storage.env.keys.MAIN_LOOP_MIN_DURATION, 33); await storage.env.set('tickRate', 33); if (storage.pubsub) storage.pubsub.publish('setTickRate', 33); await map.updateTerrainData(); }).then(() => print('__PI_CLI_DONE_OK__')).catch(error => print('__PI_CLI_DONE_ERR__', error.stack || error.message || String(error)))`;
  const output = await cliEval(command, 60000);
  if (!output.includes('__PI_CLI_DONE_OK__') || output.includes('__PI_CLI_DONE_ERR__')) {
    throw new Error(`Failed to ensure world terrain cache. CLI output:\n${output}`);
  }
  log(`ensured shard ${shardName} and world terrain cache`);
}

async function setupBotArena() {
  await run('node', [path.resolve(__dirname, 'setup-bot-arena.js'), `--apiHost=${apiHost}`, `--serverPort=${serverPort}`, `--cliPort=${cliPort}`, `--serverPassword=${serverPassword}`, `--password=${password}`], { cwd: repoRoot });
}

async function main() {
  validateLocalServerCredentials({ host: serverHost, serverPassword, password });
  await run('npm', ['run', 'build:mod'], { cwd: repoRoot });
  await run('npm', ['run', 'build:bot'], { cwd: repoRoot });
  log(`using host bind ${serverHost}:${serverPort} and CLI ${serverHost}:${cliPort}`);
  await compose('up', '--build', '--force-recreate', '-d');
  await waitForServer();
  await ensureTerrainData();
  await setupBotArena();

  log('local Screeps server is running');
  console.log(`\nConnect local client to: http://${serverHost}:${serverPort}`);
  console.log(`Users: swarm-bot-current, swarm-bot-prev1, swarm-bot-prev2, github-screeps-ai, github-nooby-guide`);
  console.log(`Password: ${password}`);
  console.log(`Server password: ${serverPassword}`);
  console.log('LAN opt-in: npm run server:local:up -- --serverHost=0.0.0.0 --serverPassword=<strong-server-password> --password=<strong-bot-password>');
  console.log('Warning: LAN mode exposes the local server to other devices on the shared network. Use non-default passwords.');
  console.log(`\nStop:`);
  console.log(`  npm run server:local:down`);
  console.log(`Logs:`);
  console.log(`  npm run server:local:logs`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch(error => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  });
}
