import { expect } from "chai";
import zlib from "node:zlib";
import {
  buildEnsureBotUserCommand,
  createInitialSummary,
  decodeMemoryData,
  inspectMemorySnapshot,
  parseHarnessArgs,
  parseTickRate,
  shouldContinuePolling,
  validateSmokeSummary,
} from "../../scripts/private-server-harness.js";

describe("private-server harness module", () => {
  it("parses smoke defaults into a stable run contract", () => {
    const options = parseHarnessArgs([], {});

    expect(options.mode).to.equal("smoke");
    expect(options.durationMinutes).to.equal(5);
    expect(options.maxTicks).to.equal(1000);
    expect(options.tickPollMs).to.equal(10000);
    expect(options.tickRate).to.equal(20);
    expect(options.serverPort).to.equal(21025);
    expect(options.cliPort).to.equal(21026);
    expect(options.serverPassword).to.equal("ci-password");
    expect(options.shardName).to.equal("shard0");
    expect(options.username).to.equal("swarm-bot");
    expect(options.password).to.equal("ci-password");
    expect(options.roomName).to.equal("W1N1");
    expect(options.projectName).to.equal("screeps-ci-smoke");
    expect(options.artifactsDir).to.match(
      /packages\/screeps-server\/artifacts\/smoke$/,
    );
    expect(options.botBundle).to.match(
      /packages\/screeps-bot\/dist\/main\.js$/,
    );
  });

  it("parses long defaults and environment overrides", () => {
    const options = parseHarnessArgs(["--mode=long"], {
      SCREEPS_SERVER_PASSWORD: "server-secret",
      SHARD_NAME: "shard9",
      SCREEPS_TICK_RATE: "20",
    });

    expect(options.mode).to.equal("long");
    expect(options.durationMinutes).to.equal(120);
    expect(options.maxTicks).to.equal(72000);
    expect(options.serverPassword).to.equal("server-secret");
    expect(options.shardName).to.equal("shard9");
    expect(options.tickRate).to.equal(20);
    expect(options.projectName).to.equal("screeps-ci-long");
  });

  it("rejects invalid tick rates", () => {
    expect(() => parseTickRate("bad")).to.throw(/positive integer/);
    expect(() => parseTickRate(0)).to.throw(/positive integer/);
    expect(parseTickRate("20")).to.equal(20);
  });

  it("creates summary with expected artifact-facing fields", () => {
    const summary = createInitialSummary(
      parseHarnessArgs(["--mode=smoke", "--room=E1N1"], {}),
      new Date("2026-05-09T00:00:00.000Z"),
    );

    expect(summary).to.deep.include({
      mode: "smoke",
      startedAt: "2026-05-09T00:00:00.000Z",
      durationMinutes: 5,
      maxTicks: 1000,
      serverPort: 21025,
      tickRate: 20,
      roomName: "E1N1",
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

  it("requires task-board rooms after smoke warmup", () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}));
    summary.checks.modResultsPresent = true;
    summary.metrics.screepsmodTesting = { total: 1, failed: 0 };
    summary.metrics.ticksAdvanced = 100;
    summary.metrics.criticalConsoleErrors = 0;
    summary.metrics.taskBoardRooms = 0;

    expect(() => validateSmokeSummary(summary)).to.throw(/creepTaskBoard/);
  });

  it("stops polling when actual game ticks reach maxTicks", () => {
    expect(shouldContinuePolling({ nowMs: 10, endAtMs: 100, polls: 1, maxTicks: 1000, ticksAdvanced: 999 })).to.equal(true);
    expect(shouldContinuePolling({ nowMs: 10, endAtMs: 100, polls: 1, maxTicks: 1000, ticksAdvanced: 1000 })).to.equal(false);
  });

  it("builds a bot-user bootstrap command that creates or falls back to an available controller room", () => {
    const options = parseHarnessArgs(
      ["--room=E1N1", "--username=test-bot"],
      {},
    );
    const command = buildEnsureBotUserCommand(options);

    expect(command).to.include('const requestedRoom=\"E1N1\"');
    expect(command).to.include("let spawnRoom=requestedRoom");
    expect(command).to.include("map.generateRoom(requestedRoom)");
    expect(command).to.include("map.openRoom(requestedRoom)");
    expect(command).to.include("if(!controller||controller.user)");
    expect(command).to.include("Array.isArray(controllersResult)");
    expect(command).to.include(
      "controllers.find(item=>item&&item.room&&!item.user)",
    );
    expect(command).to.include("bots.spawn('swarm-bot',spawnRoom");
    expect(command).to.not.include("find({ type: 'controller', user: null })");
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
