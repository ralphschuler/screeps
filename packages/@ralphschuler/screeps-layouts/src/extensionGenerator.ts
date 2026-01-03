/**
 * Extension Generator
 *
 * Generates extension positions in a checkerboard pattern around the spawn
 * to fill out the full 60 extensions allowed at RCL 8.
 *
 * Key design: Extensions are placed in a checkerboard pattern where no two
 * extensions are directly adjacent (share an edge). This ensures creeps
 * can always move between extensions without blocking each other.
 *
 * Addresses Issue: #17
 */

import type { StructurePlacement } from "./blueprints/types";
import { createLogger } from "../core/logger";

const logger = createLogger("ExtensionGenerator");

/**
 * Maximum number of extension positions to generate.
 * Set higher than 60 (the RCL 8 limit) to provide flexibility when
 * some positions are blocked by terrain or other structures.
 */
const MAX_GENERATED_EXTENSIONS = 80;

/**
 * Generate extension positions in a checkerboard pattern.
 * 
 * The pattern ensures:
 * - No extension is directly adjacent to another extension
 * - Every extension is reachable via roads/empty spaces
 * - Extensions are placed in expanding rings from the spawn
 * 
 * Positions where (|x| + |y|) % 2 == 0 form a checkerboard pattern
 * that leaves space for roads between extensions.
 */
export function generateExtensions(count: number): StructurePlacement[] {
  const extensions: StructurePlacement[] = [];
  
  // Checkerboard pattern - positions are arranged so no extensions
  // share an edge (only potentially corners)
  // Pattern: place extensions where (x + y) is even to create checkerboard
  const pattern: {x: number, y: number}[] = [
    // Ring 1 (distance 2 from spawn) - 4 positions
    { x: -2, y: 0 }, { x: 2, y: 0 },
    { x: 0, y: -2 }, { x: 0, y: 2 },
    
    // Ring 2 (distance 2-3) - extensions at odd distances with even sum
    { x: -2, y: -2 }, { x: 2, y: -2 },
    { x: -2, y: 2 }, { x: 2, y: 2 },
    { x: -1, y: -3 }, { x: 1, y: -3 },
    { x: -1, y: 3 }, { x: 1, y: 3 },
    { x: -3, y: -1 }, { x: 3, y: -1 },
    { x: -3, y: 1 }, { x: 3, y: 1 },
    
    // Ring 3 (distance 3-4) - extending the checkerboard
    { x: -4, y: 0 }, { x: 4, y: 0 },
    { x: 0, y: -4 }, { x: 0, y: 4 },
    { x: -3, y: -3 }, { x: 3, y: -3 },
    { x: -3, y: 3 }, { x: 3, y: 3 },
    { x: -4, y: -2 }, { x: 4, y: -2 },
    { x: -4, y: 2 }, { x: 4, y: 2 },
    { x: -2, y: -4 }, { x: 2, y: -4 },
    { x: -2, y: 4 }, { x: 2, y: 4 },
    
    // Ring 4 (distance 4-5)
    { x: -1, y: -5 }, { x: 1, y: -5 },
    { x: -1, y: 5 }, { x: 1, y: 5 },
    { x: -5, y: -1 }, { x: 5, y: -1 },
    { x: -5, y: 1 }, { x: 5, y: 1 },
    { x: -4, y: -4 }, { x: 4, y: -4 },
    { x: -4, y: 4 }, { x: 4, y: 4 },
    { x: -3, y: -5 }, { x: 3, y: -5 },
    { x: -3, y: 5 }, { x: 3, y: 5 },
    { x: -5, y: -3 }, { x: 5, y: -3 },
    { x: -5, y: 3 }, { x: 5, y: 3 },
    
    // Ring 5 (distance 5-6) - outer ring for max extensions
    { x: -6, y: 0 }, { x: 6, y: 0 },
    { x: 0, y: -6 }, { x: 0, y: 6 },
    { x: -6, y: -2 }, { x: 6, y: -2 },
    { x: -6, y: 2 }, { x: 6, y: 2 },
    { x: -2, y: -6 }, { x: 2, y: -6 },
    { x: -2, y: 6 }, { x: 2, y: 6 },
    { x: -5, y: -5 }, { x: 5, y: -5 },
    { x: -5, y: 5 }, { x: 5, y: 5 },
    { x: -4, y: -6 }, { x: 4, y: -6 },
    { x: -4, y: 6 }, { x: 4, y: 6 },
    { x: -6, y: -4 }, { x: 6, y: -4 },
    { x: -6, y: 4 }, { x: 6, y: 4 }
  ];
  
  for (let i = 0; i < Math.min(count, pattern.length); i++) {
    extensions.push({
      x: pattern[i].x,
      y: pattern[i].y,
      structureType: STRUCTURE_EXTENSION
    });
  }
  
  return extensions;
}

/**
 * Check if a position is valid for an extension in a checkerboard pattern.
 * Exported for use in validating layout positions.
 * 
 * The rule is: |x| + |y| must be even (0, 2, 4, etc.)
 * This ensures no two extensions share an edge (only potentially corners).
 */
export function isCheckerboardPosition(x: number, y: number): boolean {
  // Positions where (|x| + |y|) is even form a valid checkerboard pattern
  // This ensures no two extensions are directly adjacent (share an edge)
  return (Math.abs(x) + Math.abs(y)) % 2 === 0;
}

/**
 * Add extensions to a blueprint to reach target count.
 * 
 * Uses checkerboard pattern validation to ensure new extensions
 * maintain proper spacing for creep movement.
 */
export function addExtensionsToBlueprint(
  existingStructures: StructurePlacement[],
  targetCount: number
): StructurePlacement[] {
  // Count existing extensions
  const existingExtensions = existingStructures.filter(
    s => s.structureType === STRUCTURE_EXTENSION
  );
  
  const needed = targetCount - existingExtensions.length;
  if (needed <= 0) return existingStructures;
  
  // Generate all possible extension positions
  const allExtensions = generateExtensions(MAX_GENERATED_EXTENSIONS);
  
  // Filter out positions already used by existing structures
  const usedPositions = new Set(
    existingStructures.map(s => `${s.x},${s.y}`)
  );
  
  const newExtensions = allExtensions
    .filter(ext => !usedPositions.has(`${ext.x},${ext.y}`))
    .slice(0, needed);
  
  return [...existingStructures, ...newExtensions];
}
