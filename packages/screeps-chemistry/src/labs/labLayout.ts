import type { LabRole, RoomLabConfig } from "../types";

/** Position data needed to classify a room's lab cluster. */
export interface LabLayoutPosition {
  x: number;
  y: number;
}

/** Minimal lab shape used by the pure layout planner. */
export interface LabLayoutNode {
  id: Id<StructureLab>;
  pos: LabLayoutPosition;
}

/** Planned non-transient role for a lab in a valid reaction layout. */
export interface PlannedLabRole {
  labId: Id<StructureLab>;
  role: Exclude<LabRole, "unassigned">;
}

export type InvalidLabLayoutReason = "too-few-labs" | "insufficient-reach" | "no-outputs";

export type LabLayoutPlan =
  | { isValid: true; roles: PlannedLabRole[] }
  | { isValid: false; reason: InvalidLabLayoutReason };

export type LabReactionResources = NonNullable<RoomLabConfig["activeReaction"]>;

/**
 * Plan lab roles from positions only.
 *
 * Screeps reactions require two input labs and at least one output lab in range
 * 2 of both inputs. The manager keeps state/memory concerns; this pure function
 * owns only the geometric decision so role assignment is easy to test.
 */
export function planLabLayout(labs: readonly LabLayoutNode[]): LabLayoutPlan {
  if (labs.length < 3) {
    return { isValid: false, reason: "too-few-labs" };
  }

  const bestPair = chooseBestInputPair(labs);
  if (!bestPair) {
    return getBestReach(labs) < 2
      ? { isValid: false, reason: "insufficient-reach" }
      : { isValid: false, reason: "no-outputs" };
  }

  const roles = labs.map(lab => ({
    labId: lab.id,
    role: getPlannedRole(lab, bestPair.input1, bestPair.input2)
  }));

  return { isValid: true, roles };
}

/** Return the lab resource expected for a role while a reaction is active. */
export function getReactionResourceForRole(
  role: LabRole,
  reaction: LabReactionResources
): MineralConstant | MineralCompoundConstant | undefined {
  switch (role) {
    case "input1":
      return reaction.input1;
    case "input2":
      return reaction.input2;
    case "output":
      return reaction.output;
    case "boost":
    case "unassigned":
      return undefined;
  }
}

interface InputPairCandidate {
  input1: LabLayoutNode;
  input2: LabLayoutNode;
  input1Index: number;
  input2Index: number;
  outputCount: number;
  combinedReach: number;
}

function chooseBestInputPair(labs: readonly LabLayoutNode[]): InputPairCandidate | undefined {
  const reachByLabId = new Map(labs.map(lab => [lab.id, countLabsInReactionRange(lab, labs)]));
  const candidates: InputPairCandidate[] = [];

  for (let input1Index = 0; input1Index < labs.length - 1; input1Index++) {
    for (let input2Index = input1Index + 1; input2Index < labs.length; input2Index++) {
      const input1 = labs[input1Index];
      const input2 = labs[input2Index];
      if (!input1 || !input2) continue;

      const outputCount = labs.filter((lab, index) => {
        if (index === input1Index || index === input2Index) return false;
        return isInReactionRange(lab, input1) && isInReactionRange(lab, input2);
      }).length;

      if (outputCount === 0) continue;

      candidates.push({
        input1,
        input2,
        input1Index,
        input2Index,
        outputCount,
        combinedReach: (reachByLabId.get(input1.id) ?? 0) + (reachByLabId.get(input2.id) ?? 0)
      });
    }
  }

  return candidates.sort(compareInputPairs)[0];
}

function compareInputPairs(a: InputPairCandidate, b: InputPairCandidate): number {
  return (
    b.outputCount - a.outputCount ||
    b.combinedReach - a.combinedReach ||
    a.input1Index - b.input1Index ||
    a.input2Index - b.input2Index
  );
}

function getBestReach(labs: readonly LabLayoutNode[]): number {
  return labs.reduce((best, lab) => Math.max(best, countLabsInReactionRange(lab, labs)), 0);
}

function getPlannedRole(
  lab: LabLayoutNode,
  input1: LabLayoutNode,
  input2: LabLayoutNode
): Exclude<LabRole, "unassigned"> {
  if (lab.id === input1.id) return "input1";
  if (lab.id === input2.id) return "input2";

  return isInReactionRange(lab, input1) && isInReactionRange(lab, input2) ? "output" : "boost";
}

function countLabsInReactionRange(lab: LabLayoutNode, labs: readonly LabLayoutNode[]): number {
  return labs.filter(other => lab.id !== other.id && isInReactionRange(lab, other)).length;
}

function isInReactionRange(lab: LabLayoutNode, other: LabLayoutNode): boolean {
  return getChebyshevRange(lab.pos, other.pos) <= 2;
}

function getChebyshevRange(a: LabLayoutPosition, b: LabLayoutPosition): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
