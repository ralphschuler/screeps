import { expect } from "chai";
import {
  appendCpuBenchmarkSample,
  buildStructuralSnapshot,
  compareCpuAnalyses,
  deriveCandidateRooms,
  summarizeCpuBenchmarkSamples,
  summarizeRoomObjects,
  translateRoomNames,
} from "../../scripts/cpu-benchmark-model.js";
import { buildEnsureLiveCloneAuthCommand, buildSeedLiveCloneCommand } from "../../scripts/live-clone-seeder.js";
import { createInitialSummary, inspectMemorySnapshot, parseHarnessArgs } from "../../scripts/private-server-harness.js";
import { parseOptions as parseCpuBenchmarkOptions, resolveDurationMinutes } from "../../scripts/run-cpu-benchmark.js";

function sampleSnapshot() {
  return buildStructuralSnapshot({
    hostname: "screeps.com",
    shard: "shard1",
    tick: 123,
    myUserName: "TedRoastBeef",
    memory: {
      stats: { tick: 123, cpu: { used: 10, bucket: 9999 }, rooms: { W17S29: { rcl: 6, profiler: { avg_cpu: 1.2 } } } },
      rooms: { W17S29: { swarm: { posture: "eco", danger: 0 } } },
      creeps: { a: { role: "harvester", homeRoom: "W17S29" } },
    },
    roomResponses: {
      W17S29: {
        users: { u1: { username: "TedRoastBeef" }, u2: { username: "TooAngel" }, u3: { username: "Invader" } },
        objects: [
          { type: "controller", room: "W17S29", x: 25, y: 40, level: 6, user: "u1" },
          { type: "source", room: "W17S29", x: 10, y: 10, energy: 1500, energyCapacity: 1500 },
          { type: "spawn", room: "W17S29", x: 25, y: 25, name: "Spawn1", user: "u1", store: { energy: 300 }, hits: 5000, hitsMax: 5000 },
          { type: "creep", room: "W17S29", x: 24, y: 25, name: "mine", user: "u1", memory: { role: "harvester" }, body: [{ type: "work" }, { type: "carry" }, { type: "move" }], hits: 300, hitsMax: 300, ticksToLive: 1000 },
          { type: "creep", room: "W17S29", x: 23, y: 25, name: "ally", user: "u2", body: [{ type: "move" }], hits: 100, hitsMax: 100, ticksToLive: 1000 },
          { type: "creep", room: "W17S29", x: 22, y: 25, name: "hostile", user: "u3", body: [{ type: "attack" }, { type: "move" }], hits: 200, hitsMax: 200, ticksToLive: 1000 },
        ],
      },
    },
    roomStatus: { W17S29: { status: "normal" } },
  });
}

