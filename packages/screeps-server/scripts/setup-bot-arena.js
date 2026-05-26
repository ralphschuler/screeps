#!/usr/bin/env node

import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
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

const apiHost = args.get('apiHost') ?? '127.0.0.1';
const serverPort = Number(args.get('serverPort') ?? process.env.SCREEPS_SERVER_PORT ?? 21025);
const cliPort = Number(args.get('cliPort') ?? process.env.SCREEPS_CLI_PORT ?? 21026);
const serverPassword = args.get('serverPassword') ?? process.env.SCREEPS_SERVER_PASSWORD ?? 'ci-password';
const password = args.get('password') ?? process.env.SCREEPS_BOT_PASSWORD ?? 'ci-password';
const allowExternalBuilds = args.get('allowExternalBuilds') === 'true' || process.env.SCREEPS_ARENA_ALLOW_EXTERNAL_BUILDS === 'true';

const roster = [
  {
    username: 'swarm-bot-current',
    room: 'W1N1',
    source: 'working-tree',
    modules: () => ({ main: fs.readFileSync(path.resolve(repoRoot, 'packages/screeps-bot/dist/main.js'), 'utf8') }),
    legacyUsername: 'swarm-bot'
  },
  {
    username: 'swarm-bot-prev1',
    room: 'W1N9',
    source: 'git:HEAD~1'
  },
  {
    username: 'swarm-bot-prev2',
    room: 'W9N1',
    source: 'git:HEAD~2'
  },
  {
    username: 'github-screeps-ai',
    room: 'W5N9',
    source: 'github:jerroydmoore/screeps-ai@7d77d55167560f525e9e4ca7e1109c88f369b791'
  },
  {
    username: 'github-nooby-guide',
    room: 'W9N9',
    source: 'github:Tim-Pohlmann/Screeps-Nooby-Guide@e65a2b2117a46b765bd232f0067e1d65a1abee62'
  },
  {
    username: 'github-tooangle',
    room: 'W1N5',
    source: 'github:Lexxicon/tooAngleScreeps@b68374abef2c16310579a9a9f514c1d5e62e6a8c'
  },
  {
    username: 'github-overmind',
    room: 'W3N9',
    source: 'github:bencbartlett/Overmind@5eca49a0d988a1f810a11b9c73d4d8961efca889'
  },
  {
    username: 'github-overlord',
    room: 'W5N1',
    source: 'github:Firefreek/Overlord-Screeps@800100cd2f2da360bcd563f0960aeca0b22575c3'
  }
];

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd ?? repoRoot,
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${commandArgs.join(' ')} exited ${code}\n${stderr}`));
    });
  });
}

async function gitShowAsync(ref) {
  const { stdout } = await run('git', ['show', ref], { cwd: repoRoot });
  if (!stdout.trim()) throw new Error(`Empty git content for ${ref}`);
  return stdout;
}

async function cloneRepo(repo, commit) {
  const baseDir = path.join(os.tmpdir(), 'screeps-arena-bots');
  const targetDir = path.join(baseDir, `${repo.replaceAll('/', '__')}__${commit.slice(0, 12)}`);
  if (fs.existsSync(path.join(targetDir, '.git'))) return targetDir;
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(baseDir, { recursive: true });
  await run('git', ['clone', '--quiet', '--no-checkout', `https://github.com/${repo}.git`, targetDir]);
  await run('git', ['checkout', '--quiet', commit], { cwd: targetDir });
  return targetDir;
}

function collectJsModules(rootDir, sourceDir) {
  const sourceRoot = path.resolve(rootDir, sourceDir);
  const modules = {};

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'test' || entry.name === 'tests' || entry.name === 'ScreepsAutocomplete-master') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (sourceDir === '.' && dir === sourceRoot) continue;
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'Gruntfile.js' && entry.name !== 'rollup.config.js') {
        const relative = path.relative(sourceRoot, fullPath).replace(/\\/g, '/');
        const moduleName = relative.slice(0, -3).replace(/\//g, '.');
        modules[moduleName] = fs.readFileSync(fullPath, 'utf8');
      }
    }
  }

  walk(sourceRoot);
  if (!modules.main) throw new Error(`No main.js module found in ${sourceRoot}`);
  return modules;
}

async function githubJsModulesAsync({ repo, commit, sourceDir }) {
  const rootDir = await cloneRepo(repo, commit);
  return collectJsModules(rootDir, sourceDir);
}

async function githubBuiltMainAsync({ repo, commit, buildScript, patch }) {
  const rootDir = await cloneRepo(repo, commit);
  const distFile = path.join(rootDir, 'dist', 'main.js');
  if (fs.existsSync(distFile)) return { main: fs.readFileSync(distFile, 'utf8') };
  if (patch) await patch(rootDir);
  await run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: rootDir });
  if (patch) await patch(rootDir);
  await run('npm', ['run', buildScript], { cwd: rootDir });
  if (!fs.existsSync(distFile)) throw new Error(`Build did not create ${distFile}`);
  return { main: fs.readFileSync(distFile, 'utf8') };
}

async function patchOvermind(rootDir) {
  const rollupConfig = path.join(rootDir, 'rollup.config.js');
  if (!fs.existsSync(rollupConfig)) return;
  let source = fs.readFileSync(rollupConfig, 'utf8');
  source = source.replace('import progress from "rollup-plugin-progress";\n', '');
  source = source.replace('        progress({clearLine: true}),\n', '');
  fs.writeFileSync(rollupConfig, source);
}

