import { describe, it } from "mocha";
import { expect } from "chai";
import { runEconomyRole, runMilitaryRole, runUtilityRole } from "../src/index";

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
});
