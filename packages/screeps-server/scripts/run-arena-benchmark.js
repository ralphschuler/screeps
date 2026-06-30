#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgMap, writeJson } from "./cpu-benchmark-model.js";
import { buildComposeEnv } from "./start-local-server.js";
import { createServerControlPlane, parseTickRate } from "./server-control-plane.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(serverRoot, "../..");

const ARENA_USERS = [
  "swarm-bot-current",
  "swarm-bot-prev1",
  "swarm-bot-prev2",
  "github-screeps-ai",
  "github-nooby-guide",
  "github-tooangle",
  "github-overmind",
  "github-overlord",
];

function printHelp() {
  console.log(`Usage: node packages/screeps-server/scripts/run-arena-benchmark.js [options]\n\nOptions:\n  --ticks <n>               Max ticks to observe (default 3000)\n  --tickRate <ms>           Private-server tick rate (default 20)\n  --tickPollMs <ms>         Poll interval (default 5000)\n  --outDir <path>           Artifact directory\n  --allowExternalBuilds     Opt in to GitHub public bot builds\n`);
}

function parseOptions(argv = process.argv.slice(2), env = process.env) {
  const args = parseArgMap(argv);
  if (args.has("help") || args.has("h")) return { help: true };
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const ticks = Number(args.get("ticks") ?? 3000);
  const tickRate = parseTickRate(args.get("tickRate") ?? env.SCREEPS_TICK_RATE ?? 20);
  return {
    ticks,
    tickRate,
    tickPollMs: Number(args.get("tickPollMs") ?? 5000),
    outDir: path.resolve(args.get("outDir") ?? path.join(serverRoot, "artifacts", "cpu-benchmark", "arena", stamp)),
    projectName: args.get("project") ?? `screeps-arena-${Date.now()}`.slice(0, 63),
    serverHost: "127.0.0.1",
    apiHost: "127.0.0.1",
    serverPort: Number(args.get("serverPort") ?? 21025),
    cliPort: Number(args.get("cliPort") ?? 21026),
    shardName: args.get("shardName") ?? env.SHARD_NAME ?? "shard0",
    serverPassword: args.get("serverPassword") ?? env.SCREEPS_SERVER_PASSWORD ?? "ci-password",
    password: args.get("password") ?? env.SCREEPS_BOT_PASSWORD ?? "ci-password",
    allowExternalBuilds: args.has("allowExternalBuilds") || env.SCREEPS_ARENA_ALLOW_EXTERNAL_BUILDS === "true",
  };
}

function log(options, message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.mkdirSync(options.outDir, { recursive: true });
  fs.appendFileSync(path.join(options.outDir, "arena.log"), `${line}\n`);
}

function run(command, args, options, runOptions = {}) {
  log(options, `$ ${command} ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: runOptions.cwd ?? repoRoot,
      env: { ...process.env, ...(runOptions.env ?? {}) },
      stdio: runOptions.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (child.stdout) child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    if (child.stderr) child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}\n${stderr}`));
    });
  });
}

async function compose(options, ...composeArgs) {
  return run("docker", ["compose", "-f", "docker-compose.ci.yml", "-p", options.projectName, ...composeArgs], options, {
    cwd: serverRoot,
    env: buildComposeEnv({
      host: options.serverHost,
      shardName: options.shardName,
      serverPort: options.serverPort,
      cliPort: options.cliPort,
      serverPassword: options.serverPassword,
    }),
  });
}

function parseCliJson(output, marker) {
  const markerIndex = output.indexOf(marker);
  if (markerIndex < 0) throw new Error(`marker missing: ${marker}`);
  const after = output.slice(markerIndex + marker.length);
  const start = after.indexOf("[") >= 0 ? after.indexOf("[") : after.indexOf("{");
  const done = after.indexOf("__PI_CLI_DONE_");
  const jsonText = after.slice(start, done >= 0 ? done : undefined).trim();
  return JSON.parse(jsonText);
}

