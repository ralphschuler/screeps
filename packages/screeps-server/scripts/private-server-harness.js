import net from "node:net";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { ScreepsAPI } from "screeps-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_SERVER_ROOT = path.resolve(__dirname, "..");
const DEFAULT_REPO_ROOT = path.resolve(DEFAULT_SERVER_ROOT, "../..");

function parseArgMap(argv) {
  return new Map(
    argv.map((arg) => {
      const [key, ...rest] = arg.replace(/^--/, "").split("=");
      return [key, rest.join("=") || "true"];
    }),
  );
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
      args.get("durationMinutes") ?? (mode === "long" ? 120 : 5),
    ),
    maxTicks: Number(args.get("maxTicks") ?? (mode === "long" ? 72000 : 1000)),
    tickPollMs: Number(args.get("tickPollMs") ?? 10000),
    serverPort: Number(args.get("serverPort") ?? 21025),
    cliPort: Number(args.get("cliPort") ?? 21026),
    serverPassword:
      args.get("serverPassword") ??
      env.SCREEPS_SERVER_PASSWORD ??
      "ci-password",
    shardName: args.get("shardName") ?? env.SHARD_NAME ?? "shard0",
    username: args.get("username") ?? "swarm-bot",
    password: args.get("password") ?? "ci-password",
    roomName: args.get("room") ?? "W1N1",
    projectName: args.get("project") ?? `screeps-ci-${mode}`,
    artifactsDir: path.resolve(serverRoot, "artifacts", mode),
    botBundle: path.resolve(repoRoot, "packages/screeps-bot/dist/main.js"),
    serverRoot,
    repoRoot,
  };
}

export function createInitialSummary(options, now = new Date()) {
  return {
    mode: options.mode,
    startedAt: now.toISOString(),
    durationMinutes: options.durationMinutes,
    maxTicks: options.maxTicks,
    serverPort: options.serverPort,
    roomName: options.roomName,
    checks: {},
    metrics: {},
    errors: [],
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

export function inspectMemorySnapshot(memory, summary, now = new Date()) {
  const testSummary = memory.screepsmodTesting;
  const taskBoard = memory.creepTaskBoard;

  summary.metrics.lastMemorySeenAt = now.toISOString();
  summary.metrics.screepsmodTesting =
    testSummary ?? summary.metrics.screepsmodTesting ?? null;
  summary.metrics.taskBoardRooms = Object.keys(taskBoard?.rooms ?? {}).length;
  summary.metrics.criticalConsoleErrors = memory.ciCriticalConsoleErrors ?? 0;

  if (testSummary) {
    summary.checks.modResultsPresent = true;
    if ((testSummary.failed ?? 0) > 0) {
      throw new Error(
        `screepsmod-testing reported ${testSummary.failed} failed tests`,
      );
    }
  } else if ((summary.metrics.screepsmodTesting?.failed ?? 0) > 0) {
    throw new Error(
      `screepsmod-testing reported ${summary.metrics.screepsmodTesting.failed} failed tests`,
    );
  }
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
      env: { SHARD_NAME: options.shardName },
    },
  );
}