function cliEval(command, timeoutMs = 60000) {
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
    socket.on('connect', () => socket.write(`${command}\n`));
  });
}

async function ensureArenaUser(bot) {
  const command = `Promise.resolve().then(async()=>{ const username=${JSON.stringify(bot.username)}; const legacyUsername=${JSON.stringify(bot.legacyUsername ?? '')}; const room=${JSON.stringify(bot.room)}; let user=await storage.db.users.findOne({username}); if(!user&&legacyUsername){ const legacy=await storage.db.users.findOne({username:legacyUsername}); const legacyController=legacy&&await storage.db['rooms.objects'].findOne({type:'controller',user:''+legacy._id,room}); if(legacy&&legacyController){ await storage.db.users.update({_id:legacy._id},{$set:{username,bot:username,active:10000,cpu:100}}); user=await storage.db.users.findOne({_id:legacy._id}); } } if(!user){ const controller=await storage.db['rooms.objects'].findOne({type:'controller',room}); if(controller&&controller.user) throw new Error('Room '+room+' is already owned by '+controller.user); await bots.spawn('simplebot',room,{username,cpu:100,gcl:1,x:25,y:25}); user=await storage.db.users.findOne({username}); } await storage.db.users.update({_id:user._id},{$set:{active:10000,cpu:100,bot:username}}); await setPassword(username,${JSON.stringify(password)}); const activeCode=await storage.db['users.code'].findOne({user:''+user._id,activeWorld:true}); if(!activeCode){ await storage.db['users.code'].insert({user:''+user._id,modules:{main:''},branch:'default',activeWorld:true,activeSim:true}); } }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))`;
  const output = await cliEval(command);
  if (!output.includes('__PI_CLI_DONE_OK__') || output.includes('__PI_CLI_DONE_ERR__')) {
    throw new Error(`Failed to ensure arena user ${bot.username}. CLI output:\n${output}`);
  }
}

async function createApi(username) {
  const api = new ScreepsAPI({
    email: username,
    password,
    protocol: 'http',
    hostname: apiHost,
    port: serverPort,
    path: '/'
  });
  api.http.defaults.headers.common['X-Server-Password'] = serverPassword;
  const auth = await api.auth();
  if (!auth?.ok || !auth.token) throw new Error(`Authentication failed for ${username}: ${JSON.stringify(auth)}`);
  return api;
}

async function loadModules(bot) {
  if (bot.source.startsWith('github:') && !allowExternalBuilds) {
    throw new Error('external bot builds are disabled; set --allowExternalBuilds=true to opt in');
  }
  if (bot.source === 'git:HEAD~1') return { main: await gitShowAsync('HEAD~1:packages/screeps-bot/dist/main.js') };
  if (bot.source === 'git:HEAD~2') return { main: await gitShowAsync('HEAD~2:packages/screeps-bot/dist/main.js') };
  if (bot.source.startsWith('github:jerroydmoore/screeps-ai')) {
    return githubJsModulesAsync({ repo: 'jerroydmoore/screeps-ai', commit: '7d77d55167560f525e9e4ca7e1109c88f369b791', sourceDir: 'src' });
  }
  if (bot.source.startsWith('github:Tim-Pohlmann/Screeps-Nooby-Guide')) {
    return githubJsModulesAsync({ repo: 'Tim-Pohlmann/Screeps-Nooby-Guide', commit: 'e65a2b2117a46b765bd232f0067e1d65a1abee62', sourceDir: '.' });
  }
  if (bot.source.startsWith('github:Lexxicon/tooAngleScreeps')) {
    return githubJsModulesAsync({ repo: 'Lexxicon/tooAngleScreeps', commit: 'b68374abef2c16310579a9a9f514c1d5e62e6a8c', sourceDir: 'src' });
  }
  if (bot.source.startsWith('github:bencbartlett/Overmind')) {
    return githubBuiltMainAsync({ repo: 'bencbartlett/Overmind', commit: '5eca49a0d988a1f810a11b9c73d4d8961efca889', buildScript: 'compile', patch: patchOvermind });
  }
  if (bot.source.startsWith('github:Firefreek/Overlord-Screeps')) {
    return githubJsModulesAsync({ repo: 'Firefreek/Overlord-Screeps', commit: '800100cd2f2da360bcd563f0960aeca0b22575c3', sourceDir: 'src' });
  }
  return bot.modules();
}

async function uploadBot(bot) {
  await ensureArenaUser(bot);
  const modules = await loadModules(bot);
  const api = await createApi(bot.username);
  const result = await api.raw.user.code.set('$activeWorld', modules);
  if (!result?.ok) throw new Error(`Upload failed for ${bot.username}: ${JSON.stringify(result)}`);
  log(`uploaded ${bot.username} (${bot.source}) to ${bot.room}; modules=${Object.keys(modules).length}`);
}

async function main() {
  const results = [];
  for (const bot of roster) {
    try {
      await uploadBot(bot);
      results.push({ username: bot.username, status: 'uploaded' });
    } catch (error) {
      const optional = bot.source.startsWith('github:') || bot.source.startsWith('git:HEAD~');
      if (!optional) throw error;
      const message = error instanceof Error ? error.message : String(error);
      log(`skipped ${bot.username} (${bot.source}): ${message}`);
      results.push({ username: bot.username, status: 'skipped', reason: message });
    }
  }
  log(`bot arena ready: ${results.filter(result => result.status === 'uploaded').length} uploaded, ${results.filter(result => result.status === 'skipped').length} skipped`);
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
