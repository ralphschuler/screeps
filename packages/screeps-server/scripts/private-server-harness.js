import net from "node:net";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { appendCpuBenchmarkSample } from "./cpu-benchmark-model.js";
import { ensureLiveCloneAuth, seedLiveCloneSnapshot } from "./live-clone-seeder.js";
import { createServerControlPlane, parseTickRate } from "./server-control-plane.js";

const legacyApiRequire = createRequire(new URL("../../../package.json", import.meta.url));
const ScreepsAPI = resolveScreepsApiConstructor(legacyApiRequire("screeps-api"));

export function resolveScreepsApiConstructor(moduleNamespace) {
  const candidates = [
    moduleNamespace?.ScreepsAPI,
    moduleNamespace?.default?.ScreepsAPI,
    moduleNamespace?.default,
    moduleNamespace
  ];
  const constructor = candidates.find((candidate) => typeof candidate === "function");
  if (!constructor) throw new TypeError("screeps-api module did not expose a ScreepsAPI constructor");
  return constructor;
}

const DEFAULT_RUNTIME_WARMUP_TICKS = 100;
const DEFAULT_SMOKE_DURATION_MINUTES = 15;
const DEFAULT_SMOKE_MAX_TICKS = 3000;
const DEFAULT_RUNTIME_SCENARIOS = [
  "default-bootstrap",
  "construction-economy",
  "remote-mining",
  "defense-hostile",
  "defense-hard-invader",
  "alliance-safety",
];

export function parseScenarioList(rawValue, defaults = DEFAULT_RUNTIME_SCENARIOS) {
  if (rawValue === undefined || rawValue === null || rawValue === "") return defaults.slice();
  const value = String(rawValue).trim();
  if (value.toLowerCase() === "none") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_SERVER_ROOT = path.resolve(__dirname, "..");
const DEFAULT_REPO_ROOT = path.resolve(DEFAULT_SERVER_ROOT, "../..");

function parseArgMap(argv) {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;

    const [key, ...rest] = arg.slice(2).split("=");
    const hasEquals = arg.includes("=");

    if (hasEquals) {
      args.set(key, rest.join("="));
      continue;
    }

    const nextValue = argv[index + 1];
    if (nextValue && !nextValue.startsWith("--")) {
      args.set(key, nextValue);
      index += 1;
    } else {
      args.set(key, "true");
    }
  }

  return args;
}

export { parseTickRate };

export function parseRuntimeWarmupTicks(
  rawValue,
  configPath = path.resolve(DEFAULT_SERVER_ROOT, "config.ci.yml"),
  env = process.env,
) {
  const runtimeWarmupOverride = rawValue ?? env.SCREEPS_RUNTIME_WARMUP_TICKS;
  if (runtimeWarmupOverride !== undefined) {
    const parsed = Number(runtimeWarmupOverride);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new Error("runtimeWarmupTicks must be a non-negative integer");
    }
    return parsed;
  }

  try {
    const configText = fs.readFileSync(configPath, "utf8");
    const match = /runtimeWarmupTicks:\s*(\d+)/.exec(configText);
    if (match?.[1]) {
      const parsed = Number(match[1]);
      if (Number.isInteger(parsed) && parsed >= 0) return parsed;
    }
  } catch {
    // Keep default if config is unavailable/unreadable.
  }

  return DEFAULT_RUNTIME_WARMUP_TICKS;
}

export function parseHarnessArgs(
  argv = process.argv.slice(2),
  env = process.env,
  roots = {},
) {
  const args = parseArgMap(argv);
  const serverRoot = roots.serverRoot ?? DEFAULT_SERVER_ROOT;
  const repoRoot = roots.repoRoot ?? DEFAULT_REPO_ROOT;
  const mode = args.get("mode") ?? "smoke";

  return {
    mode,
    durationMinutes: Number(
      args.get("durationMinutes") ?? (mode === "long" ? 120 : DEFAULT_SMOKE_DURATION_MINUTES),
    ),
    maxTicks: Number(args.get("maxTicks") ?? (mode === "long" ? 72000 : DEFAULT_SMOKE_MAX_TICKS)),
    tickPollMs: Number(args.get("tickPollMs") ?? 10000),
    tickRate: parseTickRate(args.get("tickRate") ?? env.SCREEPS_TICK_RATE ?? 20),
    runtimeWarmupTicks: parseRuntimeWarmupTicks(
      args.get("runtimeWarmupTicks"),
      path.resolve(serverRoot, "config.ci.yml"),
      env,
    ),
    serverPort: Number(args.get("serverPort") ?? 21025),
    cliPort: Number(args.get("cliPort") ?? 21026),
    launcherHost: env.SCREEPS_LAUNCHER_HOST ?? "127.0.0.1",
    serverPassword:
      args.get("serverPassword") ??
      env.SCREEPS_SERVER_PASSWORD ??
      "ci-password",
    shardName: args.get("shardName") ?? env.SHARD_NAME ?? "shard0",
    username: args.get("username") ?? "swarm-bot",
    password: args.get("password") ?? "ci-password",
    roomName: args.get("room") ?? "W1N1",
    projectName: args.get("project") ?? `screeps-ci-${mode}`,
    scenarios: parseScenarioList(args.get("scenarios") ?? env.SCREEPS_TEST_SCENARIOS),
    artifactsDir: path.resolve(args.get("artifactsDir") ?? path.resolve(serverRoot, "artifacts", mode)),
    botBundle: path.resolve(args.get("botBundle") ?? path.resolve(repoRoot, "packages/screeps-bot/dist/main.js")),
    liveCloneSnapshot: args.get("liveCloneSnapshot") ?? env.SCREEPS_LIVE_CLONE_SNAPSHOT,
    serverRoot,
    repoRoot,
  };
}

