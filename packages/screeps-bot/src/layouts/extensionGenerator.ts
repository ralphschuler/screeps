import type { StructurePlacement } from "./blueprints/types";
import {
  MAX_GENERATED_EXTENSIONS,
  addExtensionPatternToBlueprint,
  generateExtensionPattern,
  isCheckerboardPatternPosition
} from "./extensionPattern";

export { MAX_GENERATED_EXTENSIONS };

export function generateExtensions(count: number): StructurePlacement[] {
  return generateExtensionPattern(count);
}

export function isCheckerboardPosition(x: number, y: number): boolean {
  return isCheckerboardPatternPosition(x, y);
}

export function addExtensionsToBlueprint(
  existingStructures: StructurePlacement[],
  targetCount: number
): StructurePlacement[] {
  return addExtensionPatternToBlueprint(existingStructures, targetCount);
}