describe("CPU benchmark workflow contracts", () => {
  it("translates live room names into deterministic local private-server rooms", () => {
    const mapping = translateRoomNames(["W17S29", "W18S29", "W18S31"]);

    expect(mapping).to.deep.equal({
      W18S29: "E31S31",
      W18S31: "E31S33",
      W17S29: "E32S31",
    });
  });

  it("derives candidate rooms from stats, room memory, creeps, and explicit rooms", () => {
    const rooms = deriveCandidateRooms({
      stats: { rooms: { W17S29: {} } },
      rooms: { W18S29: {} },
      creeps: { a: { homeRoom: "W19S26" } },
    }, ["W18S31"], 10);

    expect(rooms).to.have.members(["W17S29", "W18S29", "W18S31", "W19S26"]);
  });

  it("summarizes roomObjects without counting permanent allies as hostiles", () => {
    const summary = summarizeRoomObjects({
      roomName: "W1N1",
      myUserName: "swarm-bot",
      response: {
        users: { ally: { username: "TooAngel" }, enemy: { username: "Invader" } },
        objects: [
          { type: "creep", user: "ally", name: "ally", body: [{ type: "move" }] },
          { type: "creep", user: "enemy", name: "enemy", body: [{ type: "attack" }] },
        ],
      },
    });

    expect(summary.creeps.allyCount).to.equal(1);
    expect(summary.creeps.hostileCount).to.equal(1);
    expect(summary.allySafety.hostileOwners).to.deep.equal(["Invader"]);
  });

  it("builds a sanitized structural snapshot with room mapping and memory summary", () => {
    const snapshot = sampleSnapshot();

    expect(snapshot.roomCount).to.equal(1);
    expect(snapshot.source.apiPolicy.stateChangingEndpointsUsed).to.equal(false);
    expect(snapshot.rooms[0].benchmarkName).to.match(/^E\d+S\d+$/);
    expect(snapshot.rooms[0].creeps.mine).to.have.length(1);
    expect(snapshot.rooms[0].creeps.allies[0].owner).to.equal("TooAngel");
    expect(snapshot.rooms[0].creeps.hostiles[0].owner).to.equal("Invader");
    expect(snapshot.memorySummary.creepsByRole.harvester).to.equal(1);
  });

  it("builds a live-clone seed command that is isolated behind benchmark scenario memory", () => {
    const command = buildSeedLiveCloneCommand({ username: "swarm-bot", password: "ci-password" }, sampleSnapshot());

    expect(command).to.include("live-structural-clone");
    expect(command).to.include("swarm-bot");
    expect(command).to.include("TedRoastBeef");
    expect(command).to.include("TooAngel");
    expect(command).to.include("typeof activeCode.modules.main!=='string'");
    expect(command).to.include("findUserByNameOrId");
  });

  it("builds a post-restart auth repair command for live-clone benchmark users", () => {
    const command = buildEnsureLiveCloneAuthCommand({ username: "swarm-bot", password: "ci-password" });

    expect(command).to.include("setPassword(username,password)");
    expect(command).to.include("Password hash missing");
    expect(command).to.include("rawMemory==='undefined'");
    expect(command).to.include("activeWorld:true");
    expect(command).to.include("BenchmarkUser_");
    expect(command).to.include("findUserByNameOrId");
    expect(command).to.include("await findUserByNameOrId(username)");
  });

  it("parses harness benchmark options for bundle and live clone snapshot overrides", () => {
    const options = parseHarnessArgs([
      "--mode=cpu-benchmark",
      "--scenarios=none",
      "--liveCloneSnapshot=/tmp/snapshot.json",
      "--botBundle=/tmp/main.js",
      "--artifactsDir=/tmp/artifacts",
    ], {});

    expect(options.scenarios).to.deep.equal([]);
    expect(options.liveCloneSnapshot).to.equal("/tmp/snapshot.json");
    expect(options.botBundle).to.equal("/tmp/main.js");
    expect(options.artifactsDir).to.equal("/tmp/artifacts");
  });

  it("lets CPU benchmark runs extend wall-clock duration beyond the smoke default", () => {
    const estimated = parseCpuBenchmarkOptions([
      "--snapshot=/tmp/snapshot.json",
      "--ticks=3000",
      "--tickRate=20",
      "--tickWallMs=1000",
      "--durationBufferMinutes=15",
    ]);
    const overridden = parseCpuBenchmarkOptions([
      "--snapshot=/tmp/snapshot.json",
      "--ticks=3000",
      "--durationMinutes=90",
    ]);

    expect(resolveDurationMinutes(estimated)).to.equal(65);
    expect(resolveDurationMinutes(overridden)).to.equal(90);
  });

  it("summarizes and compares CPU benchmark samples with regression gates", () => {
    const baseline = summarizeCpuBenchmarkSamples([
      { tick: 1, cpu: { used: 10, bucket: 9900 } },
      { tick: 2, cpu: { used: 12, bucket: 9800 } },
      { tick: 3, cpu: { used: 11, bucket: 9700 } },
    ]);
    const current = summarizeCpuBenchmarkSamples([
      { tick: 1, cpu: { used: 9, bucket: 9900 } },
      { tick: 2, cpu: { used: 10, bucket: 9800 } },
      { tick: 3, cpu: { used: 9, bucket: 9800 } },
    ]);

    const report = compareCpuAnalyses(baseline, current, { cpu: 0.10, bucket: 0.05 });

    expect(baseline.avgCpu).to.equal(11);
    expect(current.avgCpu).to.be.lessThan(baseline.avgCpu);
    expect(report.status).to.equal("passed");
    expect(report.verdict).to.equal("positive-or-neutral");
  });

  it("appends CPU benchmark samples from Memory.stats into harness metrics", () => {
    const summary: any = { metrics: {} };

    appendCpuBenchmarkSample({ stats: { tick: 10, cpu: { used: 5, bucket: 9990 }, processes: { kernel: { avg_cpu: 1.5 } } } }, summary);

    expect(summary.metrics.cpuBenchmark.analysis.avgCpu).to.equal(5);
    expect(summary.metrics.cpuBenchmark.analysis.topProcesses[0].key).to.equal("kernel");
  });

  it("records screepsmod-testing failures without aborting cpu-benchmark mode", () => {
    const options = parseHarnessArgs(["--mode=cpu-benchmark"], {});
    const summary = createInitialSummary(options, new Date("2026-06-29T00:00:00.000Z"));

    expect(() =>
      inspectMemorySnapshot(
        { screepsmodTesting: { total: 2, passed: 1, failed: 1 }, creepTaskBoard: { rooms: {} } },
        summary,
        new Date("2026-06-29T00:00:01.000Z"),
        options,
      ),
    ).not.to.throw();
    expect(summary.metrics.screepsmodTesting.failed).to.equal(1);
  });
});
