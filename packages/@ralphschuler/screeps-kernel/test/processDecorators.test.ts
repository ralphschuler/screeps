import { expect } from "chai";
import { getConfig } from "../src/config.ts";
import { buildKernelConfigFromCpu, Kernel, ProcessPriority } from "../src/kernel.ts";
import {
  clearProcessMetadata,
  getProcessMetadata,
  MediumFrequencyProcess,
  ProcessClass,
  registerDecoratedProcessesWithKernel
} from "../src/processDecorators.ts";

class DecoratedManager {
  public runs = 0;

  public run(): void {
    this.runs += 1;
  }
}

function decorateManager(): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    DecoratedManager.prototype,
    "run"
  ) as TypedPropertyDescriptor<DecoratedManager["run"]>;

  MediumFrequencyProcess("test:decorated", "Test Decorated", {
    priority: ProcessPriority.HIGH,
    interval: 10,
    minBucket: 1234,
    cpuBudget: 0.04
  })(DecoratedManager.prototype, "run", descriptor);
  ProcessClass()(DecoratedManager);
}

describe("process decorators", () => {
  let kernel: InstanceType<typeof Kernel>;

  beforeEach(() => {
    clearProcessMetadata();
    const kernelConfig = buildKernelConfigFromCpu(getConfig().cpu);
    kernelConfig.enablePriorityDecay = false;
    kernel = new Kernel(kernelConfig);
  });

  afterEach(() => {
    clearProcessMetadata();
  });

  it("registers decorated manager methods on an explicit runtime kernel", () => {
    decorateManager();
    const manager = new DecoratedManager();

    registerDecoratedProcessesWithKernel(kernel, manager);

    const process = kernel.getProcess("test:decorated");
    expect(getProcessMetadata().map(metadata => metadata.options.id)).to.include("test:decorated");
    expect(process).to.not.equal(undefined);
    expect(process!.priority).to.equal(ProcessPriority.HIGH);
    expect(process!.minBucket).to.equal(1234);
    expect(process!.cpuBudget).to.equal(0.04);
    expect(process!.interval).to.be.within(9, 11);

    process!.execute();

    expect(manager.runs).to.equal(1);
  });
});
