import { assert } from "chai";
import { ShardCommands } from "../../src/core/shardCommands";

// Minimal regression coverage for console command input guards.
describe("ShardCommands", () => {
  describe("transferResource", () => {
    it("rejects non-positive transfer amounts before creating tasks", () => {
      const commands = new ShardCommands();

      assert.equal(
        commands.transferResource("shard1", "W1N1", RESOURCE_ENERGY, 0),
        "Invalid amount: 0. Amount must be a positive finite number."
      );
      assert.equal(
        commands.transferResource("shard1", "W1N1", RESOURCE_ENERGY, -100),
        "Invalid amount: -100. Amount must be a positive finite number."
      );
    });
  });
});
