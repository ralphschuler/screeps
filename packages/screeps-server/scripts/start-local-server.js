#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_LOCAL_PASSWORD,
  createServerControlPlane,
  isLoopbackHost,
  parseTickRate,
  validateLocalServerCredentials
} from './server-control-plane.js';

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
const cliPort = Number(args.get('cliPort') ?? process.env.SCREEPS_CLI_PORT ?? 21026);
const serverPassword = args.get('serverPassword') ?? process.env.SCREEPS_SERVER_PASSWORD ?? DEFAULT_LOCAL_PASSWORD;
const shardName = args.get('shardName') ?? process.env.SHARD_NAME ?? 'shard0';
const password = args.get('password') ?? process.env.SCREEPS_BOT_PASSWORD ?? DEFAULT_LOCAL_PASSWORD;
const tickRate = parseTickRate(args.get('tickRate') ?? process.env.SCREEPS_TICK_RATE ?? 20);

export { isLoopbackHost, parseTickRate, validateLocalServerCredentials };

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

export function redactCommandArgs(commandArgs) {
  return commandArgs.map(arg => String(arg).replace(/(--(?:serverPassword|password)=)[^\s]+/g, '$1<redacted>'));
}

export function buildComposeEnv({ host, shardName: configuredShardName, serverPort: configuredServerPort, cliPort: configuredCliPort, serverPassword: configuredServerPassword }) {
  return {
    SCREEPS_LAUNCHER_HOST: host,
    SHARD_NAME: configuredShardName,
    SCREEPS_SERVER_PORT: String(configuredServerPort),
    SCREEPS_CLI_PORT: String(configuredCliPort),
    SCREEPS_CLI_PASSWORD: configuredServerPassword
  };
}

function run(command, commandArgs, options = {}) {
  log(`$ ${command} ${redactCommandArgs(commandArgs).join(' ')}`);
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
    env: buildComposeEnv({ host: serverHost, shardName, serverPort, cliPort, serverPassword })
  });
}

const controlPlane = createServerControlPlane({ apiHost, serverPort, cliPort, shardName, tickRate });

async function ensureTerrainData() {
  await controlPlane.ensureTerrainData();
  log(`ensured shard ${shardName} and world terrain cache`);
}

async function setupBotArena() {
  await run('node', [path.resolve(__dirname, 'setup-bot-arena.js'), `--apiHost=${apiHost}`, `--serverPort=${serverPort}`, `--cliPort=${cliPort}`], {
    cwd: repoRoot,
    env: {
      SCREEPS_SERVER_PASSWORD: serverPassword,
      SCREEPS_BOT_PASSWORD: password
    }
  });
}

async function main() {
  validateLocalServerCredentials({ host: serverHost, serverPassword, password });
  await run('npm', ['run', 'build:mod'], { cwd: repoRoot });
  await run('npm', ['run', 'build:bot'], { cwd: repoRoot });
  log(`using host bind ${serverHost}:${serverPort} and CLI ${serverHost}:${cliPort}`);
  await compose('up', '--build', '--force-recreate', '-d');
  await controlPlane.waitForHttpReady();
  await ensureTerrainData();
  await setupBotArena();

  log('local Screeps server is running');
  console.log(`\nConnect local client to: http://${serverHost}:${serverPort}`);
  console.log(`Users: swarm-bot-current, swarm-bot-prev1, swarm-bot-prev2, github-screeps-ai, github-nooby-guide`);
  console.log(`Password: <configured>`);
  console.log(`Server password: <configured>`);
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
