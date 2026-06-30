import { describe, it } from "mocha";
import { expect } from "chai";
import { runEconomyRole, runMilitaryRole, runPowerCreepRole, runPowerRole, runUtilityRole } from "../src/index";

describe("Role Exports", () => {
  it("should export runEconomyRole function", () => {
    expect(runEconomyRole).to.be.a("function");
  });

  it("should export runMilitaryRole function", () => {
    expect(runMilitaryRole).to.be.a("function");
  });

  it("should export runUtilityRole function", () => {
    expect(runUtilityRole).to.be.a("function");
  });

  it("should export power role runners", () => {
    expect(runPowerCreepRole).to.be.a("function");
    expect(runPowerRole).to.be.a("function");
  });
});
