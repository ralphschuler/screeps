export interface CollectionPointCandidate {
  x: number;
  y: number;
  distanceFromSpawn: number;
  distanceToStorage?: number;
  distanceToController?: number;
  onRoad: boolean;
  blocked: boolean;
  exit: boolean;
}

export interface CollectionPointIntentInput {
  candidates: CollectionPointCandidate[];
  minDistanceFromSpawn: number;
  maxDistanceFromSpawn: number;
  preferredDistanceFromSpawn: number;
  storageDistanceWeight: number;
  controllerDistanceWeight: number;
  roadPenalty: number;
}

export interface CollectionPointIntent {
  position?: { x: number; y: number };
  reason: "selected" | "none-valid";
}

export function planCollectionPointIntent(input: CollectionPointIntentInput): CollectionPointIntent {
  const scored = input.candidates
    .filter(candidate => !candidate.blocked)
    .filter(candidate => !candidate.exit)
    .filter(candidate => candidate.distanceFromSpawn >= input.minDistanceFromSpawn)
    .filter(candidate => candidate.distanceFromSpawn <= input.maxDistanceFromSpawn)
    .map(candidate => ({ candidate, score: scoreCollectionPoint(candidate, input) }))
    .sort((a, b) => b.score - a.score || a.candidate.x - b.candidate.x || a.candidate.y - b.candidate.y);

  const selected = scored[0]?.candidate;
  return selected ? { position: { x: selected.x, y: selected.y }, reason: "selected" } : { reason: "none-valid" };
}

function scoreCollectionPoint(candidate: CollectionPointCandidate, input: CollectionPointIntentInput): number {
  let score = 100;
  score -= Math.abs(candidate.distanceFromSpawn - input.preferredDistanceFromSpawn);
  if (candidate.distanceToStorage !== undefined) score -= candidate.distanceToStorage * input.storageDistanceWeight;
  if (candidate.distanceToController !== undefined) score -= candidate.distanceToController * input.controllerDistanceWeight;
  if (candidate.onRoad) score -= input.roadPenalty;
  return score;
}
