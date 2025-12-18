/**
 * TooAngel Memory Initialization
 * 
 * Centralizes memory initialization to avoid duplication across modules
 */

import type { TooAngelMemory, TooAngelReputation } from "./types";

/**
 * Get or initialize TooAngel memory
 * Ensures consistent initialization across all modules
 */
export function getTooAngelMemory(): TooAngelMemory {
  const mem = Memory as { tooangel?: TooAngelMemory };
  
  if (!mem.tooangel) {
    mem.tooangel = {
      enabled: true,
      reputation: {
        value: 0,
        lastUpdated: 0
      },
      npcRooms: {},
      activeQuests: {},
      completedQuests: [],
      lastProcessedTick: 0
    };
  }
  
  // Ensure all required fields exist
  if (!mem.tooangel.reputation) {
    mem.tooangel.reputation = {
      value: 0,
      lastUpdated: 0
    };
  }
  
  if (!mem.tooangel.npcRooms) {
    mem.tooangel.npcRooms = {};
  }
  
  if (!mem.tooangel.activeQuests) {
    mem.tooangel.activeQuests = {};
  }
  
  if (!mem.tooangel.completedQuests) {
    mem.tooangel.completedQuests = [];
  }

  return mem.tooangel;
}
