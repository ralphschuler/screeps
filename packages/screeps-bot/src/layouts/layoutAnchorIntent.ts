export interface LayoutPoint {
  x: number;
  y: number;
}

export interface LayoutAnchorSnapshot {
  roomName: string;
  controller: LayoutPoint;
  sources: LayoutPoint[];
  mineral?: LayoutPoint;
  terrain: Map<string, number>;
}

export interface LayoutAnchorCandidate {
  pos: LayoutPoint;
  score: number;
  reasons: string[];
}

export interface LayoutAnchorIntent {
  roomName: string;
  selected: LayoutAnchorCandidate | null;
  candidates: LayoutAnchorCandidate[];
}

export function planLayoutAnchorIntent(snapshot: LayoutAnchorSnapshot): LayoutAnchorIntent {
  const candidates: LayoutAnchorCandidate[] = [];

  for (let x = 10; x < 40; x += 2) {
    for (let y = 10; y < 40; y += 2) {
      const candidate = scoreLayoutAnchor({ x, y }, snapshot);
      if (candidate.score > 0) candidates.push(candidate);
    }
  }

  candidates.sort(compareAnchorCandidates);
  return { roomName: snapshot.roomName, selected: candidates[0] ?? null, candidates };
}

export function scoreLayoutAnchor(pos: LayoutPoint, snapshot: LayoutAnchorSnapshot): LayoutAnchorCandidate {
  let score = 100;
  const reasons: string[] = [];
  let wallCount = 0;
  let swampCount = 0;

  for (let dx = -7; dx <= 7; dx++) {
    for (let dy = -7; dy <= 7; dy++) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      if (x < 0 || x >= 50 || y < 0 || y >= 50) return { pos, score: 0, reasons: ["Out of bounds"] };
      const tile = snapshot.terrain.get(`${x},${y}`) ?? TERRAIN_MASK_WALL;
      if (tile === TERRAIN_MASK_WALL) wallCount++;
      else if (tile === TERRAIN_MASK_SWAMP) swampCount++;
    }
  }

  if (wallCount > 30) {
    score -= 50;
    reasons.push(`${wallCount} walls in build area`);
  } else if (wallCount < 10) {
    score += 10;
    reasons.push("Open terrain");
  }

  if (swampCount > 40) {
    score -= 30;
    reasons.push(`${swampCount} swamp tiles`);
  }

  const controllerDist = rangeTo(pos, snapshot.controller);
  if (controllerDist >= 3 && controllerDist <= 6) {
    score += 20;
    reasons.push(`Controller ${controllerDist} tiles away`);
  } else if (controllerDist < 3) {
    score -= 10;
    reasons.push("Too close to controller");
  } else if (controllerDist > 10) {
    score -= 20;
    reasons.push("Too far from controller");
  }

  const avgSourceDist = snapshot.sources.length
    ? snapshot.sources.reduce((sum, source) => sum + rangeTo(pos, source), 0) / snapshot.sources.length
    : 50;
  if (avgSourceDist >= 4 && avgSourceDist <= 8) {
    score += 15;
    reasons.push(`Sources avg ${avgSourceDist.toFixed(1)} tiles`);
  } else if (avgSourceDist < 4) {
    score -= 5;
    reasons.push("Too close to sources");
  } else if (avgSourceDist > 12) {
    score -= 15;
    reasons.push("Too far from sources");
  }

  if (snapshot.mineral) {
    const mineralDist = rangeTo(pos, snapshot.mineral);
    if (mineralDist >= 5 && mineralDist <= 10) {
      score += 10;
      reasons.push(`Mineral ${mineralDist} tiles away`);
    } else if (mineralDist > 15) {
      score -= 10;
      reasons.push("Far from mineral");
    }
  }

  const centerDist = Math.abs(pos.x - 25) + Math.abs(pos.y - 25);
  if (centerDist < 10) {
    score += 15;
    reasons.push("Near room center");
  } else if (centerDist > 20) {
    score -= 10;
    reasons.push("Far from center");
  }

  const exitDist = Math.min(pos.x, pos.y, 49 - pos.x, 49 - pos.y);
  if (exitDist < 5) {
    score -= 30;
    reasons.push("Too close to exit");
  } else if (exitDist >= 10) {
    score += 10;
    reasons.push("Safe from exits");
  }

  return { pos, score, reasons };
}

function rangeTo(a: LayoutPoint, b: LayoutPoint): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function compareAnchorCandidates(a: LayoutAnchorCandidate, b: LayoutAnchorCandidate): number {
  const scoreCompare = b.score - a.score;
  if (scoreCompare !== 0) return scoreCompare;
  const xCompare = a.pos.x - b.pos.x;
  if (xCompare !== 0) return xCompare;
  return a.pos.y - b.pos.y;
}
