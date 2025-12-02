/**
 * Extension Generator
 *
 * Generates extension positions in a spiral pattern around the spawn
 * to fill out the full 60 extensions allowed at RCL 8.
 *
 * Addresses Issue: #17
 */

import type { StructurePlacement } from "./blueprints";

/**
 * Generate extension positions in a spiral pattern
 */
export function generateExtensions(count: number): StructurePlacement[] {
  const extensions: StructurePlacement[] = [];
  
  // Start with a tight cluster around spawn
  const pattern: {x: number, y: number}[] = [
    // Ring 1 (4 positions)
    { x: -1, y: -1 }, { x: 1, y: -1 },
    { x: -1, y: 1 }, { x: 1, y: 1 },
    
    // Ring 2 (8 positions)
    { x: 0, y: -2 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 },
    { x: -2, y: -1 }, { x: 2, y: -1 }, { x: -2, y: 1 }, { x: 2, y: 1 },
    
    // Ring 3 (12 positions)
    { x: -2, y: -2 }, { x: 2, y: -2 }, { x: -2, y: 2 }, { x: 2, y: 2 },
    { x: -1, y: -2 }, { x: 1, y: -2 }, { x: -1, y: 2 }, { x: 1, y: 2 },
    { x: -3, y: -1 }, { x: -3, y: 1 }, { x: 3, y: -1 }, { x: 3, y: 1 },
    
    // Ring 4 (16 positions)
    { x: -3, y: -2 }, { x: 3, y: -2 }, { x: -3, y: 2 }, { x: 3, y: 2 },
    { x: -1, y: -3 }, { x: 1, y: -3 }, { x: -1, y: 3 }, { x: 1, y: 3 },
    { x: -3, y: -3 }, { x: 3, y: -3 }, { x: -3, y: 3 }, { x: 3, y: 3 },
    { x: -2, y: -3 }, { x: 2, y: -3 }, { x: -2, y: 3 }, { x: 2, y: 3 },
    
    // Ring 5 (20 positions)
    { x: 0, y: -4 }, { x: -4, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 },
    { x: -4, y: -1 }, { x: -4, y: 1 }, { x: 4, y: -1 }, { x: 4, y: 1 },
    { x: -1, y: -4 }, { x: 1, y: -4 }, { x: -1, y: 4 }, { x: 1, y: 4 },
    { x: -4, y: -2 }, { x: -4, y: 2 }, { x: 4, y: -2 }, { x: 4, y: 2 },
    { x: -2, y: -4 }, { x: 2, y: -4 }, { x: -2, y: 4 }, { x: 2, y: 4 },
    
    // Ring 6 (24 positions)
    { x: -4, y: -3 }, { x: -4, y: 3 }, { x: 4, y: -3 }, { x: 4, y: 3 },
    { x: -3, y: -4 }, { x: 3, y: -4 }, { x: -3, y: 4 }, { x: 3, y: 4 },
    { x: -4, y: -4 }, { x: 4, y: -4 }, { x: -4, y: 4 }, { x: 4, y: 4 },
    { x: 0, y: -5 }, { x: -5, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 5 },
    { x: -5, y: -1 }, { x: -5, y: 1 }, { x: 5, y: -1 }, { x: 5, y: 1 },
    { x: -1, y: -5 }, { x: 1, y: -5 }, { x: -1, y: 5 }, { x: 1, y: 5 }
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
 * Add extensions to a blueprint to reach target count
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
  const allExtensions = generateExtensions(60);
  
  // Filter out positions already used by existing structures
  const usedPositions = new Set(
    existingStructures.map(s => `${s.x},${s.y}`)
  );
  
  const newExtensions = allExtensions
    .filter(ext => !usedPositions.has(`${ext.x},${ext.y}`))
    .slice(0, needed);
  
  return [...existingStructures, ...newExtensions];
}