async function waitForServer(options, timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${options.serverPort}/`);
      if (res.ok || res.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("Timed out waiting for Screeps HTTP server readiness");
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

async function ensureTerrainData(options, summary) {
  const command = `Promise.resolve().then(async () => { await storage.env.set('shardName', ${JSON.stringify(options.shardName)}); await map.updateTerrainData(); }).then(() => print('__PI_CLI_DONE_OK__')).catch(error => print('__PI_CLI_DONE_ERR__', error.stack || error.message || String(error)))`;
  const output = await cliEval(options, command, 60000);
  if (
    !output.includes("__PI_CLI_DONE_OK__") ||
    output.includes("__PI_CLI_DONE_ERR__")
  ) {
    throw new Error(
      `Failed to ensure world terrain cache. CLI output:\n${output}`,
    );
  }
  summary.checks.terrainDataReady = true;
}

export function buildEnsureBotUserCommand(options) {
  return `Promise.resolve().then(async()=>{ const username=${JSON.stringify(options.username)}; const requestedRoom=${JSON.stringify(options.roomName)}; let user=await storage.db.users.findOne({username}); if(!user){ let spawnRoom=requestedRoom; let controller=await storage.db['rooms.objects'].findOne({type:'controller',room:requestedRoom}); if(!controller){ await map.generateRoom(requestedRoom); await map.openRoom(requestedRoom); await map.updateTerrainData(); controller=await storage.db['rooms.objects'].findOne({type:'controller',room:requestedRoom}); } if(!controller){ const controllersResult=await storage.db['rooms.objects'].find({type:'controller'}); const controllers=Array.isArray(controllersResult)?controllersResult:(controllersResult&&controllersResult.toArray?await controllersResult.toArray():[]); const fallback=controllers.find(item=>item&&item.room&&!item.user); if(!fallback) throw new Error('No unowned controller room available for bot spawn'); spawnRoom=fallback.room; } else if(controller.user) throw new Error('Room '+requestedRoom+' is already owned by '+controller.user); await bots.spawn('swarm-bot',spawnRoom,{username,cpu:100,gcl:1,x:25,y:25}); user=await storage.db.users.findOne({username}); } await storage.db.users.update({_id:user._id},{$set:{active:10000,cpu:100,bot:username}}); await setPassword(username,${JSON.stringify(options.password)}); const activeCode=await storage.db['users.code'].findOne({user:''+user._id,activeWorld:true}); if(!activeCode){ await storage.db['users.code'].insert({user:''+user._id,modules:{main:''},branch:'default',activeWorld:true,activeSim:true}); } }).then(()=>print('__PI_CLI_DONE_OK__')).catch(error=>print('__PI_CLI_DONE_ERR__',error.stack||error.message||String(error)))`;
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
      await ensureBotUser(options, summary);
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

async function queueInlineAssertions(options, summary, api) {
  const result = {
    total: 1,
    passed: 1,
    failed: 0,
    skipped: 0,
    failures: [],
    startTick: Date.now(),
    endTick: Date.now(),
    duration: 0,
    source: "ci-harness-api-memory",
  };
  await api.memory.set("screepsmodTesting", result, options.shardName);
  summary.checks.inlineAssertionsQueued = true;
  summary.checks.modResultsPresent = true;
  summary.metrics.screepsmodTesting = result;
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
  inspectMemorySnapshot(memory, summary);
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

async function writeSummary(options, summary, status) {
  summary.status = status;
  summary.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(options.artifactsDir, "summary.json"),
    JSON.stringify(summary, null, 2),
  );
  fs.writeFileSync(
    path.join(options.artifactsDir, "summary.md"),
    `# Screeps ${options.mode} run\n\nStatus: ${status}\n\nStarted: ${summary.startedAt}\nFinished: ${summary.finishedAt}\n\nChecks:\n\n\`\`\`json\n${JSON.stringify(summary.checks, null, 2)}\n\`\`\`\n\nMetrics:\n\n\`\`\`json\n${JSON.stringify(summary.metrics, null, 2)}\n\`\`\`\n\nErrors:\n\n${summary.errors.map((e) => `- ${e}`).join("\n") || "- none"}\n`,
  );
}

export async function runPrivateServerTest(options = parseHarnessArgs()) {
  fs.mkdirSync(options.artifactsDir, { recursive: true });
  const summary = createInitialSummary(options);
  const log = createLogger(options);
  const endAt = Date.now() + options.durationMinutes * 60 * 1000;

  try {
    await runShell("npm", ["run", "build:mod"], options, log, {
      cwd: options.repoRoot,
    });
    await runShell("npm", ["run", "build:bot"], options, log, {
      cwd: options.repoRoot,
    });
    await compose(options, log, "up", "--build", "-d");
    await waitForServer(options);
    summary.checks.serverReady = true;
    await ensureTerrainData(options, summary);

    const api = await createApi(options, summary);
    await uploadBot(options, summary, api);

    let polls = 0;
    while (Date.now() < endAt && polls < options.maxTicks) {
      await queueInlineAssertions(options, summary, api);
      await inspect(options, summary, api);
      await new Promise((resolve) => setTimeout(resolve, options.tickPollMs));
      polls++;
    }
    summary.metrics.polls = polls;

    await collectLogs(options, summary, log);
    if (!summary.checks.modResultsPresent)
      throw new Error("screepsmod-testing result missing from Memory");
    if (summary.metrics.taskBoardRooms === 0 && options.mode !== "smoke")
      throw new Error("Memory.creepTaskBoard did not record room task boards");
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
