import { expect } from "chai";
import { configureLogger, LogLevel, logger } from "../../src/core/logger";

// Use global sinon from test setup (setup-mocha.js)
declare const sinon: typeof import("sinon");

describe("Logger JSON Output", () => {
  let sandbox: sinon.SinonSandbox;
  let consoleLogStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    consoleLogStub = sandbox.stub(console, "log");
    
    // Configure logger for testing
    configureLogger({
      level: LogLevel.DEBUG,
      cpuLogging: false
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should output single-line JSON with tick", () => {
    // Mock Game.time
    (global as any).Game = { time: 12345 };

    logger.info("Test message");

    expect(consoleLogStub.calledOnce).to.be.true;
    const output = consoleLogStub.firstCall.args[0];
    
    // Should be valid JSON
    const parsed = JSON.parse(output);
    expect(parsed).to.deep.include({
      type: "log",
      level: "INFO",
      message: "Test message",
      tick: 12345
    });
  });

  it("should include subsystem in output", () => {
    (global as any).Game = { time: 12345 };

    logger.info("Test message", { subsystem: "TestSubsystem" });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed.subsystem).to.equal("TestSubsystem");
  });

  it("should include room and creep context", () => {
    (global as any).Game = { time: 12345 };

    logger.warn("Creep stuck", { 
      subsystem: "Movement", 
      room: "W1N1", 
      creep: "harvester1" 
    });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed).to.deep.include({
      subsystem: "Movement",
      room: "W1N1",
      creep: "harvester1"
    });
  });

  it("should include meta fields in output", () => {
    (global as any).Game = { time: 12345 };

    logger.error("CPU overload", { 
      subsystem: "Kernel", 
      meta: { 
        cpuUsed: 25.5, 
        cpuLimit: 20,
        bucket: 1500
      } 
    });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed.cpuUsed).to.equal(25.5);
    expect(parsed.cpuLimit).to.equal(20);
    expect(parsed.bucket).to.equal(1500);
  });

  it("should output stats with tick", () => {
    (global as any).Game = { time: 12345 };

    logger.stat("energy.harvested", 1000, "energy", { 
      subsystem: "Economy", 
      room: "W1N1" 
    });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed).to.deep.include({
      type: "stat",
      key: "energy.harvested",
      value: 1000,
      unit: "energy",
      tick: 12345,
      subsystem: "Economy",
      room: "W1N1"
    });
  });

  it("should handle missing Game.time gracefully", () => {
    delete (global as any).Game;

    logger.info("Test message");

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed.tick).to.equal(0);
  });

  it("should respect log level filtering", () => {
    (global as any).Game = { time: 12345 };
    
    configureLogger({ level: LogLevel.WARN });

    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warning message");

    // Only warning should be logged
    expect(consoleLogStub.calledOnce).to.be.true;
    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    expect(parsed.level).to.equal("WARN");
  });

  it("should protect reserved log fields from meta overwrite", () => {
    (global as any).Game = { time: 12345 };

    logger.info("Test message", {
      subsystem: "TestSubsystem",
      meta: {
        type: "malicious",  // Should be ignored
        level: "CRITICAL",  // Should be ignored
        message: "evil",    // Should be ignored
        tick: 99999,        // Should be ignored
        customField: "ok"   // Should be included
      }
    });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    // Reserved fields should not be overwritten
    expect(parsed.type).to.equal("log");
    expect(parsed.level).to.equal("INFO");
    expect(parsed.message).to.equal("Test message");
    expect(parsed.tick).to.equal(12345);
    
    // Custom field should be included
    expect(parsed.customField).to.equal("ok");
  });

  it("should protect reserved stat fields from meta overwrite", () => {
    (global as any).Game = { time: 12345 };

    logger.stat("test.metric", 100, "units", {
      subsystem: "TestSubsystem",
      meta: {
        type: "malicious",   // Should be ignored
        key: "evil.key",     // Should be ignored
        value: 999,          // Should be ignored
        tick: 99999,         // Should be ignored
        unit: "bad",         // Should be ignored
        customField: "ok"    // Should be included
      }
    });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    // Reserved fields should not be overwritten
    expect(parsed.type).to.equal("stat");
    expect(parsed.key).to.equal("test.metric");
    expect(parsed.value).to.equal(100);
    expect(parsed.tick).to.equal(12345);
    expect(parsed.unit).to.equal("units");
    
    // Custom field should be included
    expect(parsed.customField).to.equal("ok");
  });

  it("should include shard from Game.shard.name", () => {
    (global as any).Game = { time: 12345, shard: { name: "shard2" } };

    logger.info("Test message");

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed.shard).to.equal("shard2");
  });

  it("should default to shard0 when Game.shard is not available", () => {
    (global as any).Game = { time: 12345 };

    logger.info("Test message");

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed.shard).to.equal("shard0");
  });

  it("should allow shard override from context", () => {
    (global as any).Game = { time: 12345, shard: { name: "shard1" } };

    logger.info("Test message", { shard: "shard3" });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed.shard).to.equal("shard3");
  });

  it("should include shard in stat messages", () => {
    (global as any).Game = { time: 12345, shard: { name: "shard1" } };

    logger.stat("cpu.used", 15.5);

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    expect(parsed).to.deep.include({
      type: "stat",
      key: "cpu.used",
      value: 15.5,
      tick: 12345,
      shard: "shard1"
    });
  });

  it("should protect shard field from meta overwrite", () => {
    (global as any).Game = { time: 12345, shard: { name: "shard1" } };

    logger.info("Test message", {
      meta: {
        shard: "malicious"  // Should be ignored
      }
    });

    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    
    // Shard from Game.shard.name should be preserved
    expect(parsed.shard).to.equal("shard1");
  });
});