function isPortAvailable(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const server = net.createServer();
    const done = (isAvailable) => {
      try {
        server.close();
      } catch {}
      resolve(isAvailable);
    };

    server.once("error", (error) => {
      if (error?.code === "EADDRINUSE") return done(false);
      done(false);
    });

    server.once("listening", () => done(true));
    server.listen(port, host);
  });
}

export async function resolveAvailablePorts({
  serverPort,
  cliPort,
  launcherHost = "127.0.0.1",
  maxAttempts = 25,
  isPortAvailableFn = isPortAvailable,
}) {
  const baseServerPort = serverPort;
  const baseCliPort = cliPort;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const serverAvailable = await isPortAvailableFn(serverPort, launcherHost);
    const cliAvailable = await isPortAvailableFn(cliPort, launcherHost);

    if (serverAvailable && cliAvailable) {
      return {
        serverPort,
        cliPort,
        fallbackUsed: attempt > 0,
        baseServerPort,
        baseCliPort,
        attemptedPairs: attempt,
      };
    }

    serverPort += 2;
    cliPort += 2;
  }

  throw new Error(
    `Unable to find free server/CLI port pair after ${maxAttempts} attempts starting at ${baseServerPort}/${baseCliPort}`,
  );
}

export function createInitialSummary(options, now = new Date()) {
  return {
    mode: options.mode,
    startedAt: now.toISOString(),
    durationMinutes: options.durationMinutes,
    maxTicks: options.maxTicks,
    serverPort: options.serverPort,
    tickRate: options.tickRate,
    roomName: options.roomName,
    scenarios: options.scenarios ?? [],
    liveCloneSnapshot: options.liveCloneSnapshot ?? null,
    botBundle: options.botBundle ?? null,
    checks: {},
    metrics: {},
    errors: [],
    startedGameTime: null,
    finishedGameTime: null,
    finishedAt: null,
    status: "running",
  };
}

export function decodeMemoryData(data) {
  if (!data) return {};
  if (typeof data !== "string") return data;
  if (data.startsWith("gz:")) {
    const buffer = Buffer.from(data.slice(3), "base64");
    return JSON.parse(zlib.gunzipSync(buffer).toString("utf8") || "{}");
  }
  return JSON.parse(data || "{}");
}

export function inspectMemorySnapshot(memory, summary, now = new Date(), options = {}) {
  const playerSummary = memory.screepsmodTestingPlayer;
  const backendSummary = memory.screepsmodTestingBackend;
  const testSummary = memory.screepsmodTesting ?? playerSummary ?? backendSummary;
  const taskBoard = memory.creepTaskBoard;

  summary.metrics.lastMemorySeenAt = now.toISOString();
  summary.metrics.screepsmodTesting =
    testSummary ?? summary.metrics.screepsmodTesting ?? null;
  if (playerSummary) summary.metrics.screepsmodTestingPlayer = playerSummary;
  if (backendSummary) summary.metrics.screepsmodTestingBackend = backendSummary;
  summary.metrics.taskBoardRooms = Object.keys(taskBoard?.rooms ?? {}).length;
  summary.metrics.criticalConsoleErrors = memory.ciCriticalConsoleErrors ?? 0;
  appendCpuBenchmarkSample(memory, summary);

  if (testSummary) {
    summary.checks.modResultsPresent = true;
    if ((testSummary.failed ?? 0) > 0 && options.mode !== "cpu-benchmark") {
      throw new Error(
        `screepsmod-testing reported ${testSummary.failed} failed tests`,
      );
    }
  } else if ((summary.metrics.screepsmodTesting?.failed ?? 0) > 0 && options.mode !== "cpu-benchmark") {
    throw new Error(
      `screepsmod-testing reported ${summary.metrics.screepsmodTesting.failed} failed tests`,
    );
  }
}

export function prepareArtifactsDir(options) {
  fs.mkdirSync(options.artifactsDir, { recursive: true });
  fs.writeFileSync(path.join(options.artifactsDir, "harness.log"), "");
}

function createLogger(options) {
  return function log(message) {
    const line = `[${new Date().toISOString()}] ${message}`;
    console.log(line);
    fs.appendFileSync(
      path.join(options.artifactsDir, "harness.log"),
      `${line}\n`,
    );
  };
}

