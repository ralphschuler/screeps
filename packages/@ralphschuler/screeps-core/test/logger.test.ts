import { assert } from "chai";
import {
  configureLogger,
  getLoggerConfig,
  LogLevel,
  LogContext,
  logger,
  info,
  debug,
  warn,
  flushLogs
} from "../src/logger.ts";

describe("core logger", () => {
  let logs: string[];
  let originalLog: (...args: unknown[]) => void;

  beforeEach(() => {
    logs = [];
    originalLog = console.log;
    (console as any).log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    (global as any).Game = {
      time: 12345,
      shard: { name: "shard0" },
      cpu: {
        getUsed: () => 0
      }
    };

    configureLogger({
      level: LogLevel.INFO,
      enableBatching: false,
      maxBatchSize: 50,
      cpuLogging: false
    });
  });

  afterEach(() => {
    console.log = originalLog;
    flushLogs();
  });

  it("suppresses logs below configured level", () => {
    debug("hidden debug");
    assert.equal(logs.length, 0);
  });

  it("logs info as JSON payload with tick and shard", () => {
    info("hello");
    assert.equal(logs.length, 1);

    const event = JSON.parse(logs[0]) as { level: string; message: string; tick: number; shard: string };
    assert.equal(event.level, "INFO");
    assert.equal(event.message, "hello");
    assert.equal(event.tick, 12345);
    assert.equal(event.shard, "shard0");
  });

  it("adds context fields from scoped logger", () => {
    const roomContext: LogContext = { room: "W0N0", subsystem: "Kernel", meta: { score: 100 } };
    info("room event", roomContext);

    const event = JSON.parse(logs[0]);
    assert.equal(event.room, "W0N0");
    assert.equal(event.subsystem, "Kernel");
    assert.equal(event.score, 100);
  });

  it("supports createLogger with subsystem context", () => {
    const scoped = logger.createLogger("TestSubsystem");

    scoped.warn("scoped warning", "W1N1");

    const event = JSON.parse(logs[0]);
    assert.equal(event.subsystem, "TestSubsystem");
    assert.equal(event.room, "W1N1");
    assert.equal(event.level, "WARN");
  });

  it("returns mutable logger configuration", () => {
    const config = getLoggerConfig();
    config.level = LogLevel.DEBUG;

    const runtimeConfig = getLoggerConfig();
    assert.equal(runtimeConfig.level, LogLevel.INFO);
  });

  it("warn is emitted at info level", () => {
    warn("careful");
    assert.equal(logs.length, 1);

    const event = JSON.parse(logs[0]);
    assert.equal(event.level, "WARN");
  });
});
