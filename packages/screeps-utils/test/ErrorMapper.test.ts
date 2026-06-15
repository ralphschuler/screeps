import { expect } from "chai";
import sinon from "sinon";

import { ErrorMapper } from "../src/errors/ErrorMapper";

describe("ErrorMapper", () => {
  afterEach(() => {
    sinon.restore();
    ErrorMapper.cache = {};
  });

  it("falls back to original stack when source map consumer is unavailable", async () => {
    sinon.stub(ErrorMapper, "getConsumer").resolves(null as any);

    const stack = "Error: boom\n    at main:10:20";
    const result = await ErrorMapper.sourceMappedStackTrace(stack);

    expect(result).to.equal(stack);
  });

  it("maps main frames when source map consumer is available", async () => {
    const consumer = {
      originalPositionFor: sinon.stub().returns({
        source: "src/main.ts",
        line: 11,
        column: 21,
        name: "bootstrap",
      }),
    };

    sinon.stub(ErrorMapper, "getConsumer").resolves(consumer as any);

    const stack = "Error: boom\n    at main:10:20";
    const result = await ErrorMapper.sourceMappedStackTrace(stack);

    sinon.assert.calledWith(
      consumer.originalPositionFor as sinon.SinonStub,
      {
        column: 20,
        line: 10,
      },
    );
    expect(result).to.equal(
      "Error: boom\n    at main:10:20\n    at bootstrap (src/main.ts:11:21)",
    );
  });

  it("caches mapped traces for repeated calls", async () => {
    const consumer = {
      originalPositionFor: sinon
        .stub()
        .returns({
          source: "src/main.ts",
          line: 11,
          column: 21,
          name: "bootstrap",
        }),
    };

    const getConsumerStub = sinon
      .stub(ErrorMapper, "getConsumer")
      .resolves(consumer as any);

    const stack = "Error: cached\n    at main:10:20";

    const first = await ErrorMapper.sourceMappedStackTrace(stack);
    const second = await ErrorMapper.sourceMappedStackTrace(stack);

    expect(first).to.equal(second);
    sinon.assert.calledOnce(getConsumerStub);
  });

  it("skips uncached source-map parsing when the CPU bucket is below the configured guard", async () => {
    (global as any).Game = { cpu: { bucket: 100 }, rooms: {} };
    (global as any).Memory = { errorMapper: { sourceMapMinBucket: 2000 } };
    const getConsumerStub = sinon.stub(ErrorMapper, "getConsumer").resolves({} as any);

    const stack = "Error: low bucket\n    at main:10:20";
    const result = await ErrorMapper.sourceMappedStackTrace(stack);

    expect(result).to.equal(stack);
    sinon.assert.notCalled(getConsumerStub);
  });

  it("allows the low-bucket source-map guard to be disabled for rollback", async () => {
    (global as any).Game = { cpu: { bucket: 100 }, rooms: {} };
    (global as any).Memory = { errorMapper: { sourceMapLowBucketGuard: false, sourceMapMinBucket: 2000 } };
    const consumer = {
      originalPositionFor: sinon.stub().returns({
        source: "src/main.ts",
        line: 11,
        column: 21,
        name: "bootstrap",
      }),
    };
    const getConsumerStub = sinon.stub(ErrorMapper, "getConsumer").resolves(consumer as any);

    const result = await ErrorMapper.sourceMappedStackTrace("Error: rollback\n    at main:10:20");

    expect(result).to.include("bootstrap (src/main.ts:11:21)");
    sinon.assert.calledOnce(getConsumerStub);
  });
});
