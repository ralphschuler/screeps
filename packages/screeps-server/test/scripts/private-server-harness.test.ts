import { expect } from "chai";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import {
  buildEnsureBotUserCommand,
  buildSeedRuntimeScenariosCommand,
  createInitialSummary,
  decodeMemoryData,
  inspectMemorySnapshot,
  parseHarnessArgs,
  parseRuntimeWarmupTicks,
  parseScenarioList,
  parseTickRate,
  prepareArtifactsDir,
  resolveAvailablePorts,
  restartScreepsRuntime,
  shouldContinuePolling,
  summarizeServerLogDiagnostics,
  validateSmokeSummary,
} from "../../scripts/private-server-harness.js";

describe("private-server harness module", () => {
  it("parses smoke defaults into a stable run contract", () => {
    const options = parseHarnessArgs([], {});

    expect(options.mode).to.equal("smoke");
    expect(options.durationMinutes).to.equal(15);
    expect(options.maxTicks).to.equal(3000);
    expect(options.tickPollMs).to.equal(10000);
    expect(options.tickRate).to.equal(20);
    expect(options.serverPort).to.equal(21025);
    expect(options.cliPort).to.equal(21026);
    expect(options.launcherHost).to.equal("127.0.0.1");
    expect(options.serverPassword).to.equal("ci-password");
    expect(options.shardName).to.equal("shard0");
    expect(options.username).to.equal("swarm-bot");
    expect(options.password).to.equal("ci-password");
    expect(options.roomName).to.equal("W1N1");
    expect(options.projectName).to.equal("screeps-ci-smoke");
    expect(options.runtimeWarmupTicks).to.equal(100);
    expect(options.scenarios).to.deep.equal([
      "default-bootstrap",
      "construction-economy",
      "remote-mining",
      "defense-hostile",
      "alliance-safety",
    ]);
    expect(options.artifactsDir).to.match(
      /packages\/screeps-server\/artifacts\/smoke$/,
    );
    expect(options.botBundle).to.match(
      /packages\/screeps-bot\/dist\/main\.js$/,
    );
  });

  it("supports split CLI flag/value argument syntax", () => {
    const options = parseHarnessArgs(
      [
        "--mode",
        "smoke",
        "--project",
        "screeps-ci-custom",
        "--durationMinutes",
        "2",
        "--maxTicks",
        "222",
      ],
      {},
    );

    expect(options.mode).to.equal("smoke");
    expect(options.projectName).to.equal("screeps-ci-custom");
    expect(options.durationMinutes).to.equal(2);
    expect(options.maxTicks).to.equal(222);
  });

  it("parses scenario lists from CLI/env contracts", () => {
    expect(parseScenarioList("default-bootstrap,defense-hostile")).to.deep.equal([
      "default-bootstrap",
      "defense-hostile",
    ]);
    expect(parseScenarioList("none")).to.deep.equal([]);
  });

  it("allocates a backup private-server port pair when defaults are already bound", async () => {
    const options = await resolveAvailablePorts({
      serverPort: 21025,
      cliPort: 21026,
      launcherHost: "127.0.0.1",
      isPortAvailableFn: async (port) => ![21025, 21026].includes(port),
    });

    expect(options).to.deep.equal({
      serverPort: 21027,
      cliPort: 21028,
      fallbackUsed: true,
      baseServerPort: 21025,
      baseCliPort: 21026,
      attemptedPairs: 1,
    });
  });

  it("parses long defaults and environment overrides", () => {
    const options = parseHarnessArgs(["--mode=long"], {
      SCREEPS_SERVER_PASSWORD: "server-secret",
      SHARD_NAME: "shard9",
      SCREEPS_TICK_RATE: "20",
      SCREEPS_RUNTIME_WARMUP_TICKS: "250",
    });

    expect(options.mode).to.equal("long");
    expect(options.durationMinutes).to.equal(120);
    expect(options.maxTicks).to.equal(72000);
    expect(options.serverPassword).to.equal("server-secret");
    expect(options.shardName).to.equal("shard9");
    expect(options.tickRate).to.equal(20);
    expect(options.runtimeWarmupTicks).to.equal(250);
    expect(options.projectName).to.equal("screeps-ci-long");
  });

  it("rejects invalid tick rates", () => {
    expect(() => parseTickRate("bad")).to.throw(/positive integer/);
    expect(() => parseTickRate(0)).to.throw(/positive integer/);
    expect(parseTickRate("20")).to.equal(20);
  });

  it("reads runtime warmup ticks from env or config", () => {
    expect(parseRuntimeWarmupTicks("150", "/tmp/ignored", {
      SCREEPS_RUNTIME_WARMUP_TICKS: "15",
    })).to.equal(150);
    expect(
      parseRuntimeWarmupTicks(
        undefined,
        new URL("../../config.ci.yml", import.meta.url),
        {},
      ),
    ).to.equal(100);
    expect(() => parseRuntimeWarmupTicks("-1")).to.throw(/non-negative integer/);
  });

  it("resets the harness log before each artifact run", () => {
    const artifactsDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "screeps-harness-artifacts-"),
    );
    const harnessLog = path.join(artifactsDir, "harness.log");
    fs.writeFileSync(harnessLog, "stale previous run\n");

    prepareArtifactsDir({ artifactsDir });

    expect(fs.readFileSync(harnessLog, "utf8")).to.equal("");
  });

  it("creates summary with expected artifact-facing fields", () => {
    const summary = createInitialSummary(
      parseHarnessArgs(["--mode=smoke", "--room=E1N1"], {}),
      new Date("2026-05-09T00:00:00.000Z"),
    );

    expect(summary).to.deep.include({
      mode: "smoke",
      startedAt: "2026-05-09T00:00:00.000Z",
      durationMinutes: 15,
      maxTicks: 3000,
      serverPort: 21025,
      tickRate: 20,
      roomName: "E1N1",
      scenarios: [
        "default-bootstrap",
        "construction-economy",
        "remote-mining",
        "defense-hostile",
        "alliance-safety",
      ],
      finishedAt: null,
      status: "running",
    });
    expect(summary.checks).to.deep.equal({});
    expect(summary.metrics).to.deep.equal({});
    expect(summary.errors).to.deep.equal([]);
  });

  it("decodes plain, object, empty, and gzipped Memory payloads", () => {
    const payload = {
      screepsmodTesting: { failed: 0 },
      creepTaskBoard: { rooms: { W1N1: {} } },
    };
    const gz = `gz:${zlib.gzipSync(JSON.stringify(payload)).toString("base64")}`;

    expect(decodeMemoryData(null)).to.deep.equal({});
    expect(decodeMemoryData(payload)).to.equal(payload);
    expect(decodeMemoryData(JSON.stringify(payload))).to.deep.equal(payload);
    expect(decodeMemoryData(gz)).to.deep.equal(payload);
  });

  it("does not load screepsmod-bots in CI smoke runs", () => {
    const modsConfig = JSON.parse(
      fs.readFileSync(new URL("../../mods.ci.json", import.meta.url), "utf8"),
    );

    expect(modsConfig.mods).to.include("/workspace/packages/screepsmod-testing/dist/backend.js");
    expect(modsConfig.mods).to.not.include("/usr/local/lib/node_modules/screepsmod-bots");
  });

  it("summarizes Docker server log diagnostics and classifies known unhandled-rejection noise", () => {
    const diagnostics = summarizeServerLogDiagnostics(`
      Running cronjob 'screepsmodTesting'
      Unhandled rejection: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client at /usr/local/lib/node_modules/screeps/node_modules/q-json-response/q-json-response.js:17
      Unhandled rejection: Error: something else exploded
      DBERR MongoError: duplicate key
      TypeError: Cannot read properties of null (reading 'cpu')
      DeprecationWarning: collection.count is deprecated
    `);

    expect(diagnostics.unhandledRejections).to.equal(2);
    expect(diagnostics.unhandledRejectionsKnown).to.equal(1);
    expect(diagnostics.unhandledRejectionsUnknown).to.equal(1);
    expect(diagnostics.errHttpHeadersSent).to.equal(1);
    expect(diagnostics.dbErrors).to.equal(1);
    expect(diagnostics.typeErrors).to.equal(1);
    expect(diagnostics.warningLines).to.equal(1);
    expect(diagnostics.samples.unhandledRejections[0]).to.include("ERR_HTTP_HEADERS_SENT");
    expect(diagnostics.samples.unhandledRejectionsKnown[0]).to.include("q-json-response");
    expect(diagnostics.samples.unhandledRejectionsUnknown[0]).to.include("something else exploded");
    expect(diagnostics.samples.dbErrors[0]).to.include("DBERR");
    expect(diagnostics.samples.typeErrors[0]).to.include("reading 'cpu'");
  });

  it("records mod results, task-board rooms, and critical console errors from Memory", () => {
    const summary = createInitialSummary(
      parseHarnessArgs([], {}),
      new Date("2026-05-09T00:00:00.000Z"),
    );

    inspectMemorySnapshot(
      {
        screepsmodTesting: { total: 3, passed: 3, failed: 0 },
        creepTaskBoard: { rooms: { W1N1: {}, W2N1: {} } },
        ciCriticalConsoleErrors: 1,
      },
      summary,
      new Date("2026-05-09T00:01:00.000Z"),
    );

    expect(summary.checks.modResultsPresent).to.equal(true);
    expect(summary.metrics.lastMemorySeenAt).to.equal(
      "2026-05-09T00:01:00.000Z",
    );
    expect(summary.metrics.screepsmodTesting).to.deep.equal({
      total: 3,
      passed: 3,
      failed: 0,
    });
    expect(summary.metrics.taskBoardRooms).to.equal(2);
    expect(summary.metrics.criticalConsoleErrors).to.equal(1);
  });

  it("records player and backend mod diagnostics without replacing the primary result", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    const playerSummary = { source: "screepsmod-testing-player-sandbox", total: 8, failed: 0 };
    const backendSummary = {
      source: "screepsmod-testing-backend-cronjob",
      total: 8,
      failed: 0,
      diagnostics: { creeps: 0, taskBoardRooms: 0 },
    };

    inspectMemorySnapshot(
      {
        screepsmodTesting: playerSummary,
        screepsmodTestingPlayer: playerSummary,
        screepsmodTestingBackend: backendSummary,
        creepTaskBoard: { rooms: { W1N1: {} } },
      },
      summary,
    );

    expect(summary.metrics.screepsmodTesting).to.equal(playerSummary);
    expect(summary.metrics.screepsmodTestingPlayer).to.equal(playerSummary);
    expect(summary.metrics.screepsmodTestingBackend).to.equal(backendSummary);
  });

  it("rejects harness-authored fake smoke results", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = { total: 1, failed: 0, source: "ci-harness-live-api" };
    summary.metrics.ticksAdvanced = 10;
    summary.metrics.criticalConsoleErrors = 0;

    expect(() => validateSmokeSummary(summary)).to.throw(/written by harness/);
  });

  it("rejects missing mod results", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.metrics.ticksAdvanced = 10;
    summary.metrics.criticalConsoleErrors = 0;

    expect(() => validateSmokeSummary(summary)).to.throw(/missing from Memory/);
  });

  it("rejects stalled game time and critical console errors", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = { total: 1, failed: 0 };
    summary.metrics.taskBoardRooms = 1;
    summary.metrics.ticksAdvanced = 0;
    summary.metrics.criticalConsoleErrors = 0;
    expect(() => validateSmokeSummary(summary)).to.throw(/did not advance/);

    summary.metrics.ticksAdvanced = 10;
    summary.metrics.criticalConsoleErrors = 1;
    expect(() => validateSmokeSummary(summary)).to.throw(/critical console errors/);
  });

  it("rejects unknown unhandled rejections while allowing known harness-safe noise", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = { total: 8, failed: 0 };
    summary.metrics.taskBoardRooms = 1;
    summary.metrics.ticksAdvanced = 10;
    summary.metrics.criticalConsoleErrors = 0;

    summary.metrics.serverLogDiagnostics = {
      unhandledRejections: 1,
      unhandledRejectionsKnown: 1,
      unhandledRejectionsUnknown: 0,
      dbErrors: 0,
      roomProcessingErrors: 0,
      terrainDataErrors: 0,
      typeErrors: 0,
      errHttpHeadersSent: 1,
      warningLines: 0,
      samples: {
        unhandledRejections: ["Unhandled rejection: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client"],
        unhandledRejectionsKnown: ["Unhandled rejection: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client"],
        unhandledRejectionsUnknown: [],
        dbErrors: [],
        roomProcessingErrors: [],
        typeErrors: [],
      },
    };

    expect(() => validateSmokeSummary(summary)).to.not.throw();

    summary.metrics.serverLogDiagnostics = {
      ...summary.metrics.serverLogDiagnostics,
      unhandledRejections: 2,
      unhandledRejectionsKnown: 1,
      unhandledRejectionsUnknown: 1,
    };

    expect(() => validateSmokeSummary(summary)).to.throw(/unknown unhandled rejections/);
  });

  it("requires task-board rooms after smoke warmup threshold", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = { total: 1, failed: 0, skipped: 0 };
    summary.metrics.criticalConsoleErrors = 0;

    summary.metrics.ticksAdvanced = 99;
    summary.metrics.taskBoardRooms = 0;
    expect(() => validateSmokeSummary(summary)).to.not.throw();

    summary.metrics.ticksAdvanced = 100;
    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.throw(/creepTaskBoard/);
  });

  it("fails when runtime assertions are still skipped after warmup", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.criticalConsoleErrors = 0;
    summary.metrics.screepsmodTesting = {
      source: "screepsmod-testing-player-sandbox",
      total: 8,
      failed: 0,
      skipped: 3,
      runtimeWarmed: true,
    };

    summary.metrics.ticksAdvanced = 150;
    summary.metrics.taskBoardRooms = 1;

    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.throw(/skipped 3 runtime checks/);
  });

  it("does not fail on skipped runtime assertions before bot runtime warmup is observed", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.criticalConsoleErrors = 0;
    summary.metrics.screepsmodTesting = {
      source: "screepsmod-testing-player-sandbox",
      total: 8,
      failed: 0,
      skipped: 3,
      runtimeWarmed: false,
    };

    summary.metrics.ticksAdvanced = 150;
    summary.metrics.taskBoardRooms = 1;

    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.not.throw();
  });

  it("rejects long-run summaries where bot runtime never warmed", () => {
    const summary = createInitialSummary(parseHarnessArgs(["--mode=long"], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = {
      source: "screepsmod-testing-backend-cronjob",
      total: 8,
      passed: 5,
      failed: 0,
      skipped: 0,
    };
    summary.metrics.screepsmodTestingBackend = {
      source: "screepsmod-testing-backend-cronjob",
      total: 8,
      passed: 5,
      failed: 0,
      skipped: 3,
      diagnostics: { botRuntimeWarmed: false },
    };
    summary.metrics.criticalConsoleErrors = 0;
    summary.metrics.taskBoardRooms = 1;
    summary.metrics.ticksAdvanced = 10000;

    expect(() =>
      validateSmokeSummary(summary, { runtimeWarmupTicks: 500, mode: "long" }),
    ).to.throw(/long-run assertion requires bot runtime to be warmed/);

    summary.metrics.screepsmodTestingBackend.diagnostics.botRuntimeWarmed = true;
    expect(() =>
      validateSmokeSummary(summary, { runtimeWarmupTicks: 500, mode: "long" }),
    ).to.not.throw();
  });

  it("stops polling when actual game ticks reach maxTicks", () => {
    expect(shouldContinuePolling({ nowMs: 10, endAtMs: 100, polls: 1, maxTicks: 1000, ticksAdvanced: 999 })).to.equal(true);
    expect(shouldContinuePolling({ nowMs: 10, endAtMs: 100, polls: 1, maxTicks: 1000, ticksAdvanced: 1000 })).to.equal(false);
  });

  it("restarts only the Screeps service before post-spawn runtime validation", async () => {
    const options = parseHarnessArgs([], {});
    const calls: unknown[][] = [];
    const controlPlane = {
      waitForHttpReady: async () => {
        calls.push(["waitForHttpReady"]);
      },
    };
    const log = (message: string) => calls.push(["log", message]);
    const composeFn = async (_options: typeof options, _log: typeof log, ...args: string[]) => {
      calls.push(["compose", ...args]);
    };

    await restartScreepsRuntime(options, controlPlane, log, composeFn);

    expect(calls).to.deep.equal([
      ["log", "restarting Screeps service so runtime reloads generated terrain data"],
      ["compose", "restart", "screeps"],
      ["waitForHttpReady"],
    ]);
  });

  it("builds a bot-user bootstrap command that creates or falls back to an available controller room", () => {
    const options = parseHarnessArgs(
      ["--room=E1N1", "--username=test-bot"],
      {},
    );
    const command = buildEnsureBotUserCommand(options);

    expect(command).to.include('const requestedRoom=\"E1N1\"');
    expect(command).to.include("let spawnRoom=requestedRoom");
    expect(command).to.include("const ensureBootstrapRoom=async(roomName)");
    expect(command).to.include("const plainTerrain='0'.repeat(2500)");
    expect(command).to.not.include("map.generateRoom(requestedRoom)");
    expect(command).to.include("map.openRoom(roomName)");
    expect(command).to.include("if(!controller||controller.user)");
    expect(command).to.include("const toArray=async(result)=>Array.isArray(result)");
    expect(command).to.include(
      "controllers.find(item=>item&&item.room&&!item.user)",
    );
    expect(command).to.include("if(!fallback){ await storage.db['rooms.objects'].update({_id:controller._id},{$set:{user:null}})");
    expect(command).to.include("spawnRoom=requestedRoom");
    expect(command).to.include("bots.spawn('swarm-bot',spawnRoom");
    expect(command).to.include("const ensureUserRecord=async()=>");
    expect(command).to.include("message.indexOf('already owned')<0");
    expect(command).to.include("cpuAvailable:10000");
    expect(command).to.include(
      "const spawnEnergyFields={energy:SPAWN_ENERGY_START,energyCapacity:SPAWN_ENERGY_CAPACITY,store:{energy:SPAWN_ENERGY_START},storeCapacityResource:{energy:SPAWN_ENERGY_CAPACITY}"
    );
    expect(command).to.include(
      "else { await storage.db['rooms.objects'].update({_id:existingSpawn._id},{$set:spawnEnergyFields}); }"
    );
    expect(command).to.include("await ensureRoomSpawnForUser(user,spawnRoom); if(!(await userHasOwnedRoom(user)))");
    expect(command).to.not.include("find({ type: 'controller', user: null })");
  });

  it("builds a runtime scenario seed command for private-server smoke coverage", () => {
    const options = parseHarnessArgs(["--room=E1N1", "--scenarios=construction-economy,defense-hostile,alliance-safety,link-network,terminal-market-lab-economy"], {});
    const command = buildSeedRuntimeScenariosCommand(options);

    expect(command).to.include('const requestedRoom="E1N1"');
    expect(command).to.include('const scenarios=["construction-economy","defense-hostile","alliance-safety","link-network","terminal-market-lab-economy"]');
    expect(command).to.include("type:'constructionSite'");
    expect(command).to.include("ScenarioEnemyAttacker");
    expect(command).to.include("TooAngelScenarioAlly");
    expect(command).to.include("hasScenario('link-network')");
    expect(command).to.include("type:'storage'");
    expect(command).to.include("level:7");
    expect(command).to.include("hasScenario('terminal-market-lab-economy')");
    expect(command).to.include("type:'terminal'");
    expect(command).to.include("type:'lab'");
    expect(command).to.include("economy:'W2N1'");
    expect(command).to.include("screepsmodTestingScenarios");
  });

  it("seeds the hostile defense scenario in the owned home room for deterministic smoke visibility", () => {
    const options = parseHarnessArgs(["--room=E1N1", "--scenarios=remote-mining,defense-hostile"], {});
    const command = buildSeedRuntimeScenariosCommand(options);

    expect(command).to.include("const defenseRoom=homeRoom;");
    expect(command).to.not.include("const defenseRoom=hasScenario('remote-mining')?remoteRoom:homeRoom;");
  });

  it("fails the run when screepsmod-testing reports failed tests", () => {
    const summary = createInitialSummary(
      parseHarnessArgs([], {}),
      new Date("2026-05-09T00:00:00.000Z"),
    );

    expect(() =>
      inspectMemorySnapshot(
        {
          screepsmodTesting: { total: 2, passed: 1, failed: 1 },
          creepTaskBoard: { rooms: {} },
        },
        summary,
      ),
    ).to.throw(/reported 1 failed tests/);
  });
});