async function collectArenaSummary(options, controlPlane) {
  const command = `Promise.resolve().then(async()=>{ const users=${JSON.stringify(ARENA_USERS)}; const toArray=async(result)=>Array.isArray(result)?result:(result&&result.toArray?await result.toArray():[]); const rows=[]; for(const username of users){ const user=await storage.db.users.findOne({username}); if(!user){ rows.push({username,status:'missing'}); continue; } const memoryKey=storage.env.keys.MEMORY+user._id; let memory={}; try{ memory=JSON.parse(await storage.env.get(memoryKey)||'{}'); }catch(error){ memory={memoryParseError:error.message||String(error)}; } const controllers=await toArray(await storage.db['rooms.objects'].find({type:'controller',user:''+user._id})); const creeps=await toArray(await storage.db['rooms.objects'].find({type:'creep',user:''+user._id})); rows.push({username,status:'present',cpu:user.cpu,cpuAvailable:user.cpuAvailable,rooms:controllers.map(c=>({room:c.room,level:c.level})),creeps:creeps.length,stats:memory.stats&&memory.stats.cpu?{tick:memory.stats.tick,cpu:memory.stats.cpu,rooms:Object.keys(memory.stats.rooms||{}).length,empire:memory.stats.empire}:null,errors:memory.ciCriticalConsoleErrors||0}); } print('__PI_ARENA_SUMMARY__'+JSON.stringify(rows)); }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))`;
  const output = await controlPlane.executeCli(command, 60000);
  if (!output.includes("__PI_CLI_DONE_OK__") || output.includes("__PI_CLI_DONE_ERR__")) throw new Error(`arena summary collection failed:\n${output}`);
  return parseCliJson(output, "__PI_ARENA_SUMMARY__");
}

export async function runArenaBenchmark(options) {
  fs.mkdirSync(options.outDir, { recursive: true });
  fs.writeFileSync(path.join(options.outDir, "arena.log"), "");
  const controlPlane = createServerControlPlane({ apiHost: options.apiHost, serverPort: options.serverPort, cliPort: options.cliPort, shardName: options.shardName, tickRate: options.tickRate });
  const startedAt = new Date().toISOString();
  try {
    await run("npm", ["run", "build:mod"], options, { cwd: repoRoot });
    await run("npm", ["run", "build:bot"], options, { cwd: repoRoot });
    await compose(options, "up", "--build", "--force-recreate", "-d");
    await controlPlane.waitForHttpReady();
    await controlPlane.ensureTerrainData();
    await run("node", [path.join(serverRoot, "scripts", "setup-bot-arena.js"), `--apiHost=${options.apiHost}`, `--serverPort=${options.serverPort}`, `--cliPort=${options.cliPort}`], options, {
      cwd: repoRoot,
      env: {
        SCREEPS_SERVER_PASSWORD: options.serverPassword,
        SCREEPS_BOT_PASSWORD: options.password,
        SCREEPS_ARENA_ALLOW_EXTERNAL_BUILDS: options.allowExternalBuilds ? "true" : "false",
      },
    });

    const startOutput = await controlPlane.executeCli("Promise.resolve().then(async()=>{ print('__PI_TIME__'+JSON.stringify({time:await common.getGametime()})); }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))");
    const startTime = parseCliJson(startOutput, "__PI_TIME__").time;
    let currentTime = startTime;
    while (currentTime - startTime < options.ticks) {
      await new Promise((resolve) => setTimeout(resolve, options.tickPollMs));
      const output = await controlPlane.executeCli("Promise.resolve().then(async()=>{ print('__PI_TIME__'+JSON.stringify({time:await common.getGametime()})); }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))");
      currentTime = parseCliJson(output, "__PI_TIME__").time;
    }

    const users = await collectArenaSummary(options, controlPlane);
    const summary = {
      mode: "arena-benchmark",
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "passed",
      ticksAdvanced: currentTime - startTime,
      allowExternalBuilds: options.allowExternalBuilds,
      users,
      allySafety: { permanentAlliesRemainNonHostileNames: ["TooAngel", "TedRoastBeef"], note: "Public bot usernames are not exact permanent ally names." },
    };
    writeJson(path.join(options.outDir, "summary.json"), summary);
    return summary;
  } catch (error) {
    const summary = { mode: "arena-benchmark", startedAt, finishedAt: new Date().toISOString(), status: "failed", error: error.stack || error.message || String(error) };
    writeJson(path.join(options.outDir, "summary.json"), summary);
    throw error;
  } finally {
    await compose(options, "down", "-v", "--remove-orphans").catch((error) => log(options, `compose cleanup failed: ${error.message}`));
  }
}

async function main() {
  const options = parseOptions();
  if (options.help) {
    printHelp();
    return;
  }
  const summary = await runArenaBenchmark(options);
  console.log(`wrote ${path.join(options.outDir, "summary.json")}`);
  console.log(`status=${summary.status} ticks=${summary.ticksAdvanced}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
