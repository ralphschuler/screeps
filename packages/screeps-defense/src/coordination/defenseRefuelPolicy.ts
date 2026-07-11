/**
 * Emergency energy policy for helper rooms spawning defense reinforcements.
 *
 * A terminal may be tapped only during an active defense-refuel assignment and
 * only above a bounded floor. The fixed CARRY/MOVE refuel body withdraws at
 * most 100 energy per action, so one action cannot cross the reserve floor.
 */
export const DEFENSE_REFUEL_TERMINAL_FLOOR_ENERGY = 5_000;
const DEFENSE_REFUEL_HAULER_CAPACITY = 100;

export function hasEmergencyDefenseRefuelEnergy(
  terminal: StructureTerminal | null | undefined,
): boolean {
  const energy = terminal?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
  return energy >= DEFENSE_REFUEL_TERMINAL_FLOOR_ENERGY + DEFENSE_REFUEL_HAULER_CAPACITY;
}
