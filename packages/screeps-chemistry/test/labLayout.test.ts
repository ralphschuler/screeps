import { expect } from "chai";
import { planLabLayout, getReactionResourceForRole } from "../src/labs/labLayout";

function lab(id: string, x: number, y: number) {
  return { id: id as Id<StructureLab>, pos: { x, y } };
}

describe("lab layout planning", () => {
  it("assigns the first highest-reach pair as inputs and classifies outputs/boost labs", () => {
    const plan = planLabLayout([
      lab("lab1", 25, 25),
      lab("lab2", 26, 25),
      lab("lab3", 25, 26),
      lab("boost", 40, 40)
    ]);

    expect(plan.isValid).to.equal(true);
    if (!plan.isValid) throw new Error("expected valid lab plan");

    expect(plan.roles).to.deep.equal([
      { labId: "lab1", role: "input1" },
      { labId: "lab2", role: "input2" },
      { labId: "lab3", role: "output" },
      { labId: "boost", role: "boost" }
    ]);
  });

  it("rejects layouts with fewer than three labs", () => {
    const plan = planLabLayout([lab("lab1", 25, 25), lab("lab2", 26, 25)]);

    expect(plan).to.deep.equal({ isValid: false, reason: "too-few-labs" });
  });

  it("rejects layouts when the best input candidate cannot reach two labs", () => {
    const plan = planLabLayout([
      lab("lab1", 10, 10),
      lab("lab2", 20, 20),
      lab("lab3", 30, 30)
    ]);

    expect(plan).to.deep.equal({ isValid: false, reason: "insufficient-reach" });
  });

  it("can use the highest-reach lab as the shared output instead of forcing it to be an input", () => {
    const plan = planLabLayout([
      lab("center", 25, 25),
      lab("east", 27, 25),
      lab("west", 23, 25)
    ]);

    expect(plan.isValid).to.equal(true);
    if (!plan.isValid) throw new Error("expected valid lab plan");

    expect(plan.roles).to.deep.equal([
      { labId: "center", role: "output" },
      { labId: "east", role: "input1" },
      { labId: "west", role: "input2" }
    ]);
  });
});

describe("lab reaction role resources", () => {
  const reaction = {
    input1: RESOURCE_HYDROGEN,
    input2: RESOURCE_OXYGEN,
    output: RESOURCE_HYDROXIDE
  };

  it("maps reaction resources only to reaction roles", () => {
    expect(getReactionResourceForRole("input1", reaction)).to.equal(RESOURCE_HYDROGEN);
    expect(getReactionResourceForRole("input2", reaction)).to.equal(RESOURCE_OXYGEN);
    expect(getReactionResourceForRole("output", reaction)).to.equal(RESOURCE_HYDROXIDE);
    expect(getReactionResourceForRole("boost", reaction)).to.equal(undefined);
    expect(getReactionResourceForRole("unassigned", reaction)).to.equal(undefined);
  });
});