function runShell(command, commandArgs, options, log, runOptions = {}) {
  log(`$ ${command} ${commandArgs.join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: runOptions.cwd ?? options.repoRoot,
      env: { ...process.env, ...(runOptions.env ?? {}) },
      stdio: runOptions.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });

    let stdout = "";
    let stderr = "";
    if (child.stdout)
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
    if (child.stderr)
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else
        reject(
          new Error(
            `${command} ${commandArgs.join(" ")} exited ${code}\n${stderr}`,
          ),
        );
    });
  });
}

function compose(options, log, ...composeArgs) {
  return runShell(
    "docker",
    [
      "compose",
      "-f",
      "docker-compose.ci.yml",
      "-p",
      options.projectName,
      ...composeArgs,
    ],
    options,
    log,
    {
      cwd: options.serverRoot,
      env: {
        SCREEPS_LAUNCHER_HOST: options.launcherHost,
        SHARD_NAME: options.shardName,
        SCREEPS_SERVER_PORT: String(options.serverPort),
        SCREEPS_CLI_PORT: String(options.cliPort),
        SCREEPS_TEST_SCENARIOS: (options.scenarios ?? []).length ? (options.scenarios ?? []).join(",") : "none",
      },
    },
  );
}

export async function restartScreepsRuntime(options, controlPlane, log, composeFn = compose) {
  log("restarting Screeps service so runtime reloads generated terrain data");
  await composeFn(options, log, "restart", "screeps");
  await controlPlane.waitForHttpReady();
}

function cliEval(options, command, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({
      host: "127.0.0.1",
      port: options.cliPort,
    });
    let output = "";
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(
        new Error(
          `Timed out waiting for CLI command result. Output:\n${output}`,
        ),
      );
    }, timeoutMs);

    socket.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes("__PI_CLI_DONE_")) {
        clearTimeout(timeout);
        socket.end();
        resolve(output);
      }
    });
    socket.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    socket.on("connect", () => {
      socket.write(`${command}\n`);
    });
  });
}

async function ensureTerrainData(summary, controlPlane) {
  await controlPlane.ensureTerrainData();
  summary.checks.terrainDataReady = true;
}

export function buildEnsureBotUserCommand(options) {
  return `Promise.resolve().then(async()=>{ const username=${JSON.stringify(options.username)}; const requestedRoom=${JSON.stringify(options.roomName)}; const password=${JSON.stringify(options.password)}; const SOURCE_ENERGY=1500; const ENERGY_REGEN_TIME=300; const SPAWN_ENERGY_START=300; const SPAWN_ENERGY_CAPACITY=300; const SPAWN_HITS=5000; const plainTerrain='0'.repeat(2500); const terrainForBootstrapRoom=()=>{ let terrain=plainTerrain; for (const [x,y] of [[10,10],[40,10],[25,40]]) { const index=y*50+x; terrain=terrain.slice(0,index)+'1'+terrain.slice(index+1); } return terrain; }; const toArray=async(result)=>Array.isArray(result)?result:(result&&result.toArray?await result.toArray():[]); const ensureBootstrapRoom=async(roomName)=>{ let room=await storage.db.rooms.findOne({_id:roomName}); if(!room){ await storage.db.rooms.insert({_id:roomName,status:'normal',sourceKeepers:false}); } else if(room.status!=='normal'){ await storage.db.rooms.update({_id:roomName},{$set:{status:'normal'}}); } const terrainValue=terrainForBootstrapRoom(); const terrainRecord=await storage.db['rooms.terrain'].findOne({room:roomName}); if(!terrainRecord){ await storage.db['rooms.terrain'].insert({room:roomName,terrain:terrainValue}); } else if(!terrainRecord.terrain){ await storage.db['rooms.terrain'].update({room:roomName},{$set:{terrain:terrainValue}}); } let controller=await storage.db['rooms.objects'].findOne({type:'controller',room:roomName}); if(!controller){ await storage.db['rooms.objects'].insert({room:roomName,type:'controller',x:25,y:40,level:0}); controller=await storage.db['rooms.objects'].findOne({type:'controller',room:roomName}); } const sources=await toArray(await storage.db['rooms.objects'].find({type:'source',room:roomName})); if(sources.length===0){ await storage.db['rooms.objects'].insert([[10,10],[40,10]].map(([x,y])=>({room:roomName,type:'source',x,y,energy:SOURCE_ENERGY,energyCapacity:SOURCE_ENERGY,ticksToRegeneration:ENERGY_REGEN_TIME}))); } await map.openRoom(roomName); await map.updateTerrainData(); return controller; }; const userHasOwnedRoom=async(targetUser)=>{ if(!targetUser || !targetUser._id) return false; const ownedController=await storage.db['rooms.objects'].findOne({type:'controller',user:''+targetUser._id}); return Boolean(ownedController); }; const ensureRoomSpawnForUser=async(targetUser,roomName)=>{ const userId=''+targetUser._id; const existingSpawn=await storage.db['rooms.objects'].findOne({type:'spawn',room:roomName,user:userId}); const spawnEnergyFields={energy:SPAWN_ENERGY_START,energyCapacity:SPAWN_ENERGY_CAPACITY,store:{energy:SPAWN_ENERGY_START},storeCapacityResource:{energy:SPAWN_ENERGY_CAPACITY},hits:SPAWN_HITS,hitsMax:SPAWN_HITS,spawning:null,notifyWhenAttacked:false}; if(!existingSpawn){ await storage.db['rooms.objects'].insert({type:'spawn',room:roomName,x:25,y:25,name:'Spawn1',user:userId,...spawnEnergyFields}); } else { await storage.db['rooms.objects'].update({_id:existingSpawn._id},{$set:spawnEnergyFields}); } const gameTime=typeof common!=='undefined'&&common.getGametime?await common.getGametime():0; const ownedController=await storage.db['rooms.objects'].findOne({type:'controller',room:roomName}); const controllerLevel=Math.max(1,Number(ownedController&&ownedController.level)||1); await storage.db['rooms.objects'].update({$and:[{room:roomName},{type:'controller'}]},{$set:{user:userId,level:controllerLevel,progress:0,downgradeTime:null,safeMode:gameTime+20000}}); await storage.db.rooms.update({_id:roomName},{$set:{invaderGoal:1000000}}); }; let user=await storage.db.users.findOne({username}); let spawnRoom=requestedRoom; let controller=await storage.db['rooms.objects'].findOne({type:'controller',room:requestedRoom}); const requestedTerrain=await storage.db['rooms.terrain'].findOne({room:requestedRoom}); if(!controller||!requestedTerrain?.terrain){ controller=await ensureBootstrapRoom(requestedRoom); } if(!controller||controller.user){ const controllersResult=await storage.db['rooms.objects'].find({type:'controller'}); const controllers=await toArray(controllersResult); const fallback=controllers.find(item=>item&&item.room&&!item.user); if(!fallback){ await storage.db['rooms.objects'].update({_id:controller._id},{$set:{user:null}}); spawnRoom=requestedRoom; controller=await ensureBootstrapRoom(spawnRoom); } else { spawnRoom=fallback.room; controller=await ensureBootstrapRoom(spawnRoom); } } else { await ensureBootstrapRoom(spawnRoom); } const ensureUserRecord=async()=>{ let found=await storage.db.users.findOne({username}); if(found) return found; await storage.db.users.insert({username,cpu:100,gcl:1,active:10000,cpuAvailable:10000}); return storage.db.users.findOne({username}); }; if(!user){ try{ await bots.spawn('swarm-bot',spawnRoom,{username,cpu:100,gcl:1,x:25,y:25}); }catch(error){ const message=error&&error.message?error.message:String(error); if(message.indexOf('already owned')<0) throw error; } user=await ensureUserRecord(); } if(!user) throw new Error('No user could be created for '+username); await ensureRoomSpawnForUser(user,spawnRoom); if(!(await userHasOwnedRoom(user))) throw new Error('No owned room could be assigned to user '+username); await storage.db.users.update({_id:user._id},{$set:{active:10000,cpu:100,cpuAvailable:10000,bot:username}}); await setPassword(username,password); const activeCode=await storage.db['users.code'].findOne({user:''+user._id,activeWorld:true}); if(!activeCode){ await storage.db['users.code'].insert({user:''+user._id,modules:{main:''},branch:'default',activeWorld:true,activeSim:true}); } }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))`;
}


export function buildSeedRuntimeScenariosCommand(options) {
  const scenarios = options.scenarios ?? [];
  return `Promise.resolve().then(async()=>{ const username=${JSON.stringify(options.username)}; const requestedRoom=${JSON.stringify(options.roomName)}; const scenarios=${JSON.stringify(scenarios)}; if(!scenarios.length) return; const SOURCE_ENERGY=1500; const ENERGY_REGEN_TIME=300; const plainTerrain='0'.repeat(2500); const toArray=async(result)=>Array.isArray(result)?result:(result&&result.toArray?await result.toArray():[]); const hasScenario=name=>scenarios.indexOf(name)>=0; const ensureRoom=async(roomName)=>{ let room=await storage.db.rooms.findOne({_id:roomName}); if(!room){ await storage.db.rooms.insert({_id:roomName,status:'normal',sourceKeepers:false}); } else if(room.status!=='normal'){ await storage.db.rooms.update({_id:roomName},{$set:{status:'normal'}}); } const terrainRecord=await storage.db['rooms.terrain'].findOne({room:roomName}); if(!terrainRecord){ await storage.db['rooms.terrain'].insert({room:roomName,terrain:plainTerrain}); } else if(!terrainRecord.terrain){ await storage.db['rooms.terrain'].update({room:roomName},{$set:{terrain:plainTerrain}}); } let controller=await storage.db['rooms.objects'].findOne({type:'controller',room:roomName}); if(!controller){ await storage.db['rooms.objects'].insert({room:roomName,type:'controller',x:25,y:40,level:0}); controller=await storage.db['rooms.objects'].findOne({type:'controller',room:roomName}); } const sources=await toArray(await storage.db['rooms.objects'].find({type:'source',room:roomName})); if(sources.length===0){ await storage.db['rooms.objects'].insert([[10,10],[40,10]].map(([x,y])=>({room:roomName,type:'source',x,y,energy:SOURCE_ENERGY,energyCapacity:SOURCE_ENERGY,ticksToRegeneration:ENERGY_REGEN_TIME}))); } await map.openRoom(roomName); return controller; }; const ensureUser=async(name)=>{ let user=await storage.db.users.findOne({username:name}); if(!user){ await storage.db.users.insert({username:name}); user=await storage.db.users.findOne({username:name}); } return user; }; const upsertObject=async(query,doc)=>{ const existing=await storage.db['rooms.objects'].findOne(query); if(existing&&existing._id){ await storage.db['rooms.objects'].update({_id:existing._id},{$set:doc}); return existing._id; } await storage.db['rooms.objects'].insert(doc); const created=await storage.db['rooms.objects'].findOne(query); return created&&created._id; }; const botUser=await storage.db.users.findOne({username}); if(!botUser||!botUser._id) throw new Error('No bot user for runtime scenario seeding: '+username); const userId=''+botUser._id; const homeController=await storage.db['rooms.objects'].findOne({type:'controller',user:userId})||await ensureRoom(requestedRoom); const homeRoom=homeController.room||requestedRoom; await ensureRoom(homeRoom); const remoteRoom='W1N2'; const allianceRoom='W1N3'; if(hasScenario('construction-economy')){ await upsertObject({type:'constructionSite',room:homeRoom,x:26,y:25,user:userId},{type:'constructionSite',room:homeRoom,x:26,y:25,user:userId,structureType:'extension',progress:0,progressTotal:300}); } if(hasScenario('remote-mining')){ await ensureRoom(remoteRoom); } if(hasScenario('defense-hostile')){ const enemy=await ensureUser('ScenarioEnemy'); const enemyId=''+enemy._id; const defenseRoom=homeRoom; await ensureRoom(defenseRoom); await upsertObject({type:'creep',room:defenseRoom,name:'ScenarioEnemyAttacker'},{type:'creep',room:defenseRoom,x:24,y:25,name:'ScenarioEnemyAttacker',user:enemyId,body:[{type:'attack',hits:100},{type:'move',hits:100}],hits:200,hitsMax:200,fatigue:0,spawning:false,ticksToLive:1500,notifyWhenAttacked:false}); } if(hasScenario('defense-hard-invader')){ const hardEnemy=await ensureUser('ScenarioHardInvader'); const hardEnemyId=''+hardEnemy._id; const defenseRoom=homeRoom; await ensureRoom(defenseRoom); await storage.db['rooms.objects'].update({$and:[{room:defenseRoom},{type:'controller'}]},{$set:{user:userId,level:4,progress:0,downgradeTime:null,safeMode:null}}); const extensionPositions=[[24,24],[25,24],[26,24],[24,26],[25,26],[26,26],[27,24],[27,25],[27,26],[23,24]]; for(const [x,y] of extensionPositions){ await upsertObject({type:'extension',room:defenseRoom,user:userId,x,y},{type:'extension',room:defenseRoom,x,y,user:userId,energy:50,energyCapacity:50,store:{energy:50},storeCapacityResource:{energy:50},hits:1000,hitsMax:1000,notifyWhenAttacked:false}); } const hardBodyTypes=[...Array(5).fill('tough'),...Array(25).fill('ranged_attack'),...Array(10).fill('move'),...Array(10).fill('heal')]; const hardBody=hardBodyTypes.map(type=>({type,hits:100})); await upsertObject({type:'creep',room:defenseRoom,name:'ScenarioHardInvader'},{type:'creep',room:defenseRoom,x:23,y:25,name:'ScenarioHardInvader',user:hardEnemyId,body:hardBody,hits:hardBody.length*100,hitsMax:hardBody.length*100,fatigue:0,spawning:false,ticksToLive:5000,notifyWhenAttacked:false}); } if(hasScenario('alliance-safety')){ const ally=await ensureUser('TooAngel'); const allyId=''+ally._id; await ensureRoom(allianceRoom); await upsertObject({type:'creep',room:allianceRoom,name:'TooAngelScenarioAlly'},{type:'creep',room:allianceRoom,x:25,y:25,name:'TooAngelScenarioAlly',user:allyId,body:[{type:'move',hits:100}],hits:100,hitsMax:100,fatigue:0,spawning:false,ticksToLive:1500,notifyWhenAttacked:false}); } if(hasScenario('link-network')){ await storage.db['rooms.objects'].update({$and:[{room:homeRoom},{type:'controller'}]},{$set:{user:userId,level:7,progress:0,downgradeTime:null}}); await upsertObject({type:'storage',room:homeRoom,user:userId},{type:'storage',room:homeRoom,x:24,y:25,user:userId,store:{energy:50000},storeCapacityResource:{energy:1000000},hits:1000000,hitsMax:1000000,notifyWhenAttacked:false}); } if(hasScenario('terminal-market-lab-economy')){ const economyRoom='W2N1'; await ensureRoom(economyRoom); await storage.db['rooms.objects'].update({$and:[{room:homeRoom},{type:'controller'}]},{$set:{user:userId,level:7,progress:0,downgradeTime:null}}); await storage.db['rooms.objects'].update({$and:[{room:economyRoom},{type:'controller'}]},{$set:{user:userId,level:6,progress:0,downgradeTime:null}}); await upsertObject({type:'storage',room:homeRoom,user:userId},{type:'storage',room:homeRoom,x:24,y:25,user:userId,store:{energy:200000,H:12000,O:12000},storeCapacityResource:{energy:1000000,H:1000000,O:1000000},hits:1000000,hitsMax:1000000,notifyWhenAttacked:false}); await upsertObject({type:'terminal',room:homeRoom,user:userId},{type:'terminal',room:homeRoom,x:25,y:26,user:userId,store:{energy:30000,H:6000,O:6000},storeCapacityResource:{energy:300000,H:300000,O:300000},cooldown:0,hits:300000,hitsMax:300000,notifyWhenAttacked:false}); await upsertObject({type:'terminal',room:economyRoom,user:userId},{type:'terminal',room:economyRoom,x:25,y:25,user:userId,store:{energy:5000},storeCapacityResource:{energy:300000},cooldown:0,hits:300000,hitsMax:300000,notifyWhenAttacked:false}); await upsertObject({type:'lab',room:homeRoom,user:userId,x:23,y:25},{type:'lab',room:homeRoom,x:23,y:25,user:userId,mineralType:'H',store:{H:2000},storeCapacityResource:{H:3000},cooldown:0,hits:500,hitsMax:500,notifyWhenAttacked:false}); await upsertObject({type:'lab',room:homeRoom,user:userId,x:23,y:26},{type:'lab',room:homeRoom,x:23,y:26,user:userId,mineralType:'O',store:{O:2000},storeCapacityResource:{O:3000},cooldown:0,hits:500,hitsMax:500,notifyWhenAttacked:false}); await upsertObject({type:'lab',room:homeRoom,user:userId,x:24,y:26},{type:'lab',room:homeRoom,x:24,y:26,user:userId,store:{},storeCapacityResource:{},cooldown:0,hits:500,hitsMax:500,notifyWhenAttacked:false}); await map.openRoom(economyRoom); } const gameTime=typeof common!=='undefined'&&common.getGametime?await common.getGametime():0; const memoryKey=storage.env.keys.MEMORY+userId; const rawMemory=await storage.env.get(memoryKey); let memory={}; try{ memory=rawMemory?JSON.parse(rawMemory):{}; }catch(error){ memory={}; } memory.screepsmodTestingScenarios={names:scenarios,seededAt:gameTime,rooms:{home:homeRoom,remote:remoteRoom,alliance:allianceRoom,economy:'W2N1'},hardInvader:hasScenario('defense-hard-invader')?{room:homeRoom,bodyParts:50}:undefined}; await storage.env.set(memoryKey,JSON.stringify(memory)); await map.updateTerrainData(); }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))`;
}

async function seedRuntimeScenarios(options, summary) {
  if (!options.scenarios?.length) {
    summary.checks.scenariosSeeded = false;
    summary.metrics.scenariosConfigured = [];
    return;
  }

  const output = await cliEval(options, buildSeedRuntimeScenariosCommand(options), 60000);
  if (!output.includes("__PI_CLI_DONE_OK__") || output.includes("__PI_CLI_DONE_ERR__")) {
    throw new Error(`Failed to seed runtime scenarios. CLI output:\n${output}`);
  }
  summary.checks.scenariosSeeded = true;
  summary.metrics.scenariosConfigured = options.scenarios;
}

async function ensureBotUser(options, summary) {
  const command = buildEnsureBotUserCommand(options);
  const output = await cliEval(options, command);
  if (
    !output.includes("__PI_CLI_DONE_OK__") ||
    output.includes("__PI_CLI_DONE_ERR__")
  ) {
    throw new Error(
      `Failed to ensure bot user ${options.username}. CLI output:\n${output}`,
    );
  }
  summary.checks.userReady = true;
}

async function createApi(options, summary, timeoutMs = 300000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    const api = new ScreepsAPI({
      email: options.username,
      password: options.password,
      protocol: "http",
      hostname: "127.0.0.1",
      port: options.serverPort,
      path: "/",
    });
    api.http.defaults.headers.common["X-Server-Password"] =
      options.serverPassword;

    try {
      if (!options.liveCloneSnapshot) await ensureBotUser(options, summary);
      const auth = await api.auth();
      if (auth?.ok && auth.token) {
        summary.checks.apiAuthenticated = true;
        return api;
      }
      lastError = new Error(
        `Screeps API authentication failed: ${JSON.stringify(auth)}`,
      );
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw lastError ?? new Error(`Timed out authenticating ${options.username}`);
}

async function uploadBot(options, summary, api) {
  if (!fs.existsSync(options.botBundle))
    throw new Error(`Bot bundle missing: ${options.botBundle}`);
  const code = fs.readFileSync(options.botBundle, "utf8");
  const result = await api.raw.user.code.set("$activeWorld", { main: code });
  if (!result?.ok)
    throw new Error(`Bot upload failed: ${JSON.stringify(result)}`);
  summary.checks.botUploaded = true;
}

async function readGameTime(api, shardName) {
  const result = await api.raw.game.time(shardName);
  return Number(result?.time ?? result?.gameTime ?? 0);
}

async function readMemory(options, summary, api) {
  try {
    const result = await api.memory.get("", options.shardName);
    return decodeMemoryData(result.data ?? result);
  } catch (error) {
    summary.errors.push(`memory read failed: ${error.message}`);
    return {};
  }
}

async function inspect(options, summary, api) {
  const memory = await readMemory(options, summary, api);
  inspectMemorySnapshot(memory, summary, new Date(), options);
}

async function collectModSummaryFromCli(options, summary) {
  if (summary.checks.modResultsPresent) return;
  const command = "Promise.resolve().then(()=>{ const s=typeof getTestSummary==='function'?getTestSummary():null; print('__PI_MOD_SUMMARY__'+JSON.stringify(s)); }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))";
  const output = await cliEval(options, command);
  if (!output.includes("__PI_CLI_DONE_OK__") || output.includes("__PI_CLI_DONE_ERR__")) return;
  const markerIndex = output.indexOf("__PI_MOD_SUMMARY__");
  if (markerIndex < 0) return;
  const afterMarker = output.slice(markerIndex + "__PI_MOD_SUMMARY__".length);
  if (afterMarker.trimStart().startsWith("null")) return;
  const jsonStart = afterMarker.indexOf("{");
  const jsonEnd = afterMarker.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd < jsonStart) return;
  const modSummary = JSON.parse(afterMarker.slice(jsonStart, jsonEnd + 1));
  summary.metrics.screepsmodTesting = { ...modSummary, collectedVia: "screeps-cli" };
  summary.checks.modResultsPresent = true;
}

export function summarizeServerLogDiagnostics(logText, sampleLimit = 3) {
  const lines = String(logText ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const count = (predicate) => lines.filter(predicate).length;
  const samples = (predicate) =>
    lines
      .filter(predicate)
      .slice(0, sampleLimit)
      .map((line) => line.slice(0, 300));
  const isUnhandledRejection = (line) => line.includes("Unhandled rejection:");
  const isKnownUnhandledRejection = (line) =>
    isUnhandledRejection(line) &&
    /ERR_HTTP_HEADERS_SENT/.test(line) &&
    /Cannot set headers after they are sent to the client/.test(line);

  // TODO: Track this as an upstream harness blocker if Screeps server runtime fixes the repeated ERR_HTTP_HEADERS_SENT pattern.
  // Details: Private-server smoke runs currently emit stable unhandled rejection spam with this exact message.
  // Encountered: every smoke run on docker image 4.3.0-node22
  // Suggested Fix: Update server stack/route handler to stop double-sending headers, then remove this classifier.
  const isHeadersSent = (line) => line.includes("ERR_HTTP_HEADERS_SENT");
  const isDbError = (line) => line.includes("DBERR");
  const isRoomProcessingError = (line) => line.includes("Error processing room ");
  const isTerrainDataError = (line) => line.includes("Could not load terrain data");
  const isTypeError = (line) => /(^|\s)TypeError:/.test(line);
  const isWarning = (line) =>
    /\b(WARNING|Warning|DeprecationWarning)\b/.test(line);

  const unhandledRejections = count(isUnhandledRejection);
  const unhandledRejectionsKnown = count(isKnownUnhandledRejection);

  return {
    totalLines: lines.length,
    unhandledRejections,
    unhandledRejectionsKnown,
    unhandledRejectionsUnknown: Math.max(0, unhandledRejections - unhandledRejectionsKnown),
    errHttpHeadersSent: count(isHeadersSent),
    dbErrors: count(isDbError),
    roomProcessingErrors: count(isRoomProcessingError),
    terrainDataErrors: count(isTerrainDataError),
    typeErrors: count(isTypeError),
    warningLines: count(isWarning),
    samples: {
      unhandledRejections: samples(isUnhandledRejection),
      unhandledRejectionsKnown: samples(isKnownUnhandledRejection),
      unhandledRejectionsUnknown: samples(
        (line) => isUnhandledRejection(line) && !isKnownUnhandledRejection(line),
      ),
      dbErrors: samples(isDbError),
      roomProcessingErrors: samples(isRoomProcessingError),
      typeErrors: samples(isTypeError),
    },
  };
}

async function collectLogs(options, summary, log) {
  try {
    const composeLogs = await runShell(
      "docker",
      [
        "compose",
        "-f",
        "docker-compose.ci.yml",
        "-p",
        options.projectName,
        "logs",
        "--no-color",
      ],
      options,
      log,
      { cwd: options.serverRoot, capture: true },
    );
    let processLogs = { stdout: "", stderr: "" };
    try {
      processLogs = await runShell(
        "docker",
        [
          "compose",
          "-f",
          "docker-compose.ci.yml",
          "-p",
          options.projectName,
          "exec",
          "-T",
          "screeps",
          "sh",
          "-lc",
          "cat /screeps/logs/*.log 2>/dev/null || true",
        ],
        options,
        log,
        { cwd: options.serverRoot, capture: true },
      );
    } catch (error) {
      summary.errors.push(`process log collection skipped: ${error.message}`);
    }
    const sanitized =
      `${composeLogs.stdout}${composeLogs.stderr}\n${processLogs.stdout}${processLogs.stderr}`.replace(
        /(token|password|secret|key)=([^\s]+)/gi,
        "$1=[REDACTED]",
      );
    fs.writeFileSync(path.join(options.artifactsDir, "docker.log"), sanitized);
    summary.metrics.serverLogDiagnostics = summarizeServerLogDiagnostics(sanitized);
    if (!sanitized.includes("[screepsmod-testing] Mod loaded")) {
      throw new Error(
        "screepsmod-testing load marker not found in server logs",
      );
    }
    summary.checks.modLoaded = true;
  } catch (error) {
    summary.errors.push(`log collection failed: ${error.message}`);
    throw error;
  }
}

export function shouldContinuePolling({ nowMs, endAtMs, polls, maxTicks, ticksAdvanced }) {
  return nowMs < endAtMs && ticksAdvanced < maxTicks && polls < maxTicks;
}

const TASK_BOARD_WARMUP_TICKS = 100;

function getRuntimeWarmed(testSummary, summary) {
  const testSource = String(testSummary.source ?? "");
  if (testSource === "screepsmod-testing-merged") return testSummary.runtimeWarmed;
  if (testSource === "screepsmod-testing-player-sandbox") return testSummary.runtimeWarmed;
  return summary.metrics.screepsmodTestingBackend?.diagnostics?.botRuntimeWarmed;
}

export function hasSmokeValidationEvidence(summary, options = {}) {
  const mode = options.mode ?? summary.mode ?? "smoke";
  if (mode !== "smoke") return false;

  const testSummary = summary.metrics.screepsmodTesting ?? {};
  const ticksAdvanced = Number(summary.metrics.ticksAdvanced ?? 0);
  const taskBoardWarmupTicks = Number.isFinite(Number(options.runtimeWarmupTicks))
    ? Number(options.runtimeWarmupTicks)
    : TASK_BOARD_WARMUP_TICKS;

  if (!summary.checks.modResultsPresent) return false;
  if ((testSummary.total ?? 0) <= 0) return false;
  if ((testSummary.failed ?? 0) > 0) return false;
  if ((testSummary.skipped ?? 0) > 0) return false;
  if ((summary.metrics.criticalConsoleErrors ?? 0) > 0) return false;
  if (ticksAdvanced < taskBoardWarmupTicks) return false;
  if ((summary.metrics.taskBoardRooms ?? 0) <= 0) return false;
  return getRuntimeWarmed(testSummary, summary) !== false;
}

export function updatePollingProgress(summary, currentGameTime, polls) {
  const startedGameTime = summary.startedGameTime ?? currentGameTime;
  const ticksAdvanced = Math.max(0, currentGameTime - startedGameTime);
  summary.finishedGameTime = currentGameTime;
  summary.metrics.polls = polls;
  summary.metrics.ticksAdvanced = ticksAdvanced;
  return ticksAdvanced;
}

export function validateSmokeSummary(summary, options = {}) {
  const mode = options.mode ?? "smoke";
  const ticksAdvanced = Number(summary.metrics.ticksAdvanced ?? 0);
  const testSummary = summary.metrics.screepsmodTesting ?? {};
  const taskBoardWarmupTicks = Math.max(
    0,
    Number.isFinite(options.runtimeWarmupTicks)
      ? Number(options.runtimeWarmupTicks)
      : Number.isFinite(testSummary.runtimeWarmupTicks)
        ? Number(testSummary.runtimeWarmupTicks)
        : TASK_BOARD_WARMUP_TICKS,
  );
  const isCpuBenchmark = mode === "cpu-benchmark";
  const runtimeWarmed = getRuntimeWarmed(testSummary, summary);

  if (!summary.checks.modResultsPresent && !isCpuBenchmark)
    throw new Error("screepsmod-testing result missing from Memory");
  if (String(summary.metrics.screepsmodTesting?.source ?? "").startsWith("ci-harness-") && !isCpuBenchmark)
    throw new Error("screepsmod-testing result was written by harness, not the server mod");
  if ((testSummary.total ?? 0) <= 0 && !isCpuBenchmark)
    throw new Error("screepsmod-testing did not run any assertions");
  if ((testSummary.failed ?? 0) > 0 && !isCpuBenchmark)
    throw new Error(`screepsmod-testing reported ${testSummary.failed} failed tests`);
  if (ticksAdvanced <= 0)
    throw new Error("server game time did not advance during smoke");
  if ((summary.metrics.criticalConsoleErrors ?? 0) > 0)
    throw new Error(`critical console errors detected: ${summary.metrics.criticalConsoleErrors}`);
  if (ticksAdvanced >= taskBoardWarmupTicks && (testSummary.skipped ?? 0) > 0 && runtimeWarmed !== false && !isCpuBenchmark)
    throw new Error(`screepsmod-testing skipped ${testSummary.skipped} runtime checks after warmup`);

  if (mode === "long") {
    const botRuntimeWarmed = summary.metrics.screepsmodTestingBackend?.diagnostics?.botRuntimeWarmed;
    if (botRuntimeWarmed === false) {
      throw new Error("long-run assertion requires bot runtime to be warmed (creep/task-board checks are still in pre-warmup state)");
    }
  }

  const logDiagnostics = summary.metrics.serverLogDiagnostics ?? {};
  if ((logDiagnostics.unhandledRejectionsUnknown ?? 0) > 0)
    throw new Error(`unknown unhandled rejections in server logs: ${logDiagnostics.unhandledRejectionsUnknown}`);
  if ((logDiagnostics.dbErrors ?? 0) > 0)
    throw new Error(`server database errors in logs: ${logDiagnostics.dbErrors}`);
  if ((logDiagnostics.roomProcessingErrors ?? 0) > 0)
    throw new Error(`server room processing errors in logs: ${logDiagnostics.roomProcessingErrors}`);
  if ((logDiagnostics.terrainDataErrors ?? 0) > 0)
    throw new Error(`server terrain-data errors in logs: ${logDiagnostics.terrainDataErrors}`);
  if ((logDiagnostics.typeErrors ?? 0) > 0)
    throw new Error(`server type errors in logs: ${logDiagnostics.typeErrors}`);
  if (summary.metrics.taskBoardRooms === 0 && !isCpuBenchmark && (
    mode !== "smoke" || ticksAdvanced >= taskBoardWarmupTicks
  ))
    throw new Error("Memory.creepTaskBoard did not record room task boards");
}

async function writeSummary(options, summary, status) {
  summary.status = status;
  summary.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(options.artifactsDir, "summary.json"),
    JSON.stringify(summary, null, 2),
  );

  const testSummary = summary.metrics.screepsmodTesting;
  for (const scenario of summary.scenarios ?? []) {
    const scenarioResults = (testSummary?.failures ?? []).filter((failure) =>
      Array.isArray(failure.tags) && failure.tags.includes(scenario),
    );
    fs.writeFileSync(
      path.join(options.artifactsDir, `scenario-${scenario}.json`),
      JSON.stringify({ scenario, status, failures: scenarioResults, summary: testSummary ?? null }, null, 2),
    );
  }

  fs.writeFileSync(
    path.join(options.artifactsDir, "summary.md"),
    `# Screeps ${options.mode} run\n\nStatus: ${status}\n\nStarted: ${summary.startedAt}\nFinished: ${summary.finishedAt}\n\nChecks:\n\n\`\`\`json\n${JSON.stringify(summary.checks, null, 2)}\n\`\`\`\n\nMetrics:\n\n\`\`\`json\n${JSON.stringify(summary.metrics, null, 2)}\n\`\`\`\n\nErrors:\n\n${summary.errors.map((e) => `- ${e}`).join("\n") || "- none"}\n`,
  );
}

