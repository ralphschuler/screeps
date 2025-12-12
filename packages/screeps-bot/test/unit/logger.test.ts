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
});
