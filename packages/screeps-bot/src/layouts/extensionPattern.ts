import type { StructurePlacement } from "./blueprints/types";

export interface ExtensionPatternPosition {
  x: number;
  y: number;
}

export const MAX_GENERATED_EXTENSIONS = 80;

export const CHECKERBOARD_EXTENSION_PATTERN: ExtensionPatternPosition[] = [
  { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -2 }, { x: 0, y: 2 },
  { x: -2, y: -2 }, { x: 2, y: -2 }, { x: -2, y: 2 }, { x: 2, y: 2 }, { x: -1, y: -3 }, { x: 1, y: -3 }, { x: -1, y: 3 }, { x: 1, y: 3 }, { x: -3, y: -1 }, { x: 3, y: -1 }, { x: -3, y: 1 }, { x: 3, y: 1 },
  { x: -4, y: 0 }, { x: 4, y: 0 }, { x: 0, y: -4 }, { x: 0, y: 4 }, { x: -3, y: -3 }, { x: 3, y: -3 }, { x: -3, y: 3 }, { x: 3, y: 3 }, { x: -4, y: -2 }, { x: 4, y: -2 }, { x: -4, y: 2 }, { x: 4, y: 2 }, { x: -2, y: -4 }, { x: 2, y: -4 }, { x: -2, y: 4 }, { x: 2, y: 4 },
  { x: -1, y: -5 }, { x: 1, y: -5 }, { x: -1, y: 5 }, { x: 1, y: 5 }, { x: -5, y: -1 }, { x: 5, y: -1 }, { x: -5, y: 1 }, { x: 5, y: 1 }, { x: -4, y: -4 }, { x: 4, y: -4 }, { x: -4, y: 4 }, { x: 4, y: 4 }, { x: -3, y: -5 }, { x: 3, y: -5 }, { x: -3, y: 5 }, { x: 3, y: 5 }, { x: -5, y: -3 }, { x: 5, y: -3 }, { x: -5, y: 3 }, { x: 5, y: 3 },
  { x: -6, y: 0 }, { x: 6, y: 0 }, { x: 0, y: -6 }, { x: 0, y: 6 }, { x: -6, y: -2 }, { x: 6, y: -2 }, { x: -6, y: 2 }, { x: 6, y: 2 }, { x: -2, y: -6 }, { x: 2, y: -6 }, { x: -2, y: 6 }, { x: 2, y: 6 }, { x: -5, y: -5 }, { x: 5, y: -5 }, { x: -5, y: 5 }, { x: 5, y: 5 }, { x: -4, y: -6 }, { x: 4, y: -6 }, { x: -4, y: 6 }, { x: 4, y: 6 }, { x: -6, y: -4 }, { x: 6, y: -4 }, { x: -6, y: 4 }, { x: 6, y: 4 }
];

export function isCheckerboardPatternPosition(x: number, y: number): boolean {
  return (Math.abs(x) + Math.abs(y)) % 2 === 0;
}

export function generateExtensionPattern(count: number): StructurePlacement[] {
  const end = Math.max(0, Math.min(count, CHECKERBOARD_EXTENSION_PATTERN.length));
  return CHECKERBOARD_EXTENSION_PATTERN.slice(0, end).map(pos => ({
    x: pos.x,
    y: pos.y,
    structureType: STRUCTURE_EXTENSION
  }));
}

export function hasEdgeAdjacentExtensions(extensions: ExtensionPatternPosition[]): boolean {
  const positions = new Set(extensions.map(pos => `${pos.x},${pos.y}`));
  return extensions.some(pos =>
    positions.has(`${pos.x + 1},${pos.y}`) ||
    positions.has(`${pos.x - 1},${pos.y}`) ||
    positions.has(`${pos.x},${pos.y + 1}`) ||
    positions.has(`${pos.x},${pos.y - 1}`)
  );
}

export function addExtensionPatternToBlueprint(existingStructures: StructurePlacement[], targetCount: number): StructurePlacement[] {
  const existingExtensions = existingStructures.filter(structure => structure.structureType === STRUCTURE_EXTENSION);
  const needed = targetCount - existingExtensions.length;
  if (needed <= 0) return existingStructures;

  const usedPositions = new Set(existingStructures.map(structure => `${structure.x},${structure.y}`));
  const newExtensions = generateExtensionPattern(MAX_GENERATED_EXTENSIONS)
    .filter(extension => !usedPositions.has(`${extension.x},${extension.y}`))
    .slice(0, needed);

  return [...existingStructures, ...newExtensions];
}