describe("Logger Batching", () => {
  let sandbox: sinon.SinonSandbox;
  let consoleLogStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    consoleLogStub = sandbox.stub(console, "log");
    
    // Configure logger for testing with batching enabled
    configureLogger({
      level: LogLevel.DEBUG,
      cpuLogging: false,
      enableBatching: true,
      maxBatchSize: 5
    });

    (global as any).Game = { time: 12345 };
  });

  afterEach(() => {
    // Flush any pending logs
    logger.flush();
    sandbox.restore();
  });

  it("should batch multiple log messages", () => {
    logger.info("Message 1");
    logger.info("Message 2");
    logger.info("Message 3");

    // No console.log calls yet (batched)
    expect(consoleLogStub.called).to.be.false;

    // Flush the batch
    logger.flush();

    // Should have one console.log call with all messages
    expect(consoleLogStub.calledOnce).to.be.true;
    const output = consoleLogStub.firstCall.args[0];
    
    // Output should contain all three messages
    const lines = output.split('\n');
    expect(lines).to.have.length(3);
    
    const msg1 = JSON.parse(lines[0]);
    const msg2 = JSON.parse(lines[1]);
    const msg3 = JSON.parse(lines[2]);
    
    expect(msg1.message).to.equal("Message 1");
    expect(msg2.message).to.equal("Message 2");
    expect(msg3.message).to.equal("Message 3");
  });

  it("should auto-flush when batch size limit is reached", () => {
    // maxBatchSize is 5, so 5th message should trigger auto-flush
    logger.info("Message 1");
    logger.info("Message 2");
    logger.info("Message 3");
    logger.info("Message 4");
    
    expect(consoleLogStub.called).to.be.false;
    
    logger.info("Message 5"); // This triggers auto-flush
    
    expect(consoleLogStub.calledOnce).to.be.true;
    const output = consoleLogStub.firstCall.args[0];
    const lines = output.split('\n');
    expect(lines).to.have.length(5);
  });

  it("should support disabling batching", () => {
    configureLogger({ enableBatching: false });

    logger.info("Immediate message");

    // Should output immediately
    expect(consoleLogStub.calledOnce).to.be.true;
    const output = consoleLogStub.firstCall.args[0];
    const parsed = JSON.parse(output);
    expect(parsed.message).to.equal("Immediate message");
  });

  it("should handle empty batch flush", () => {
    // Flush with no messages
    logger.flush();
    
    // Should not call console.log
    expect(consoleLogStub.called).to.be.false;
  });

  it("should clear batch after flush", () => {
    logger.info("Message 1");
    logger.flush();
    
    expect(consoleLogStub.calledOnce).to.be.true;
    consoleLogStub.resetHistory();
    
    // Second flush should not output anything
    logger.flush();
    expect(consoleLogStub.called).to.be.false;
  });

  it("should batch different log levels together", () => {
    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warning message");
    logger.error("Error message");

    logger.flush();

    expect(consoleLogStub.calledOnce).to.be.true;
    const output = consoleLogStub.firstCall.args[0];
    const lines = output.split('\n');
    expect(lines).to.have.length(4);
    
    const levels = lines.map(line => JSON.parse(line).level);
    expect(levels).to.deep.equal(["DEBUG", "INFO", "WARN", "ERROR"]);
  });

  it("should batch stats with logs", () => {
    logger.info("Starting harvest");
    logger.stat("energy.harvested", 100, "energy");
    logger.info("Finished harvest");

    logger.flush();

    expect(consoleLogStub.calledOnce).to.be.true;
    const output = consoleLogStub.firstCall.args[0];
    const lines = output.split('\n');
    expect(lines).to.have.length(3);
    
    const msg1 = JSON.parse(lines[0]);
    const stat = JSON.parse(lines[1]);
    const msg2 = JSON.parse(lines[2]);
    
    expect(msg1.type).to.equal("log");
    expect(stat.type).to.equal("stat");
    expect(msg2.type).to.equal("log");
  });
});