export async function runPrivateServerTest(options = parseHarnessArgs()) {
  prepareArtifactsDir(options);
  const summary = createInitialSummary(options);
  const log = createLogger(options);

  try {
    await runShell("npm", ["run", "build:mod"], options, log, {
      cwd: options.repoRoot,
    });
    await runShell("npm", ["run", "build:bot"], options, log, {
      cwd: options.repoRoot,
    });
    const resolvedPorts = await resolveAvailablePorts({
      serverPort: options.serverPort,
      cliPort: options.cliPort,
      launcherHost: options.launcherHost,
    });
    options.serverPort = resolvedPorts.serverPort;
    options.cliPort = resolvedPorts.cliPort;
    summary.serverPort = options.serverPort;
    if (resolvedPorts.fallbackUsed) {
      log(
        `default private-server ports ${resolvedPorts.baseServerPort}/${resolvedPorts.baseCliPort} unavailable; using ${options.serverPort}/${options.cliPort}`,
      );
    }
    await compose(options, log, "up", "--build", "-d");
    const controlPlane = createServerControlPlane({
      apiHost: "127.0.0.1",
      serverPort: options.serverPort,
      cliPort: options.cliPort,
      shardName: options.shardName,
      tickRate: options.tickRate
    });
    await controlPlane.waitForHttpReady();
    summary.checks.serverReady = true;
    await ensureTerrainData(summary, controlPlane);
    if (options.liveCloneSnapshot) {
      await seedLiveCloneSnapshot(options, summary, cliEval);
      await restartScreepsRuntime(options, controlPlane, log);
      summary.checks.runtimeReloadedTerrainData = true;
      await ensureTerrainData(summary, controlPlane);
      summary.checks.postRestartRuntimeDataReady = true;
      await ensureLiveCloneAuth(options, summary, cliEval);
    } else {
      await ensureBotUser(options, summary);
      await seedRuntimeScenarios(options, summary);
      await restartScreepsRuntime(options, controlPlane, log);
      summary.checks.runtimeReloadedTerrainData = true;
      await ensureTerrainData(summary, controlPlane);
      summary.checks.postRestartRuntimeDataReady = true;
    }

    const api = await createApi(options, summary);
    await uploadBot(options, summary, api);

    summary.startedGameTime = await readGameTime(api, options.shardName);
    let currentGameTime = summary.startedGameTime;
    const endAt = Date.now() + options.durationMinutes * 60 * 1000;
    let polls = 0;
    let ticksAdvanced = 0;
    while (shouldContinuePolling({ nowMs: Date.now(), endAtMs: endAt, polls, maxTicks: options.maxTicks, ticksAdvanced })) {
      ticksAdvanced = updatePollingProgress(summary, currentGameTime, polls);
      await inspect(options, summary, api);
      if (hasSmokeValidationEvidence(summary, options)) break;
      await new Promise((resolve) => setTimeout(resolve, options.tickPollMs));
      polls++;
      currentGameTime = await readGameTime(api, options.shardName);
    }
    updatePollingProgress(summary, currentGameTime, polls);

    await collectLogs(options, summary, log);
    await collectModSummaryFromCli(options, summary);
    summary.metrics.liveHarnessChecks = {
      serverReady: Boolean(summary.checks.serverReady),
      ticksAdvanced: summary.metrics.ticksAdvanced ?? 0,
      criticalConsoleErrors: summary.metrics.criticalConsoleErrors ?? 0
    };
    validateSmokeSummary(summary, options);
    await writeSummary(options, summary, "passed");
    return summary;
  } catch (error) {
    summary.errors.push(error.stack || error.message || String(error));
    try {
      await collectLogs(options, summary, log);
    } catch {}
    await writeSummary(options, summary, "failed");
    throw error;
  } finally {
    await compose(options, log, "down", "-v", "--remove-orphans").catch(
      (error) => {
        log(`compose cleanup failed: ${error.message}`);
      },
    );
  }
}
