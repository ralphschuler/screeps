#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ScreepsAPI } from 'screeps-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(serverRoot, '../..');

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || 'true'];
}));

const projectName = args.get('project') ?? 'screeps-local';
const serverHost = args.get('serverHost') ?? process.env.SCREEPS_SERVER_HOST ?? process.env.SCREEPS_LAUNCHER_HOST ?? '127.0.0.1';
const apiHost = serverHost === '0.0.0.0' ? '127.0.0.1' : serverHost;
const serverPort = Number(args.get('serverPort') ?? process.env.SCREEPS_SERVER_PORT ?? 21025);
const username = args.get('username') ?? 'swarm-bot';
const password = args.get('password') ?? 'ci-password';
const botBundle = path.resolve(repoRoot, 'packages/screeps-bot/dist/main.js');

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
    env: { SCREEPS_LAUNCHER_HOST: serverHost }
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

async function createApi() {
  const api = new ScreepsAPI({
    email: username,
    password,
    protocol: 'http',
    hostname: apiHost,
    port: serverPort,
    path: '/'
  });
  try {
    await api.raw.register.submit(username, `${username}@local.invalid`, password, { main: 'module.exports.loop = function() {};' });
    log(`registered user ${username}`);
  } catch (error) {
    log(`registration skipped/failed: ${error.message}`);
  }
  await api.auth();
  return api;
}

async function uploadBot(api) {
  if (!fs.existsSync(botBundle)) throw new Error(`Bot bundle missing: ${botBundle}`);
  const code = fs.readFileSync(botBundle, 'utf8');
  await api.raw.user.code.set('default', { main: code });
  log(`uploaded bot bundle to ${username}/default`);
}

async function main() {
  await run('npm', ['run', 'build:mod'], { cwd: repoRoot });
  await run('npm', ['run', 'build:bot'], { cwd: repoRoot });
  await compose('up', '--build', '-d');
  await waitForServer();
  const api = await createApi();
  await uploadBot(api);

  log('local Screeps server is running');
  console.log(`\nConnect local client to: http://${serverHost}:${serverPort}`);
  console.log(`User: ${username}`);
  console.log(`Password: ${password}`);
  console.log(`\nStop:`);
  console.log(`  npm run server:local:down`);
  console.log(`Logs:`);
  console.log(`  npm run server:local:logs`);
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
