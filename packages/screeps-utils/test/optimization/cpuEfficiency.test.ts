import { expect } from "chai";
import { throttle, throttleWithDefault } from "../../src/optimization/cpuEfficiency.ts";

describe("CPU efficiency utilities", () => {
  beforeEach(() => {
    (globalThis as { Game?: { time: number } }).Game = { time: 7 };
  });

  it("treats non-positive throttle intervals as every tick", () => {
    let calls = 0;

    const result = throttle(() => {
      calls++;
      return "ran";
    }, 0);

    expect(result).to.equal("ran");
    expect(calls).to.equal(1);
  });

  it("treats non-finite throttle intervals as every tick", () => {
    let calls = 0;

    const result = throttleWithDefault(() => {
      calls++;
      return "ran";
    }, Number.NaN, "default");

    expect(result).to.equal("ran");
    expect(calls).to.equal(1);
  });
});
