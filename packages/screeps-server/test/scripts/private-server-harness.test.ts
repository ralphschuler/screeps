import { expect } from "chai";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";
import {
  buildEnsureBotUserCommand,
  buildSeedRuntimeScenariosCommand,
  createInitialSummary,
  decodeMemoryData,
  hasSmokeValidationEvidence,
  inspectMemorySnapshot,
  parseHarnessArgs,
  parseRuntimeWarmupTicks,
  parseScenarioList,
  parseScenarioSeedConfirmationOutput,
  parseTickRate,
  prepareArtifactsDir,
  recordScenarioSeedConfirmation,
  resolveAvailablePorts,
  resolveScreepsApiConstructor,
  restartScreepsRuntime,
  shouldContinuePolling,
  summarizeServerLogDiagnostics,
  updatePollingProgress,
  validateSmokeSummary,
  writeFailedSummaryForError,
} from "../../scripts/private-server-harness.js";

describe("private-server harness module", () => {
  it("resolves screeps-api constructors from CommonJS and ESM namespace shapes", () => {
    class Api {}

    expect(resolveScreepsApiConstructor({ ScreepsAPI: Api })).to.equal(Api);
    expect(resolveScreepsApiConstructor({ default: { ScreepsAPI: Api } })).to.equal(Api);
    expect(resolveScreepsApiConstructor({ default: Api })).to.equal(Api);
    expect(resolveScreepsApiConstructor(Api)).to.equal(Api);
    expect(() => resolveScreepsApiConstructor({ ScreepsAPI: {} })).to.throw(
      "screeps-api module did not expose a supported Screeps API constructor",
    );
  });

  it("adapts screeps-api v2 ScreepsHttpClient to the legacy harness contract", async () => {
    class ScreepsHttpClient {
      config: unknown;
      _http = { defaults: { headers: { common: {} } } };

      constructor(config: unknown) {
        this.config = config;
      }

      auth() {
        return Promise.resolve({ ok: 1, token: "token" });
      }

      gameTime(shard: string) {
        return Promise.resolve({ time: 123, shard });
      }

      userCodeGet(branch: string) {
        return Promise.resolve({ branch, modules: { main: "code" } });
      }

      userCodeSet(params: unknown) {
        return Promise.resolve({ ok: 1, params });
      }

      userMemoryGet(path: string, shard: string) {
        return Promise.resolve({ data: { path, shard } });
      }
    }

    const Api = resolveScreepsApiConstructor({ ScreepsHttpClient });
    const api = new Api({
      email: "swarm-bot",
      password: "ci-password",
      protocol: "http",
      hostname: "127.0.0.1",
      port: 21025,
      path: "/",
    });

    api.http.defaults.headers.common["X-Server-Password"] = "server-password";

    expect(api.client.config).to.deep.include({
      email: "swarm-bot",
      password: "ci-password",
      protocol: "http",
      hostname: "127.0.0.1",
      port: 21025,
      path: "/",
    });
    expect(api.http.defaults.headers.common["X-Server-Password"]).to.equal("server-password");
    expect(await api.auth()).to.deep.equal({ ok: 1, token: "token" });
    expect(await api.raw.game.time("shard0")).to.deep.equal({ time: 123, shard: "shard0" });
    expect(await api.raw.user.code.get("$activeWorld")).to.deep.equal({
      branch: "$activeWorld",
      modules: { main: "code" },
    });
    expect(await api.raw.user.code.set("$activeWorld", { main: "code" })).to.deep.equal({
      ok: 1,
      params: { branch: "$activeWorld", modules: { main: "code" } },
    });
    expect(await api.memory.get("", "shard0")).to.deep.equal({
      data: { path: "", shard: "shard0" },
    });
  });

  it("parses smoke defaults into a stable run contract", () => {
    const options = parseHarnessArgs([], {});

    expect(options.mode).to.equal("smoke");
    expect(options.durationMinutes).to.equal(15);
    expect(options.maxTicks).to.equal(10000);
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
      "defense-hard-invader",
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
    expect(() => parseRuntimeWarmupTicks("-1")).to.throw(/positive integer/);
    expect(() => parseRuntimeWarmupTicks("0")).to.throw(/positive integer/);
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
      maxTicks: 10000,
      serverPort: 21025,
      tickRate: 20,
      roomName: "E1N1",
      scenarios: [
        "default-bootstrap",
        "construction-economy",
        "remote-mining",
        "defense-hostile",
        "defense-hard-invader",
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

  it("rejects skipped runtime assertions when the bot is still not warmed after the smoke warmup threshold", () => {
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

    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.throw(/skipped 3 runtime checks/);
  });

  it("rejects explicit not-warmed runtime evidence after the smoke warmup threshold", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.criticalConsoleErrors = 0;
    summary.metrics.screepsmodTesting = {
      source: "screepsmod-testing-merged",
      total: 49,
      passed: 49,
      failed: 0,
      skipped: 0,
      runtimeWarmed: false,
    };

    summary.metrics.ticksAdvanced = 3099;
    summary.metrics.taskBoardRooms = 2;

    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.throw(/runtime was not warmed after 100 ticks/);
  });

  it("preserves stronger warmed runtime evidence across stale post-reset Memory snapshots", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    const warmed = {
      merged: {
        source: "screepsmod-testing-merged",
        total: 49,
        passed: 49,
        failed: 0,
        skipped: 0,
        runtimeWarmed: true,
        tick: 200,
      },
      player: {
        source: "screepsmod-testing-player-sandbox",
        total: 25,
        passed: 25,
        failed: 0,
        skipped: 0,
        runtimeWarmed: true,
        tick: 200,
      },
      backend: {
        source: "screepsmod-testing-backend-cronjob",
        total: 24,
        passed: 24,
        failed: 0,
        skipped: 0,
        runtimeWarmed: true,
        tick: 200,
      },
    };

    inspectMemorySnapshot({
      screepsmodTesting: warmed.merged,
      screepsmodTestingPlayer: warmed.player,
      screepsmodTestingBackend: warmed.backend,
      creepTaskBoard: { rooms: { W1N1: {} } },
    }, summary);

    inspectMemorySnapshot({
      screepsmodTesting: { ...warmed.merged, passed: 16, skipped: 33, runtimeWarmed: false, tick: 7 },
      screepsmodTestingPlayer: { ...warmed.player, passed: 11, skipped: 14, runtimeWarmed: false, tick: 7 },
      screepsmodTestingBackend: { ...warmed.backend, passed: 5, skipped: 19, runtimeWarmed: false, tick: 6 },
      creepTaskBoard: { rooms: { W1N1: {} } },
    }, summary);

    expect(summary.metrics.screepsmodTesting).to.equal(warmed.merged);
    expect(summary.metrics.screepsmodTestingPlayer).to.equal(warmed.player);
    expect(summary.metrics.screepsmodTestingBackend).to.equal(warmed.backend);
  });

  it("does not hide degraded runtime evidence from a later tick", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    inspectMemorySnapshot({
      screepsmodTesting: {
        source: "screepsmod-testing-merged",
        total: 49,
        passed: 49,
        failed: 0,
        skipped: 0,
        runtimeWarmed: true,
        tick: 200,
      },
      creepTaskBoard: { rooms: { W1N1: {} } },
    }, summary);

    const degraded = {
      source: "screepsmod-testing-merged",
      total: 49,
      passed: 16,
      failed: 0,
      skipped: 33,
      runtimeWarmed: false,
      tick: 300,
    };
    inspectMemorySnapshot({
      screepsmodTesting: degraded,
      creepTaskBoard: { rooms: { W1N1: {} } },
    }, summary);
    summary.metrics.ticksAdvanced = 300;

    expect(summary.metrics.screepsmodTesting).to.equal(degraded);
    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.throw(/skipped 33 runtime checks/);
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

  it("can stop smoke polling once warmed runtime assertions and task-board evidence are present", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = {
      source: "screepsmod-testing-merged",
      total: 49,
      passed: 49,
      failed: 0,
      skipped: 0,
      runtimeWarmed: true,
      tick: 892,
      sources: {
        player: {
          source: "screepsmod-testing-player-sandbox",
          total: 25,
          passed: 25,
          failed: 0,
          skipped: 0,
          runtimeWarmed: true,
          tick: 892,
        },
        backend: {
          source: "screepsmod-testing-backend-cronjob",
          total: 24,
          passed: 24,
          failed: 0,
          skipped: 0,
          runtimeWarmed: true,
          tick: 892,
          diagnostics: { playerSandboxSummarySource: "durable-env" },
        },
      },
    };
    summary.metrics.criticalConsoleErrors = 0;
    summary.metrics.taskBoardRooms = 2;
    summary.metrics.ticksAdvanced = 892;

    expect(hasSmokeValidationEvidence(summary, { mode: "smoke", runtimeWarmupTicks: 100 })).to.equal(true);
    expect(hasSmokeValidationEvidence(summary, { mode: "long", runtimeWarmupTicks: 100 })).to.equal(false);

    summary.metrics.screepsmodTesting.skipped = 1;
    expect(hasSmokeValidationEvidence(summary, { mode: "smoke", runtimeWarmupTicks: 100 })).to.equal(false);
  });

  it("rejects merged smoke evidence without fresh durable player and backend sources", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = {
      source: "screepsmod-testing-merged",
      total: 24,
      passed: 24,
      failed: 0,
      skipped: 0,
      runtimeWarmed: true,
      tick: 300,
      sources: {
        backend: {
          source: "screepsmod-testing-backend-cronjob",
          total: 24,
          passed: 24,
          failed: 0,
          skipped: 0,
          runtimeWarmed: true,
          tick: 300,
          diagnostics: { playerSandboxSummarySource: "memory" },
        },
      },
    };
    summary.metrics.criticalConsoleErrors = 0;
    summary.metrics.taskBoardRooms = 1;
    summary.metrics.ticksAdvanced = 300;

    expect(hasSmokeValidationEvidence(summary, { runtimeWarmupTicks: 100 })).to.equal(false);
    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.throw(/fresh durable player\/backend evidence/);

    summary.metrics.screepsmodTesting = {
      source: "bot-authored",
      total: 49,
      passed: 49,
      failed: 0,
      skipped: 0,
      runtimeWarmed: true,
      tick: 300,
    };
    expect(hasSmokeValidationEvidence(summary, { runtimeWarmupTicks: 100 })).to.equal(false);
    expect(() => validateSmokeSummary(summary, { runtimeWarmupTicks: 100 })).to.throw(/fresh durable player\/backend evidence/);
  });

  it("records the latest observed game time when polling exits", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.startedGameTime = 100;
    summary.finishedGameTime = 110;
    summary.metrics.polls = 1;
    summary.metrics.ticksAdvanced = 10;

    const ticksAdvanced = updatePollingProgress(summary, 150, 4);

    expect(ticksAdvanced).to.equal(50);
    expect(summary.finishedGameTime).to.equal(150);
    expect(summary.metrics.polls).to.equal(4);
    expect(summary.metrics.ticksAdvanced).to.equal(50);
  });

  it("rewrites a passed summary as failed when a post-validation error is caught", async () => {
    const artifactsDir = fs.mkdtempSync(path.join(os.tmpdir(), "screeps-harness-failed-summary-"));
    const options = parseHarnessArgs([`--artifactsDir=${artifactsDir}`], {});
    const summary = createInitialSummary(options, new Date("2026-07-05T00:00:00.000Z"));
    summary.status = "passed";

    await writeFailedSummaryForError(options, summary, new Error("late smoke cleanup failure"));

    expect(summary.status).to.equal("failed");
    expect(summary.errors).to.have.length(1);
    expect(summary.errors[0]).to.include("late smoke cleanup failure");

    const summaryJson = JSON.parse(fs.readFileSync(path.join(artifactsDir, "summary.json"), "utf8"));
    const summaryMarkdown = fs.readFileSync(path.join(artifactsDir, "summary.md"), "utf8");
    expect(summaryJson.status).to.equal("failed");
    expect(summaryJson.errors[0]).to.include("late smoke cleanup failure");
    expect(summaryMarkdown).to.include("Status: failed");
    expect(summaryMarkdown).to.include("late smoke cleanup failure");
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

  it("builds an idempotent regular-player bootstrap command", async () => {
    const options = parseHarnessArgs(
      ["--room=E1N1", "--username=test-bot"],
      {},
    );
    const command = buildEnsureBotUserCommand(options);

    expect(command).to.include('const requestedRoom=\"E1N1\"');
    expect(command).to.include("const ownedController=user&&await storage.db['rooms.objects'].findOne");
    expect(command).to.include("let spawnRoom=ownedController?.room||requestedRoom");
    expect(command).to.include("const ensureBootstrapRoom=async(roomName)");
    expect(command).to.include("await storage.db['rooms.objects'].removeWhere({_id:duplicateController._id})");
    expect(command).to.include("await storage.db['rooms.objects'].removeWhere({_id:duplicateSpawn._id})");
    expect(command).to.include("const plainTerrain='0'.repeat(2500)");
    expect(command).to.not.include("map.generateRoom(requestedRoom)");
    expect(command).to.include("map.openRoom(roomName)");
    expect(command).to.include("const controllerOwnedByOther=controller?.user&&(!user||String(controller.user)!==String(user._id))");
    expect(command).to.include("if(!controller||controllerOwnedByOther)");
    expect(command).to.include("const toArray=async(result)=>Array.isArray(result)");
    expect(command).to.include(
      "controllers.find(item=>item&&item.room&&!item.user)",
    );
    expect(command).to.include("if(!fallback){ await storage.db['rooms.objects'].update({_id:controller._id},{$set:{user:null}})");
    expect(command).to.include("spawnRoom=requestedRoom");
    expect(command).to.not.include("bots.spawn(");
    expect(command).to.include("const userIdForName=name=>String(name).replace");
    expect(command).to.include("const ensureUserRecord=async()=>");
    expect(command).to.include("if(!user){ user=await ensureUserRecord(); }");
    expect(command).to.include("await storage.env.sadd(storage.env.keys.ACTIVE_ROOMS,roomName)");
    expect(command).to.include("const userId=targetUser._id");
    expect(command).to.not.include("const userId=''+targetUser._id");
    expect(command).to.include("$or:[{user:targetUser._id},{user:String(targetUser._id)}]");
    expect(command).to.include("user:targetUser._id");
    expect(command).to.not.include("user:''+targetUser._id");
    expect(command).to.include("usernameLower:String(username).toLowerCase()");
    expect(command).to.include("rooms:[spawnRoom]");
    expect(command).to.include("const userRooms=Array.from(new Set");
    expect(command).to.include("rooms:userRooms");
    expect(command).to.include("$set:{active:0,cpu:100,cpuAvailable:10000,rooms:userRooms,bot:username}");
    expect(command).to.include("const memoryKey=storage.env.keys.MEMORY+user._id");
    expect(command).to.include("await storage.env.set(memoryKey,'{}')");
    expect(command).to.not.include("$unset:{bot:1}");
    expect(command).to.not.include("$set:{active:10000,cpu:100,cpuAvailable:10000,bot:username}");
    expect(command).to.include("findOne({user:user._id,activeWorld:true})");
    expect(command).to.include("insert({user:user._id,modules:{main:''}");
    expect(command).to.include("cpuAvailable:10000");
    expect(command).to.include(
      "const spawnEnergyFields={energy:SPAWN_ENERGY_START,energyCapacity:SPAWN_ENERGY_CAPACITY,store:{energy:SPAWN_ENERGY_START},storeCapacityResource:{energy:SPAWN_ENERGY_CAPACITY}"
    );
    expect(command).to.include(
      "else { await storage.db['rooms.objects'].update({_id:existingSpawn._id},{$set:{...spawnEnergyFields,user:userId}}); }"
    );
    expect(command).to.include("await ensureRoomSpawnForUser(user,spawnRoom); if(!(await userHasOwnedRoom(user)))");
    expect(command).to.not.include("find({ type: 'controller', user: null })");

    let nextId = 1;
    const data: Record<string, any[]> = {
      rooms: [{ _id: "E1N1", status: "normal", sourceKeepers: false }],
      "rooms.terrain": [{ room: "E1N1", terrain: "0".repeat(2500) }],
      "rooms.objects": [
        { _id: "controller-1", type: "controller", room: "E1N1", level: 1 },
        { _id: "controller-duplicate", type: "controller", room: "E1N1", level: 0 },
        { _id: "spawn-foreign", type: "spawn", room: "E1N1", name: "ForeignSpawn", user: "other-user" },
      ],
      users: [],
      "users.code": [],
    };
    const matches = (record: any, query: any): boolean => {
      if (Array.isArray(query?.$and) && !query.$and.every((part: any) => matches(record, part))) return false;
      if (Array.isArray(query?.$or) && !query.$or.some((part: any) => matches(record, part))) return false;
      return Object.entries(query ?? {}).every(([key, expected]) => {
        if (key === "$and" || key === "$or") return true;
        return record[key] === expected || String(record[key]) === String(expected);
      });
    };
    const collection = (name: string) => ({
      findOne: async (query: any) => data[name].find((record) => matches(record, query)) ?? null,
      find: async (query: any) => data[name].filter((record) => matches(record, query)),
      insert: async (records: any) => {
        for (const record of Array.isArray(records) ? records : [records]) {
          data[name].push({ _id: record._id ?? `${name}-${nextId++}`, ...record });
        }
      },
      update: async (query: any, update: any) => {
        const record = data[name].find((candidate) => matches(candidate, query));
        if (!record) return { modified: 0 };
        Object.assign(record, update.$set ?? {});
        for (const key of Object.keys(update.$unset ?? {})) delete record[key];
        return { modified: 1 };
      },
      removeWhere: async (query: any) => {
        data[name] = data[name].filter((record) => !matches(record, query));
      },
    });
    const envData = new Map<string, string>();
    const activeRooms = new Set<string>();
    const context = vm.createContext({
      Promise,
      String,
      Array,
      Set,
      storage: {
        db: Object.fromEntries(Object.keys(data).map((name) => [name, collection(name)])),
        env: {
          keys: { MEMORY: "memory:", ACTIVE_ROOMS: "activeRooms" },
          get: async (key: string) => envData.get(key),
          set: async (key: string, value: string) => { envData.set(key, value); },
          sadd: async (_key: string, value: string) => { activeRooms.add(value); },
        },
      },
      map: { openRoom: async () => undefined, updateTerrainData: async () => undefined },
      common: { getGametime: async () => 0 },
      setPassword: async () => undefined,
      print: () => undefined,
    });

    await vm.runInContext(command, context);
    await vm.runInContext(command, context);

    const user = data.users[0];
    expect(data.users).to.have.length(1);
    expect(user._id).to.equal("test-bot");
    expect(data["rooms.objects"].filter((record) => record.type === "controller")).to.have.length(1);
    expect(data["rooms.objects"].filter((record) => record.type === "controller" && matches(record, { user: user._id }))).to.have.length(1);
    expect(data["rooms.objects"].filter((record) => record.type === "spawn")).to.have.length(1);
    expect(data["rooms.objects"].filter((record) => record.type === "spawn" && matches(record, { user: user._id }))).to.have.length(1);
    expect(data["users.code"].filter((record) => matches(record, { user: user._id, activeWorld: true }))).to.have.length(1);
    expect(user.rooms).to.deep.equal(["E1N1"]);
    expect(user.active).to.equal(0);
    expect(user.bot).to.equal("test-bot");
    expect(envData.get(`memory:${user._id}`)).to.equal("{}");
    expect([...activeRooms]).to.deep.equal(["E1N1"]);
  });

  it("builds a runtime scenario seed command for private-server smoke coverage", () => {
    const options = parseHarnessArgs(["--room=E1N1", "--scenarios=construction-economy,defense-hostile,defense-hard-invader,alliance-safety,link-network,terminal-market-lab-economy"], {});
    const command = buildSeedRuntimeScenariosCommand(options);

    expect(command).to.include('const requestedRoom="E1N1"');
    expect(command).to.include('const scenarios=["construction-economy","defense-hostile","defense-hard-invader","alliance-safety","link-network","terminal-market-lab-economy"]');
    expect(command).to.include("const userId=botUser._id");
    expect(command).to.not.include("const userId=''+botUser._id");
    expect(command).to.include("type:'constructionSite'");
    expect(command).to.include("ScenarioEnemyAttacker");
    expect(command).to.include("ScenarioHardInvader");
    expect(command).to.include("TooAngelScenarioAlly");
    expect(command).to.include("hasScenario('link-network')");
    expect(command).to.include("type:'storage'");
    expect(command).to.include("level:7");
    expect(command).to.include("hasScenario('terminal-market-lab-economy')");
    expect(command).to.include("type:'terminal'");
    expect(command).to.include("type:'lab'");
    expect(command).to.include("economy:'W2N1'");
    expect(command).to.include("screepsmodTestingScenarios");
    expect(command).to.include("screepsmodTestingScenarioSeed:");
    expect(command).to.include("__PI_SCENARIO_SEED__");
  });

  it("records object-level hard invader seed evidence from CLI output", () => {
    const parsed = parseScenarioSeedConfirmationOutput(
      "noise\n__PI_SCENARIO_SEED__{\"scenarios\":[\"defense-hard-invader\"],\"hardInvader\":{\"seeded\":true,\"objectId\":\"abc123\",\"name\":\"ScenarioHardInvader\",\"room\":\"E1N1\",\"user\":\"enemy1\",\"username\":\"ScenarioHardInvader\",\"bodyParts\":50,\"bodyTypes\":[\"tough\",\"ranged_attack\"]}}\n__PI_CLI_DONE_OK__",
    );

    expect(parsed).to.deep.include({ scenarios: ["defense-hard-invader"] });
    expect(parsed?.hardInvader).to.deep.include({
      seeded: true,
      objectId: "abc123",
      name: "ScenarioHardInvader",
      room: "E1N1",
      user: "enemy1",
      username: "ScenarioHardInvader",
      bodyParts: 50,
    });
  });

  it("persists scenario seed confirmation artifacts immediately after seeding", () => {
    const artifactsDir = fs.mkdtempSync(path.join(os.tmpdir(), "screeps-seed-"));
    const options = parseHarnessArgs([`--artifactsDir=${artifactsDir}`], {});
    const summary = createInitialSummary(options, new Date("2026-07-07T00:00:00.000Z"));

    recordScenarioSeedConfirmation(
      options,
      summary,
      "__PI_SCENARIO_SEED__{\"hardInvader\":{\"seeded\":true,\"objectId\":\"hard1\",\"bodyParts\":50}}\n__PI_CLI_DONE_OK__",
    );

    expect(summary.metrics.scenarioSeedConfirmation).to.deep.include({
      hardInvader: { seeded: true, objectId: "hard1", bodyParts: 50 },
    });
    expect(
      JSON.parse(fs.readFileSync(path.join(artifactsDir, "scenario-seed-confirmation.json"), "utf8")),
    ).to.deep.include({ hardInvader: { seeded: true, objectId: "hard1", bodyParts: 50 } });
  });

  it("persists scenario seed failure artifacts when CLI seeding fails", () => {
    const artifactsDir = fs.mkdtempSync(path.join(os.tmpdir(), "screeps-seed-fail-"));
    const options = parseHarnessArgs([`--artifactsDir=${artifactsDir}`, "--scenarios=defense-hard-invader"], {});
    const summary = createInitialSummary(options, new Date("2026-07-07T00:00:00.000Z"));

    recordScenarioSeedConfirmation(
      options,
      summary,
      "__PI_CLI_DONE_ERR__ Error: token=abc123 password=hunter2 hard invader seed failed",
    );

    const artifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, "scenario-seed-confirmation.json"), "utf8"));
    expect(artifact).to.deep.include({
      ok: false,
      scenarios: ["defense-hard-invader"],
      requestedRoom: "W1N1",
    });
    expect(artifact.errorOutput).to.include("token=[REDACTED]");
    expect(artifact.errorOutput).to.include("password=[REDACTED]");
    expect(artifact.errorOutput).to.not.include("abc123");
    expect(artifact.errorOutput).to.not.include("hunter2");
  });

  it("seeds the hostile defense scenario in the owned home room for deterministic smoke visibility", () => {
    const options = parseHarnessArgs(["--room=E1N1", "--scenarios=remote-mining,defense-hostile"], {});
    const command = buildSeedRuntimeScenariosCommand(options);

    expect(command).to.include("const defenseRoom=homeRoom;");
    expect(command).to.not.include("const defenseRoom=hasScenario('remote-mining')?remoteRoom:homeRoom;");
  });

  it("seeds the hard invader scenario with enough room capacity for real defender bodies", () => {
    const options = parseHarnessArgs(["--room=E1N1", "--scenarios=defense-hard-invader"], {});
    const command = buildSeedRuntimeScenariosCommand(options);

    expect(command).to.include("ScenarioHardInvader");
    expect(command).to.include("x:5,y:5,name:'ScenarioHardInvader'");
    expect(command).to.include("type:'extension'");
    expect(command).to.include("level:4");
    expect(command).to.include("safeMode:null");
    expect(command).to.include("hardInvader:hasScenario('defense-hard-invader')?(seedEvidence.hardInvader||{room:homeRoom,bodyParts:50}):undefined");
    expect(command).to.include("await storage.env.set('screepsmodTestingScenarioSeed:'+userId,JSON.stringify(seedEvidence))");
    expect(command).to.include("objectId:hardInvaderObject&&hardInvaderObject._id");
  });

  it("seeds an incoming nuke for nukerless defensive runtime coverage", () => {
    const options = parseHarnessArgs(["--room=E1N1", "--scenarios=nukerless-nuke"], {});
    const command = buildSeedRuntimeScenariosCommand(options);

    expect(command).to.include("hasScenario('nukerless-nuke')");
    expect(command).to.include("type:'nuke'");
    expect(command).to.include("landTime:nukeGameTime+5000");
    expect(command).to.include("launchRoomName:'ScenarioNukeSource'");
  });

  it("seeds two same-tile nukes for stacked-salvo runtime coverage", () => {
    const options = parseHarnessArgs(["--room=E1N1", "--scenarios=stacked-nukes"], {});
    const command = buildSeedRuntimeScenariosCommand(options);

    expect(command).to.include("hasScenario('stacked-nukes')");
    expect(command).to.include("launchRoomName:'ScenarioNukeSourceA'");
    expect(command).to.include("launchRoomName:'ScenarioNukeSourceB'");
    expect(command).to.include("await upsertObject({type:'nuke',room:homeRoom,x:25,y:25,launchRoomName:'ScenarioNukeSourceA'}");
    expect(command).to.include("await upsertObject({type:'nuke',room:homeRoom,x:25,y:25,launchRoomName:'ScenarioNukeSourceB'}");
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
