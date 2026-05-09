import { expect } from 'chai';
import zlib from 'node:zlib';
import {
  buildEnsureBotUserCommand,
  createInitialSummary,
  decodeMemoryData,
  inspectMemorySnapshot,
  parseHarnessArgs
} from '../../scripts/private-server-harness.js';

describe('private-server harness module', () => {
  it('parses smoke defaults into a stable run contract', () => {
    const options = parseHarnessArgs([], {});

    expect(options.mode).to.equal('smoke');
    expect(options.durationMinutes).to.equal(5);
    expect(options.maxTicks).to.equal(1000);
    expect(options.tickPollMs).to.equal(10000);
    expect(options.serverPort).to.equal(21025);
    expect(options.cliPort).to.equal(21026);
    expect(options.serverPassword).to.equal('ci-password');
    expect(options.shardName).to.equal('shard0');
    expect(options.username).to.equal('swarm-bot');
    expect(options.password).to.equal('ci-password');
    expect(options.roomName).to.equal('W1N1');
    expect(options.projectName).to.equal('screeps-ci-smoke');
    expect(options.artifactsDir).to.match(/packages\/screeps-server\/artifacts\/smoke$/);
    expect(options.botBundle).to.match(/packages\/screeps-bot\/dist\/main\.js$/);
  });

  it('parses long defaults and environment overrides', () => {
    const options = parseHarnessArgs(['--mode=long'], {
      SCREEPS_SERVER_PASSWORD: 'server-secret',
      SHARD_NAME: 'shard9'
    });

    expect(options.mode).to.equal('long');
    expect(options.durationMinutes).to.equal(120);
    expect(options.maxTicks).to.equal(72000);
    expect(options.serverPassword).to.equal('server-secret');
    expect(options.shardName).to.equal('shard9');
    expect(options.projectName).to.equal('screeps-ci-long');
  });

  it('creates summary with expected artifact-facing fields', () => {
    const summary = createInitialSummary(parseHarnessArgs(['--mode=smoke', '--room=E1N1'], {}), new Date('2026-05-09T00:00:00.000Z'));

    expect(summary).to.deep.include({
      mode: 'smoke',
      startedAt: '2026-05-09T00:00:00.000Z',
      durationMinutes: 5,
      maxTicks: 1000,
      serverPort: 21025,
      roomName: 'E1N1',
      finishedAt: null,
      status: 'running'
    });
    expect(summary.checks).to.deep.equal({});
    expect(summary.metrics).to.deep.equal({});
    expect(summary.errors).to.deep.equal([]);
  });

  it('decodes plain, object, empty, and gzipped Memory payloads', () => {
    const payload = { screepsmodTesting: { failed: 0 }, creepTaskBoard: { rooms: { W1N1: {} } } };
    const gz = `gz:${zlib.gzipSync(JSON.stringify(payload)).toString('base64')}`;

    expect(decodeMemoryData(null)).to.deep.equal({});
    expect(decodeMemoryData(payload)).to.equal(payload);
    expect(decodeMemoryData(JSON.stringify(payload))).to.deep.equal(payload);
    expect(decodeMemoryData(gz)).to.deep.equal(payload);
  });

  it('records mod results, task-board rooms, and critical console errors from Memory', () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}), new Date('2026-05-09T00:00:00.000Z'));

    inspectMemorySnapshot({
      screepsmodTesting: { total: 3, passed: 3, failed: 0 },
      creepTaskBoard: { rooms: { W1N1: {}, W2N1: {} } },
      ciCriticalConsoleErrors: 1
    }, summary, new Date('2026-05-09T00:01:00.000Z'));

    expect(summary.checks.modResultsPresent).to.equal(true);
    expect(summary.metrics.lastMemorySeenAt).to.equal('2026-05-09T00:01:00.000Z');
    expect(summary.metrics.screepsmodTesting).to.deep.equal({ total: 3, passed: 3, failed: 0 });
    expect(summary.metrics.taskBoardRooms).to.equal(2);
    expect(summary.metrics.criticalConsoleErrors).to.equal(1);
  });

  it('builds a bot-user bootstrap command that spawns in the configured room without pre-scanning controllers', () => {
    const options = parseHarnessArgs(['--room=E1N1', '--username=test-bot'], {});
    const command = buildEnsureBotUserCommand(options);

    expect(command).to.include('const room=\"E1N1\"');
    expect(command).to.include("bots.spawn('swarm-bot',room");
    expect(command).to.not.include('No unowned controller room found');
    expect(command).to.not.include("find({ type: 'controller', user: null })");
  });

  it('fails the run when screepsmod-testing reports failed tests', () => {
    const summary = createInitialSummary(parseHarnessArgs([], {}), new Date('2026-05-09T00:00:00.000Z'));

    expect(() => inspectMemorySnapshot({
      screepsmodTesting: { total: 2, passed: 1, failed: 1 },
      creepTaskBoard: { rooms: {} }
    }, summary)).to.throw(/reported 1 failed tests/);
  });
});
